export type TableActionType = "delete" | "edit" | "view" | "api";
export type TableActionMethod = "POST" | "PUT" | "PATCH" | "DELETE";

export type TableButtonConfig = {
  id: string;
  type: TableActionType;
  label: string;
  icon?: string;
  variant?: string;
  ariaLabel?: string;
  tooltip?: string;
  endpoint?: string;
  method?: TableActionMethod;
  successMessage?: string;
};

const actionTypes: TableActionType[] = ["delete", "edit", "view", "api"];
const actionMethods: TableActionMethod[] = ["POST", "PUT", "PATCH", "DELETE"];

export const getTableButtons = (value: unknown): TableButtonConfig[] => {
  if (!Array.isArray(value)) return [];

  const buttons = value.map((item, index) => {
    if (
      typeof item !== "object" ||
      item === null ||
      Array.isArray(item) ||
      !("id" in item) ||
      typeof item.id !== "string" ||
      !item.id.trim() ||
      !("type" in item) ||
      typeof item.type !== "string" ||
      !actionTypes.includes(item.type as TableActionType) ||
      !("label" in item) ||
      typeof item.label !== "string" ||
      (item.icon !== undefined && typeof item.icon !== "string") ||
      (item.variant !== undefined && typeof item.variant !== "string") ||
      (item.ariaLabel !== undefined && typeof item.ariaLabel !== "string") ||
      (item.tooltip !== undefined && typeof item.tooltip !== "string") ||
      (item.endpoint !== undefined && typeof item.endpoint !== "string") ||
      (item.method !== undefined &&
        (typeof item.method !== "string" ||
          !actionMethods.includes(item.method as TableActionMethod))) ||
      (item.successMessage !== undefined &&
        typeof item.successMessage !== "string")
    ) {
      throw new Error(`Invalid table button configuration at index ${index}.`);
    }
    if (
      item.type === "api" &&
      (!item.endpoint ||
        !item.method ||
        !actionMethods.includes(item.method as TableActionMethod))
    ) {
      throw new Error(
        `API table button "${item.id}" requires an endpoint and valid method.`,
      );
    }

    return item as TableButtonConfig;
  });

  const ids = new Set<string>();
  for (const button of buttons) {
    if (ids.has(button.id)) {
      throw new Error(`Duplicate table button id "${button.id}".`);
    }
    ids.add(button.id);
  }
  return buttons;
};
