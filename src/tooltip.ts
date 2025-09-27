import { EditorView, showTooltip, type Tooltip } from '@codemirror/view';
import { StateField, type EditorState } from '@codemirror/state';
import { MarkEdit } from 'markedit-api';
import { keyboardShortcut } from './settings';
import { isLoading } from './loading';
import { colors } from './colors';

export function createTooltip(onclick: (event: PointerEvent) => void) {
  const tooltipField = StateField.define<readonly Tooltip[]>({
    create: createTooltips,
    update: (tooltips, transaction) => {
      if (!transaction.docChanged && !transaction.selection) {
        return tooltips;
      }

      return createTooltips(transaction.state);
    },
    provide: field => showTooltip.computeN([field], state => state.field(field)),
  });

  function createTooltips(state: EditorState): Tooltip[] {
    const range = state.selection.main;
    if (range.empty || state.sliceDoc(range.from, range.to).trim().length === 0) {
      return [];
    }

    return [
      {
        pos: range.head,
        above: false,
        strictSide: true,
        arrow: true,
        create: () => {
          const div = document.createElement('div');
          div.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="12" height="15" xmlns:v="https://vecta.io/nano"><path d="M6.895 15c-.082 0-.152-.027-.211-.082a.36.36 0 0 1-.107-.22l-.321-1.812c-.115-.489-.267-.891-.457-1.207s-.44-.568-.749-.756-.703-.341-1.181-.457-1.067-.22-1.768-.312c-.095-.009-.171-.044-.227-.105a.32.32 0 0 1-.084-.224.31.31 0 0 1 .084-.217c.056-.061.132-.096.227-.105l1.771-.283c.48-.11.876-.261 1.187-.454s.562-.449.752-.769.343-.727.457-1.22.217-1.101.308-1.825c.013-.088.049-.159.107-.214s.129-.082.211-.082.158.027.214.082.093.126.11.214l.308 1.825c.115.493.266.9.454 1.22s.438.577.749.769.707.344 1.187.454 1.072.204 1.777.283a.33.33 0 0 1 .221.105.31.31 0 0 1 .084.217.32.32 0 0 1-.084.224.33.33 0 0 1-.221.105l-1.777.283c-.48.11-.876.26-1.187.45s-.561.446-.749.766-.339.728-.454 1.223-.217 1.103-.308 1.822c-.017.092-.054.165-.11.22S6.982 15 6.895 15zM2.497 7.727c-.13 0-.203-.072-.221-.217l-.165-1.032c-.058-.25-.151-.437-.279-.562s-.318-.22-.571-.286-.6-.136-1.041-.21C.074 5.397 0 5.322 0 5.195S.065 5 .195 4.978l1.051-.233c.255-.068.448-.163.577-.286s.225-.306.285-.549.117-.584.169-1.023c.017-.145.091-.217.221-.217s.203.07.221.21l.172 1.046c.058.254.151.446.279.575s.319.225.574.286.608.125 1.057.191c.056.004.103.026.139.066s.055.09.055.151c0 .123-.065.197-.195.224l-1.054.233c-.253.068-.443.164-.571.289s-.222.31-.282.556-.119.587-.175 1.026c-.009.057-.032.105-.071.145a.2.2 0 0 1-.149.059zm3.139-4.524c-.082 0-.13-.044-.143-.132l-.133-.631a.77.77 0 0 0-.169-.352c-.076-.081-.191-.146-.347-.194a5.45 5.45 0 0 0-.655-.145c-.086-.018-.13-.068-.13-.151s.043-.127.13-.145l.655-.148a.76.76 0 0 0 .347-.191.77.77 0 0 0 .169-.352l.133-.631C5.507.044 5.555 0 5.637 0s.125.044.143.132l.13.631c.039.153.096.271.172.352a.76.76 0 0 0 .347.191c.156.046.374.095.655.148.086.018.13.066.13.145s-.043.134-.13.151l-.655.145c-.156.048-.271.113-.347.194s-.133.198-.172.352l-.13.631c-.017.088-.065.132-.143.132z" fill="currentColor"/></svg>';
          div.className = nodeClass;
          div.title = 'AI Writer' + (keyboardShortcut === 'Mod-Alt-/' ? ' (Option-Command-/)' : '');
          div.ariaLabel = div.title;
          div.onclick = onclick;
          return { dom: div, offset: { x: 2, y: 0 } };
        },
      },
    ];
  }

  MarkEdit.addExtension([tooltipField, tooltipTheme]);
}

export function updateTooltip(event?: Event) {
  if (isLoading()) {
    return;
  }

  if (event && (event.target as HTMLElement | null)?.closest(`.${nodeClass}`) !== null) {
    return;
  }

  if (states.timeoutId !== undefined) {
    clearTimeout(states.timeoutId);
  }

  states.timeoutId = setTimeout(() => {
    updateClassList(list => list.add(visibleClass));
  }, 300);
}

export function hideTooltip() {
  updateClassList(list => list.remove(visibleClass));
}

function updateClassList(callback: (list: DOMTokenList) => void) {
  document.querySelectorAll(`.${nodeClass}`).forEach(node => callback(node.classList));
  MarkEdit.editorView.focus(); // Always put focus on the editor
}

const states: { timeoutId?: ReturnType<typeof setTimeout> } = {};
const nodeClass = 'cm-tooltip-selection';
const visibleClass = 'visible';

const tooltipTheme = EditorView.baseTheme({
  '.cm-tooltip-arrow': {
    top: '-5px !important',
    left: '5px !important',
  },
  '.cm-tooltip.cm-tooltip-selection': {
    opacity: '0',
    transform: 'scale(0.6)',
    pointerEvents: 'none',
    transition: 'opacity 0.2s ease, transform 0.2s cubic-bezier(0.68, -0.55, 0.27, 1.55)',
    cursor: 'pointer',
    padding: '3px 6px 0px 6px',
    border: 'none',
    borderRadius: '5px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.16), 0 8px 24px rgba(0, 0, 0, 0.12)',
    color: colors.white,
    '& .cm-tooltip-arrow:after': {
      borderBottomColor: 'transparent',
    },
    backgroundColor: colors.blue1,
    '& .cm-tooltip-arrow:before': {
      borderBottomColor: colors.blue1,
    },
  },
  '.cm-tooltip.cm-tooltip-selection.visible': {
    opacity: '1',
    transform: 'scale(1)',
    pointerEvents: 'auto',
  },
  '.cm-tooltip.cm-tooltip-selection:active': {
    color: colors.gray,
  },
  '.cm-tooltip.cm-tooltip-selection:hover': {
    backgroundColor: colors.blue3,
    '& .cm-tooltip-arrow:before': {
      borderBottomColor: colors.blue3,
    },
  },
  '&dark .cm-tooltip.cm-tooltip-selection': {
    backgroundColor: colors.blue2,
    '& .cm-tooltip-arrow:before': {
      borderBottomColor: colors.blue2,
    },
  },
  '&dark .cm-tooltip.cm-tooltip-selection:hover': {
    backgroundColor: colors.blue4,
    '& .cm-tooltip-arrow:before': {
      borderBottomColor: colors.blue4,
    },
  },
});

document.addEventListener('mouseup', updateTooltip);
document.addEventListener('keyup', updateTooltip);
document.addEventListener('contextmenu', hideTooltip);
