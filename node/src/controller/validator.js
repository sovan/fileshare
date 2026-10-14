import fs from "node:fs";

export const validatorExtracts = (error, schema = {}, uniqueIndex = []) => {
  const validationErrors =
    error?.errors && typeof error.errors === "object" ? error.errors : {};
  const configuredUniqueIndexes = Array.isArray(uniqueIndex) ? uniqueIndex : [];

  console.log("start----------------------------");
  console.log(validationErrors);
  console.log(configuredUniqueIndexes);
  console.log("end----------------------------");
};

export const validatorExtract = (error, schema = {}, uniqueIndex = []) => {
  const validationErrors =
    error?.errors && typeof error.errors === "object" ? error.errors : {};
  const configuredUniqueIndexes = Array.isArray(uniqueIndex) ? uniqueIndex : [];

  console.log("start----------------------------");
  console.log(validationErrors);
  console.log(configuredUniqueIndexes);
  console.log(error?.code);

  const errors = {};
  for (const [key, validationError] of Object.entries(validationErrors)) {
    console.log(JSON.stringify(configuredUniqueIndexes));

    if (validationError?.message === "NOTUNIQUE") {
      const find = configuredUniqueIndexes.find(
        (eachIndex) =>
          Array.isArray(eachIndex?.error?.show) &&
          eachIndex.error.show.includes(key),
      );
      errors[key] =
        schema[key]?.unique?.[1] ??
        find?.error?.msg ??
        "This value already exists.";
    } else {
      errors[key] = validationError?.message ?? String(validationError);
    }
  }

  if (error?.code === 11000) {
    console.log(JSON.stringify(configuredUniqueIndexes));

    const duplicateFields =
      error.keyValue && typeof error.keyValue === "object"
        ? Object.keys(error.keyValue)
        : Object.keys(error.keyPattern ?? {});
    console.log(JSON.stringify(duplicateFields));
    for (const key of duplicateFields) {
      const index = configuredUniqueIndexes.find(
        (eachIndex) =>
          Array.isArray(eachIndex?.error?.show) &&
          eachIndex.error.show.includes(key),
      );
      errors[key] =
        schema[key]?.unique?.[1] ??
        index?.error?.msg ??
        "This value already exists.";
    }
  }
  console.log("end----------------------------");
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
  const uniqueIndex = dataObject?.uniqueIndex || undefined;
  if (schema == null) {
    return { schema: null, pages, rawSchema: schema };
  }
  if (typeof schema !== "object" || Array.isArray(schema)) {
    throw new Error(
      `Invalid schema definition for collection "${collection}".`,
    );
  }

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
        case "ALPHABET":
          schema[key].match[0] = /^[a-zA-Z]+$/;
          break;
        case "PASSWORD":
          schema[key].match[0] =
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
          break;
        case "URL":
          schema[key].match[0] = /^[a-z\/]+$/;
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
  return {
    schema,
    pages,
    uniqueIndex,
    rawSchema: dataObject?.schema,
  };
};
