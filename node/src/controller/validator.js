import fs from "fs";

export const validatorExtract = (error, schema) => {
  const keys = Object.keys(error?.errors);
  const errors = {};
  for (const key of keys) {
    if (error?.errors[key]?.message === "NOTUNIQUE") {
      errors[key] = schema[key]?.unique[1];
    } else {
      errors[key] = error?.errors[key]?.message;
    }
  }
  return errors;
};

export const createSchemaFromTextFile = (collection) => {
  try {
    const data = fs.readFileSync("src/schema/" + collection + ".json", "utf8");
    let dataObject = JSON.parse(data);
    let schema = dataObject?.schema;
    let pages = dataObject?.pages;
    let keys = Object.keys(schema);
    for (const key of keys) {
      if (schema[key]?.match?.[0] !== undefined) {
        switch (schema[key]?.match?.[0]) {
          case "EMAIL":
            schema[key].match[0] = /^\S+@\S+\.\S+$/;
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
  } catch (error) {
    console.log("File not found: " + collection + ".txt");
    return { schema: null, pages: null };
  }
};
