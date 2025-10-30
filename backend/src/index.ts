import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import { makeDb } from "./db";
import { makeRouter } from "./routes";

const PORT = process.env.PORT || 3001;
const app = express();
app.use(cors());
app.use(bodyParser.json());

const db = makeDb(true);

(() => {
  const stmt = db.prepare(
    "INSERT INTO accounts (name, parent_id, balance) VALUES (?, ?, ?)",
  );
  const root = stmt.run("Assets", null, 1200).lastInsertRowid as number;
  const cash = stmt.run("Cash", root, 1000).lastInsertRowid as number;
  const stocks = stmt.run("Stocks", root, 10000).lastInsertRowid as number;
  stmt.run("Checking", cash, 1000);
  stmt.run("", cash, 1000);
})();

app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.use("/api", makeRouter(db));

app.listen(PORT, () =>
  console.log(`Server listening on http://localhost:${PORT}`),
);
