import { keymap } from '@codemirror/view';
import { MarkEdit, type MenuItem, type Point, type LanguageModelResponse } from 'markedit-api';
import { keyboardShortcut, showsTooltip, streaming, instructions, generationOptions, customWriters } from './src/settings';
import { createTooltip, updateTooltip, hideTooltip } from './src/tooltip';
import { startLoading, stopLoading } from './src/loading';
import { defaultWriters, type Writer } from './src/writers';

const editorAPI = MarkEdit.editorAPI;
const languageModel = MarkEdit.languageModel('Apple-Foundation-Models');
const sharedSession = (async() => await languageModel.createSession({ instructions }))();

const menuItems: MenuItem[] = [
  {
    title: 'Propose Change',
    icon: 'character.cursor.ibeam',
    action: async() => {
      const prompt = await MarkEdit.showTextBox({ title: 'Describe your change' });
      if (prompt !== undefined) {
        await respondTo(prompt);
      }
    },
  },
  { separator: true },
  ...createItems(defaultWriters),
  { separator: true },
  ...createItems(customWriters),
];

MarkEdit.addMainMenuItem({
  title: 'AI Writer',
  icon: 'sparkles',
  children: [
    ...menuItems,
    { separator: true },
    {
      title: 'Version 1.0.0',
      state: () => ({ isEnabled: false }),
    },
    {
      title: 'Check Releases (GitHub)',
      action: () => open('https://github.com/MarkEdit-app/MarkEdit-ai-writer/releases/latest'),
    },
  ],
});

MarkEdit.addExtension(keymap.of([{
  key: keyboardShortcut,
  run: () => {
    showContextMenu();
    return true;
  },
}]));

if (showsTooltip) {
  createTooltip(event => {
    const scale = window.visualViewport?.scale ?? 1.0;
    const location = { x: (event.clientX - 8) * scale, y: (event.clientY - 8) * scale };
    showContextMenu(location);
  });
}

async function respondTo(input: string) {
  const availability = await languageModel.availability();
  if (availability.unavailableReason !== undefined) {
    const message = availability.unavailableReason === 'Model Not Ready' ? 'The model is being downloaded, please try again later.' : 'The model is not available, please visit the Apple official website for more information.';
    MarkEdit.showAlert({
      title: availability.unavailableReason,
      message: message,
    });
    return;
  }

  const session = await sharedSession;
  if (await session.isResponding()) {
    MarkEdit.showAlert({
      title: 'Session Busy',
      message: 'The session is handling another request at the moment.',
    });
    return;
  }

  startLoading();
  const prompt = createPrompt(input);
  if (streaming) {
    session.streamResponseTo(prompt, generationOptions, handleResponse);
  } else {
    handleResponse(await session.respondTo(prompt, generationOptions));
  }
}

function handleResponse(response: LanguageModelResponse) {
  if (response.error !== undefined) {
    MarkEdit.showAlert({
      title: 'Request Failed',
      message: response.error,
    });
  } else if (response.content !== undefined) {
    editorAPI.setText(response.content, selectionRange());
  }

  if (response.done) {
    stopLoading();
    updateTooltip();
  }
}

function createItems(items: Writer[]): MenuItem[] {
  return items.filter(item => item.title && item.prompt).map(item => ({
    title: item.title,
    icon: item.icon,
    action: () => respondTo(item.prompt),
  }));
}

function showContextMenu(location?: Point) {
  hideTooltip();
  MarkEdit.showContextMenu(menuItems, location);
}

function selectionRange() {
  return editorAPI.getSelections()[0];
}

function createPrompt(input: string) {
  const selection = editorAPI.getText(selectionRange());
  return selection.length > 0 ? `${input}\n\n${selection}` : input;
}
