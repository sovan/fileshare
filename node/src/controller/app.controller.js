import {
  findData,
  findOneData,
  insertData,
  findAndUpdateData,
  removeData,
} from "#model/app.model.js";
import mongoose from "mongoose";
import uniqueValidator from "mongoose-unique-validator";
import { createSchemaFromTextFile } from "#controller/validator.js";
import { randomBytes } from "node:crypto";
let mongooseObject = {};

export const list = async (req, res) => {
  const collection = req.params.one;
  const { columns, pageSize, sortableFields, defaultSort } = createSchema(
    collection,
    "list",
  );
  const requestedPage =
    typeof req.query.page === "string" ? Number(req.query.page) : 1;
  const page =
    Number.isSafeInteger(requestedPage) && requestedPage > 0
      ? requestedPage
      : 1;
  let sort = defaultSort;
  if (req.query.sortBy !== undefined || req.query.sortOrder !== undefined) {
    const { sortBy, sortOrder } = req.query;
    if (
      typeof sortBy !== "string" ||
      !sortableFields.includes(sortBy) ||
      (sortOrder !== "asc" && sortOrder !== "desc")
    ) {
      const error = new Error("Invalid sort field or direction.");
      error.status = 400;
      throw error;
    }
    sort = { [sortBy]: sortOrder === "asc" ? 1 : -1 };
  }
  const list = await findData(
    mongooseObject[collection],
    {},
    columns,
    page,
    pageSize,
    sort,
  );
  responseData(res, list);
};

export const view = async (req, res) => {
  const [collection, _id] = [req.params.one, req.params.two];
  const { columns } = createSchema(collection, "view");
  const view = await findOneData(mongooseObject[collection], { _id }, columns);
  responseData(res, view);
};

export const edit = async (req, res) => {
  const [collection, _id] = [req.params.one, req.params.two];
  const { columns } = createSchema(collection, "edit");
  const edit = await findOneData(mongooseObject[collection], { _id }, columns);
  responseData(res, edit);
};

export const insert = async (req, res) => {
  const collection = req.params.one;
  createSchema(collection);
  const insert = await insertData(mongooseObject[collection], req.body);
  insert?._id ? res.status(200) : res.status(400);
  responseData(res, insert);
};
export const remove = async (req, res) => {
  const [collection, _id] = [req.params.one, req.params.two];
  createSchema(collection);
  const deletedUser = await removeData(mongooseObject[collection], _id);
  responseData(res, deletedUser);
};

export const update = async (req, res) => {
  const collection = req.params.one;
  const _id = req.params.two;
  createSchema(collection);
  const update = await findAndUpdateData(
    mongooseObject[collection],
    { _id },
    req.body,
  );
  res.status(update?._id ? 200 : 400);
  responseData(res, update);
};

export const schema = async (req, res) => {
  const collection = req.params.one;
  const { rawSchema, pages } = createSchemaFromTextFile(collection);
  if (!rawSchema) {
    const error = new Error(
      `Schema for collection "${collection}" was not found or is invalid.`,
    );
    error.status = 404;
    throw error;
  }
  responseData(res, { schema: rawSchema, pages });
};

export const login = async (req, res) => {
  const collection = req.params.one;
  createSchema(collection);

  const pages = mongooseObject[collection].pages;
  const loginFields = pages?.loginFields;
  const responseFields = pages?.login;
  if (
    !Array.isArray(loginFields) ||
    loginFields.length === 0 ||
    !Array.isArray(responseFields)
  ) {
    const error = new Error("Login is not configured for this collection.");
    error.status = 500;
    throw error;
  }

  const credentials = {};
  for (const field of loginFields) {
    if (
      typeof field !== "string" ||
      !mongooseObject[collection].props[field] ||
      typeof req.body?.[field] !== "string" ||
      req.body[field].length === 0
    ) {
      return res.status(400).json({
        error: pages.loginValidationMessage || "Enter valid login details.",
      });
    }
    credentials[field] = req.body[field];
  }

  const user = await findOneData(mongooseObject[collection], credentials, {
    _id: 1,
  });
  if (user instanceof Error) {
    throw user;
  }
  if (!user) {
    return res.status(401).json({
      error: pages.loginErrorMessage || "Invalid email or password.",
    });
  }

  const login = await findAndUpdateData(
    mongooseObject[collection],
    { _id: user._id },
    { authToken: generateRandomText(30), lastActive: new Date() },
  );

  if (!login?._id) {
    return res.status(500).json({
      error: pages.loginFailureMessage || "Unable to complete login.",
    });
  }

  const response = Object.fromEntries(
    responseFields
      .filter((field) => typeof field === "string")
      .map((field) => [field, login[field]]),
  );
  responseData(res, response);
};

const createSchema = (collection, type) => {
  if (!mongooseObject[collection]) {
    const { schema, pages } = createSchemaFromTextFile(collection);
    if (!schema || typeof schema !== "object" || Array.isArray(schema)) {
      const error = new Error(
        `Schema for collection "${collection}" was not found or is invalid.`,
      );
      error.status = schema == null ? 404 : 500;
      throw error;
    }

    const mongooseSchema = mongoose.Schema(schema, { timestamps: true });
    mongooseObject[collection] = {
      schema: mongooseSchema.plugin(uniqueValidator, {
        message: "NOTUNIQUE",
      }),
      model: mongoose.model(collection, mongooseSchema),
      props: schema,
      pages: pages,
    };
  }

  const columns = Object.fromEntries(
    Object.entries(mongooseObject[collection].props)
      .filter(([, field]) => field.operation?.includes(type))
      .map(([key]) => [key, 1]),
  );
  const configuredPageSize = mongooseObject[collection]?.pages?.pageSize;
  const pageSize =
    Number.isSafeInteger(configuredPageSize) && configuredPageSize > 0
      ? configuredPageSize
      : 10;
  const sortableFields = Object.entries(mongooseObject[collection].props)
    .filter(([, field]) => field.operation?.includes("sort"))
    .map(([key]) => key);
  const configuredSort = mongooseObject[collection]?.pages?.listSort;
  const defaultSort =
    configuredSort &&
    typeof configuredSort === "object" &&
    !Array.isArray(configuredSort)
      ? Object.fromEntries(
          Object.entries(configuredSort).filter(
            ([key, direction]) =>
              sortableFields.includes(key) &&
              (direction === 1 ||
                direction === -1 ||
                direction === "asc" ||
                direction === "desc"),
          ),
        )
      : {};

  return { columns, pageSize, sortableFields, defaultSort };
};

const generateRandomText = (length) =>
  randomBytes(length).toString("hex").slice(0, length);

const responseData = (res, json) => {
  setTimeout(() => {
    res.set("Content-Type", "text/html");
    res.send(JSON.stringify(json));
  }, 500);
};
