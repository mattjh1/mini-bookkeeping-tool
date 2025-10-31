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
  const insert = db.prepare(
    "INSERT INTO accounts (name, parent_id, balance) VALUES (?, ?, ?)",
  );

  // --- Root categories ---
  const assets = insert.run("Assets", null, 0).lastInsertRowid as number;
  const liabilities = insert.run("Liabilities", null, 0)
    .lastInsertRowid as number;

  // --- Assets subtree ---
  const cash = insert.run("Cash", assets, 0).lastInsertRowid as number;
  const checking = insert.run("Checking", cash, 1200).lastInsertRowid as number;
  const savings = insert.run("Savings", cash, 3000).lastInsertRowid as number;

  const investments = insert.run("Investments", assets, 0)
    .lastInsertRowid as number;
  const stocks = insert.run("Stocks", investments, 8000)
    .lastInsertRowid as number;

  // --- Liabilities subtree ---
  const credit = insert.run("Credit Card", liabilities, 0)
    .lastInsertRowid as number;
  const visa = insert.run("Visa", credit, -500).lastInsertRowid as number;
  const mastercard = insert.run("MasterCard", credit, -700)
    .lastInsertRowid as number;

  // --- Now update parent balances ---
  const updateBalance = db.prepare(
    "UPDATE accounts SET balance = (SELECT SUM(balance) FROM accounts WHERE parent_id = ?) WHERE id = ?",
  );

  // Update leaf parents
  updateBalance.run(cash, cash);
  updateBalance.run(investments, investments);
  updateBalance.run(credit, credit);

  // Update roots
  updateBalance.run(assets, assets);
  updateBalance.run(liabilities, liabilities);

  console.log("Seed data inserted with correct balances");
})();

app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.use("/api", makeRouter(db));

app.listen(PORT, () =>
  console.log(`Server listening on http://localhost:${PORT}`),
);
