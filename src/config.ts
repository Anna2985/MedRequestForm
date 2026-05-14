export const getApiDomain = (): string => {
  if (!(window as any).API_DOMAIN) {
    throw new Error('API_DOMAIN not configured. Please check config.txt');
  }
  return (window as any).API_DOMAIN;
};

export const getHomepage = (): string => {
  if (!(window as any).HOMEPAGE) {
    throw new Error('HOMEPAGE not configured. Please check config.txt');
  }
  return (window as any).HOMEPAGE;
};

export const getAiApi = (): string => {
  if (!(window as any).AI_API) {
    throw new Error('AI_API not configured. Please check config.txt');
  }
  return (window as any).AI_API;
};