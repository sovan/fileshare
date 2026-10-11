export const formatDateTime = (
  value: string | number | Date,
  format: string,
): string => {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);

  const hour = date.getHours();
  const tokens: Record<string, string> = {
    YYYY: String(date.getFullYear()),
    MM: String(date.getMonth() + 1).padStart(2, "0"),
    DD: String(date.getDate()).padStart(2, "0"),
    hh: String(hour % 12 || 12).padStart(2, "0"),
    mm: String(date.getMinutes()).padStart(2, "0"),
    ss: String(date.getSeconds()).padStart(2, "0"),
    A: hour < 12 ? "AM" : "PM",
  };

  return format.replace(/YYYY|MM|DD|hh|mm|ss|A/g, (token) => tokens[token]);
};
