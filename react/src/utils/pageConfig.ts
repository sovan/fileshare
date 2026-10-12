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

export const getPageVariant = (
  pages: PageConfig,
  key: string,
  fallback: string,
): string => getPageText(pages, key) || fallback;

type ModalButtonAlignmentKey =
  | "addModalButtonAlignment"
  | "editModalButtonAlignment"
  | "deleteModalButtonAlignment"
  | "viewModalButtonAlignment";

export const getModalButtonAlignmentClass = (
  pages: PageConfig,
  key: ModalButtonAlignmentKey,
): string => {
  switch (pages[key]) {
    case "left":
      return "justify-content-start";
    case "center":
      return "justify-content-center";
    case "right":
    default:
      return "justify-content-end";
  }
};
