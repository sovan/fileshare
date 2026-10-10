import {
  findData,
  insertData,
  findAndUpdateData,
  removeData,
} from "#model/app.model.js";
import mongoose from "mongoose";
import uniqueValidator from "mongoose-unique-validator";
import { createSchemaFromTextFile } from "#controller/validator.js";
import { randomBytes } from "node:crypto";
let mongooseObject = {};

export const all = async (req, res) => {
  const collection = req.params.one;
  createSchema(collection);

  const find = await findData(
    mongooseObject[collection],
    {},
    mongooseObject[collection]["pages"]["list"],
  );

  const insert = await insertData(mongooseObject[collection], {
    email: "dodo@gmail.com",
    fname: "Dodo",
    lname: "Dey",
    password: "Admin@123",
  });

  const login = await findAndUpdateData(
    mongooseObject[collection],
    {
      email: "sovan.dey1985@gmail.com",
      password: "Admin@123",
    },
    { authToken: generateRandomText(30), lastActive: Date.now() },
    {
      new: true,
      runValidators: true,
    },
  );

  res.set("Content-Type", "text/html");
  res.send(
    "List: " +
      JSON.stringify(find) +
      "<br /><br />Insert: " +
      JSON.stringify(insert) +
      "<br /><br />Login: " +
      JSON.stringify(login),
  );
};

export const list = async (req, res) => {
  const collection = req.params.one;
  createSchema(collection);

  const list = await findData(
    mongooseObject[collection],
    {},
    mongooseObject[collection]["pages"]["list"],
  );

  res.set("Content-Type", "text/html");
  res.send(JSON.stringify(list));
};

export const view = async (req, res) => {
  const [collection, _id] = [req.params.one, req.params.two];
  createSchema(collection);
  const view = await findData(
    mongooseObject[collection],
    { _id },
    mongooseObject[collection]["pages"]["view"],
  );
  res.set("Content-Type", "text/html");
  res.send(JSON.stringify(view[0]));
};

export const edit = async (req, res) => {
  const [collection, _id] = [req.params.one, req.params.two];
  createSchema(collection);
  const view = await findData(
    mongooseObject[collection],
    { _id },
    mongooseObject[collection]["pages"]["edit"],
  );
  res.set("Content-Type", "text/html");
  res.send(JSON.stringify(view[0]));
};

export const insert = async (req, res) => {
  const collection = req.params.one;
  createSchema(collection);
  const insert = await insertData(mongooseObject[collection], req.body);
  insert?._id ? res.status(200) : res.status(400);
  res.set("Content-Type", "text/html");
  res.send(JSON.stringify(insert));
};
export const remove = async (req, res) => {
  const [collection, _id] = [req.params.one, req.params.two];
  createSchema(collection);
  const deletedUser = await removeData(mongooseObject[collection], _id);

  res.set("Content-Type", "text/html");
  res.send(deletedUser);
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

export const update = async (req, res) => {
  const collection = req.params.one;
  const _id = req.params.two;
  createSchema(collection);
  const update = await findAndUpdateData(
    mongooseObject[collection],
    { _id },
    req.body,
    {
      returnDocument: "after",
      runValidators: true,
      context: "query",
    },
  );
  res.status(update?._id ? 200 : 400);
  res.set("Content-Type", "text/html");
  res.send(JSON.stringify(update));
};

export const schema = async (req, res) => {
  const collection = req.params.one;
  const { rawSchema } = createSchemaFromTextFile(collection);
  res.set("Content-Type", "text/html");
  res.send(JSON.stringify(rawSchema));
};

const createSchema = (collection) => {
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
};

export const generateRandomText = (length) => {
  return randomBytes(length).toString("hex").slice(0, length);
};
