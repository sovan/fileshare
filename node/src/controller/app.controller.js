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
  const filter = {};
  if (mongooseObject[collection].props.createdBy) {
    const user = await getAuthenticatedUser(req);
    if (!user) {
      return res.status(401).json({ error: "Authentication required." });
    }
    if (
      typeof req.query._id !== "string" ||
      req.query._id !== String(user._id)
    ) {
      return res.status(403).json({ error: "User list access denied." });
    }
    filter.createdBy = String(user._id);
  }
  const search = typeof req.query.search === "string" ? req.query.search.trim() : "";
  if (search) {
    if (search.length > 100) {
      const error = new Error("Search text cannot exceed 100 characters.");
      error.status = 400;
      throw error;
    }
    const searchFields = Object.entries(mongooseObject[collection].props)
      .filter(
        ([key, field]) =>
          columns[key] === 1 &&
          (field.type === "String" || field.type === "Date") &&
          key !== "password" &&
          key !== "authToken",
      );
    const escapedSearch = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    if (searchFields.length > 0) {
      filter.$and = [
        {
          $or: searchFields.map(([key, field]) =>
            field.type === "String"
              ? { [key]: new RegExp(escapedSearch, "i") }
              : {
                  $expr: {
                    $regexMatch: {
                      input: { $ifNull: [{ $toString: `$${key}` }, ""] },
                      regex: escapedSearch,
                      options: "i",
                    },
                  },
                },
          ),
        },
      ];
    }
  }
  let requestedFilters = {};
  if (typeof req.query.filters === "string") {
    try {
      requestedFilters = JSON.parse(req.query.filters);
    } catch {
      const error = new Error("Invalid filters.");
      error.status = 400;
      throw error;
    }
  }
  if (
    typeof requestedFilters !== "object" ||
    requestedFilters === null ||
    Array.isArray(requestedFilters)
  ) {
    const error = new Error("Invalid filters.");
    error.status = 400;
    throw error;
  }
  const fieldFilters = [];
  for (const [key, value] of Object.entries(requestedFilters)) {
    const field = mongooseObject[collection].props[key];
    if (
      !field ||
      !field.operation?.includes("filter") ||
      columns[key] !== 1 ||
      (field.type !== "String" && field.type !== "Date")
    ) {
      const error = new Error(`Filtering is not allowed for "${key}".`);
      error.status = 400;
      throw error;
    }
    if (typeof value !== "string" || value.length > 100) {
      const error = new Error(`Invalid filter value for "${key}".`);
      error.status = 400;
      throw error;
    }
    if (!value.trim()) continue;

    if (field.type === "String") {
      const escapedValue = value.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      fieldFilters.push({ [key]: new RegExp(escapedValue, "i") });
      continue;
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
      const error = new Error(`Invalid date filter for "${key}".`);
      error.status = 400;
      throw error;
    }
    const start = new Date(`${value}T00:00:00.000Z`);
    if (Number.isNaN(start.getTime())) {
      const error = new Error(`Invalid date filter for "${key}".`);
      error.status = 400;
      throw error;
    }
    fieldFilters.push({
      [key]: { $gte: start, $lt: new Date(start.getTime() + 86400000) },
    });
  }
  if (fieldFilters.length > 0) {
    filter.$and = [...(filter.$and ?? []), ...fieldFilters];
  }
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
    filter,
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
  const record = await findOneData(mongooseObject[collection], { _id }, columns);
  if (record instanceof Error) throw record;
  if (!record) {
    responseData(res, record);
    return;
  }

  const viewData = record.toObject();
  const auditFields = ["createdBy", "updateBy"].filter(
    (field) => typeof viewData[field] === "string" && viewData[field],
  );
  if (auditFields.length > 0) {
    const userIds = [...new Set(auditFields.map((field) => viewData[field]))];
    const result = await findData(
      mongooseObject[collection],
      { _id: { $in: userIds } },
      { fname: 1, lname: 1 },
      1,
      userIds.length,
    );
    if (result instanceof Error) throw result;

    const userNames = new Map(
      result.records.map((user) => [
        String(user._id),
        [user.fname, user.lname].filter(Boolean).join(" "),
      ]),
    );
    for (const field of auditFields) {
      viewData[field] = userNames.get(viewData[field]) ?? viewData[field];
    }
  }
  responseData(res, viewData);
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
  const schema = mongooseObject[collection].props;
  const data = { ...req.body };
  delete data.createdBy;
  delete data.updateBy;
  if (schema.createdBy || schema.updateBy) {
    const user = await getAuthenticatedUser(req);
    if (!user) {
      return res.status(401).json({ error: "Authentication required." });
    }
    if (schema.createdBy) data.createdBy = String(user._id);
  }
  const insert = await insertData(mongooseObject[collection], data);
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
  const schema = mongooseObject[collection].props;
  const data = { ...req.body };
  delete data.createdBy;
  delete data.updateBy;
  if (schema.createdBy || schema.updateBy) {
    const user = await getAuthenticatedUser(req);
    if (!user) {
      return res.status(401).json({ error: "Authentication required." });
    }
    if (schema.updateBy) data.updateBy = String(user._id);
  }
  const update = await findAndUpdateData(
    mongooseObject[collection],
    { _id },
    data,
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

const getAuthenticatedUser = async (req) => {
  const authorization = req.get("authorization");
  const match =
    typeof authorization === "string"
      ? /^Bearer\s+(\S+)$/i.exec(authorization)
      : null;
  if (!match) return null;

  const userCollection = Object.values(mongooseObject).find(
    (collection) => collection.props.authToken,
  );
  if (!userCollection) return null;
  const user = await findOneData(
    userCollection,
    { authToken: match[1] },
    { _id: 1 },
  );
  if (user instanceof Error) throw user;
  return user ?? null;
};

const responseData = (res, json) => {
  setTimeout(() => {
    res.set("Content-Type", "text/html");
    res.send(JSON.stringify(json));
  }, 500);
};
