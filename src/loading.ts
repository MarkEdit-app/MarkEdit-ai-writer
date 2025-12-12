const selector = '.cm-selectionBackground';
const states: { isLoading: boolean } = { isLoading: false };

const styleSheet = document.createElement('style');
styleSheet.textContent = `${selector} { transition: opacity 0.4s; }`;
document.head.append(styleSheet);

export function startLoading() {
  states.isLoading = true;
  updateClassList();
}

export function stopLoading() {
  states.isLoading = false;
  updateClassList();
}

export function isLoading() {
  return states.isLoading;
}

function updateClassList() {
  const layers: HTMLElement[] = Array.from(document.querySelectorAll(selector));
  for (const layer of layers) {
    layer.style.opacity = states.isLoading ? '0.4' : '1.0';
  }
}
