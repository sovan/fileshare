import express from "express";
import connectDB from "./db.js";
import {
  list,
  insert,
  login,
  schema,
  remove,
  view,
  edit,
  update,
} from "#controller/app.controller.js";
import cors from "cors";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

await connectDB();
const app = express();
const sourceDirectory = path.dirname(fileURLToPath(import.meta.url));
const readAppConfig = () =>
  JSON.parse(
    fs.readFileSync(new URL("./config/config.json", import.meta.url), "utf8"),
  );
app.disable("x-powered-by");
const corsOptions = {
  origin: "http://localhost:5172",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
};
app.use(cors(corsOptions));
app.use(express.json());

app.get("/config", (req, res) => {
  const appConfig = readAppConfig();
  res.json({
    stylesheets: appConfig.stylesheets.map((stylesheet) => stylesheet.href),
  });
});
app.get("/styles/:stylesheet", (req, res, next) => {
  const appConfig = readAppConfig();
  const stylesheet = appConfig.stylesheets.find(
    (item) => item.href === `/styles/${req.params.stylesheet}`,
  );
  if (!stylesheet) {
    return res.status(404).json({ error: "Stylesheet not configured." });
  }
  const stylesheetPath = path.resolve(
    sourceDirectory,
    "style",
    path.basename(stylesheet.href),
  );
  res.sendFile(stylesheetPath, (error) => {
    if (error) next(error);
  });
});

//app.get("/:one", all);
app.post("/:one/login", login);
app.get("/:one/schema", schema);

app.get("/:one/list", list);
app.post("/:one/insert", insert);
app.delete("/:one/delete/:two", remove);
app.get("/:one/view/:two", view);
app.get("/:one/edit/:two", edit);
app.put("/:one/update/:two", update);

app.use((req, res) => {
  res.status(404).json({ error: "URL not found: " + req.originalUrl });
});

app.use((error, req, res, next) => {
  if (res.headersSent) {
    return next(error);
  }

  console.error(error);
  const status = Number.isInteger(error?.status) ? error.status : 500;
  res.status(status).json({
    error: status >= 500 ? "Internal server error." : error.message,
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
