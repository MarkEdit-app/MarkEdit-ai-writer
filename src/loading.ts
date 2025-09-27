const styleSheet = document.createElement('style');
document.head.append(styleSheet);

styleSheet.textContent = '* { cursor: progress !important }';
styleSheet.disabled = true;

export function startLoading() {
  styleSheet.disabled = false;
}

export function stopLoading() {
  styleSheet.disabled = true;
}

export function isLoading() {
  return !styleSheet.disabled;
}
