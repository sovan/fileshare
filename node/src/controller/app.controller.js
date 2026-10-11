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
  const { columns, pageSize } = createSchema(collection, "list");
  const requestedPage =
    typeof req.query.page === "string" ? Number(req.query.page) : 1;
  const page =
    Number.isSafeInteger(requestedPage) && requestedPage > 0
      ? requestedPage
      : 1;
  const list = await findData(
    mongooseObject[collection],
    {},
    columns,
    page,
    pageSize,
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

  const login = await findAndUpdateData(
    mongooseObject[collection],
    {
      email: "sovan.dey1985@gmail.com",
      password: "Admin@123",
    },
    { authToken: generateRandomText(30), lastActive: Date.now() },
    {
      returnDocument: "after",
      select: mongooseObject[collection]["pages"]["login"].join(" "),
    },
  );

  res.set("Content-Type", "text/html");
  res.send(JSON.stringify(login));
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

    const mongooseSchema = mongoose.Schema(schema);
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

  return { columns, pageSize };
};

const generateRandomText = (length) =>
  randomBytes(length).toString("hex").slice(0, length);

const responseData = (res, json) => {
  setTimeout(() => {
    res.set("Content-Type", "text/html");
    res.send(JSON.stringify(json));
  }, 500);
};
