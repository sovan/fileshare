import express from "express";
import connectDB from "./db.js";
import mongoose from "mongoose";
import {
  list,
  all,
  insert,
  login,
  schema,
  remove,
  view,
} from "#controller/app.controller.js";
import cors from "cors";

await connectDB();
const app = express();
const corsOptions = {
  origin: "http://localhost:5172",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
};
app.use(cors(corsOptions));
app.use(express.json());

app.get("/:one", all);
app.get("/:one/login", login);
app.get("/:one/schema", schema);

app.get("/:one/list", list);
app.post("/:one/insert", insert);
app.delete("/:one/delete/:two", remove);
app.get("/:one/view/:two", view);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
