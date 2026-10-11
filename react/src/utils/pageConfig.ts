export type PageConfig = Record<string, unknown>;

export const isPageConfig = (value: unknown): value is PageConfig =>
  typeof value === "object" && value !== null && !Array.isArray(value);

export const getPageText = (pages: unknown, key: string): string => {
  if (!isPageConfig(pages) || !(key in pages)) {
    return "";
  }

  const value = pages[key];
  return typeof value === "string" ? value : "";
};
