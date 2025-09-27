export type Writer = {
  title: string;
  icon?: string;
  prompt: string;
};

export const defaultWriters: Writer[] = [
  {
    title: 'Automatic Rewrite',
    icon: 'wand.and.sparkles',
    prompt: 'Rewrite the following text to make it clearer and more natural, preserving its original meaning:',
  },
  {
    title: 'Elaborate',
    icon: 'text.badge.plus',
    prompt: 'Expand the following text, adding details, explanations, and examples while keeping the meaning consistent:',
  },
  {
    title: 'Summarize',
    icon: 'text.badge.minus',
    prompt: 'Summarize the following text in fewer words, keeping only the essential ideas:',
  },
  {
    title: 'Clear Formatting',
    icon: 'eraser',
    prompt: 'Remove all Markdown formatting from the following text and return plain, unformatted text only:',
  },
];
