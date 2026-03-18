export const normalizePath = (path: string): string => {
  const normalized = path.replace(/\/+$/, '');
  return normalized || '/';
};

export const getBasePath = (): string => {
  return normalizePath(import.meta.env.BASE_URL || '/');
};

export const getAppPath = (pathname: string): string => {
  const normalizedPathname = normalizePath(pathname);
  const basePath = getBasePath();

  if (basePath === '/') {
    return normalizedPathname;
  }

  if (normalizedPathname === basePath) {
    return '/';
  }

  if (normalizedPathname.startsWith(`${basePath}/`)) {
    const relativePath = normalizedPathname.slice(basePath.length);
    return normalizePath(relativePath);
  }

  return normalizedPathname;
};

export const toAppUrl = (path: string): string => {
  const normalizedPath = normalizePath(path);
  const basePath = getBasePath();

  if (basePath === '/') {
    return normalizedPath;
  }

  if (normalizedPath === '/') {
    return `${basePath}/`;
  }

  return `${basePath}${normalizedPath}`;
};

export const navigateTo = (path: string): void => {
  const nextPath = toAppUrl(path);

  if (normalizePath(window.location.pathname) === normalizePath(nextPath)) {
    return;
  }

  window.history.pushState({}, '', nextPath);
  window.dispatchEvent(new PopStateEvent('popstate'));
};