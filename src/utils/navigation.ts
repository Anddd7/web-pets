export const normalizePath = (path: string): string => {
  const normalized = path.replace(/\/+$/, '');
  return normalized || '/';
};

export const navigateTo = (path: string): void => {
  const nextPath = normalizePath(path);

  if (normalizePath(window.location.pathname) === nextPath) {
    return;
  }

  window.history.pushState({}, '', nextPath);
  window.dispatchEvent(new PopStateEvent('popstate'));
};