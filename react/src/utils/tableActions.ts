export type TableActionType = "delete" | "edit" | "view" | "api" | "navigate";
export type TableActionMethod = "POST" | "PUT" | "PATCH" | "DELETE" | "GET";

export type TableButtonConfig = {
  id: string;
  type: TableActionType;
  label: string;
  icon?: string;
  variant?: string;
  ariaLabel?: string;
  tooltip?: string;
  showLabel?: boolean;
  showLable?: boolean;
  endpoint?: string;
  method?: TableActionMethod;
  successMessage?: string;
};

const actionMethods: TableActionMethod[] = [
  "POST",
  "PUT",
  "PATCH",
  "DELETE",
  "GET",
];

export const getTableButtons = (value: unknown): TableButtonConfig[] => {
  if (!Array.isArray(value)) return [];

  const buttons = value.map((item) => {
    if (
      (item.type === "api" || item.type === "navigate") &&
      (!item.endpoint || typeof item.endpoint !== "string")
    ) {
      throw new Error(
        `Table button "${item.id}" of type "${item.type}" requires an endpoint string.`,
      );
    }

    if (
      item.type === "api" &&
      (!item.method || !actionMethods.includes(item.method as TableActionMethod))
    ) {
      throw new Error(
        `API table button "${item.id}" requires a valid method.`,
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
