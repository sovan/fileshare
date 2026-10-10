import fs from "node:fs";

export const validatorExtract = (error, schema = {}) => {
  const validationErrors = error.errors;

  const errors = {};
  for (const [key, validationError] of Object.entries(validationErrors)) {
    if (validationError?.message === "NOTUNIQUE") {
      errors[key] = schema[key]?.unique?.[1] ?? "This value already exists.";
    } else {
      errors[key] = validationError?.message ?? String(validationError);
    }
  }

  if (error?.code === 11000) {
    const duplicateFields =
      error.keyValue && typeof error.keyValue === "object"
        ? Object.keys(error.keyValue)
        : Object.keys(error.keyPattern ?? {});
    for (const key of duplicateFields) {
      errors[key] = schema[key]?.unique?.[1] ?? "This value already exists.";
    }
  }

  if (Object.keys(errors).length > 0) return errors;

  return {
    error: "Unable to process the request.",
  };
};

export const createSchemaFromTextFile = (collection) => {
  let data;
  try {
    data = fs.readFileSync("src/schema/" + collection + ".json", "utf8");
  } catch (error) {
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      error.code === "ENOENT"
    ) {
      return { schema: null, pages: null };
    }
    throw error;
  }

  const dataObject = JSON.parse(data);
  const schema = dataObject?.schema;
  const pages = dataObject?.pages;
  const keys = Object.keys(schema);
  for (const key of keys) {
    if (schema[key]?.match?.[0] !== undefined) {
      switch (schema[key]?.match?.[0]) {
        case "EMAIL":
          schema[key].match[0] = /^[^@\s]+@[^@\s.]+(?:\.[^@\s.]+)+$/;
          break;
        case "ALPHA":
          schema[key].match[0] = /^[a-zA-Z\s]+$/;
          break;
        case "PASSWORD":
          schema[key].match[0] =
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
          break;
        default:
          break;
      }
    }

    if (schema[key]?.default !== undefined) {
      switch (schema[key]?.default) {
        case "DATENOW":
          schema[key].default = Date.now();
          break;
        case "DATEAFTER":
          schema[key].default = Date.now() + schema[key]["MILISEC"];
          delete schema[key]["MILISEC"];
          break;
        default:
          break;
      }
    }
  }
  return { schema, pages, rawSchema: JSON.parse(data)?.schema };
};
