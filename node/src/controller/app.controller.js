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
  const { columns } = createSchema(collection, "list");
  const list = await findData(mongooseObject[collection], {}, columns);
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
  const { rawSchema } = createSchemaFromTextFile(collection);
  responseData(res, rawSchema);
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
    if (schema !== null) {
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
  }

  const columns = Object.fromEntries(
    Object.entries(mongooseObject[collection]?.schema?.obj)
      .filter(([, field]) => field.operation?.includes(type))
      .map(([key]) => [key, 1]),
  );

  return { columns };
};

const generateRandomText = (length) =>
  randomBytes(length).toString("hex").slice(0, length);

const responseData = (res, json) => {
  res.set("Content-Type", "text/html");
  res.send(JSON.stringify(json));
};
