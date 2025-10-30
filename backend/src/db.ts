import Database from "better-sqlite3";

export const makeDb = (inMemory = true) => {
  const filename = inMemory ? ":memory:" : "data.sqlite";
  const db = new Database(filename);

  db.pragma("foreign_keys = ON");

  db.exec(`
CREATE TABLE IF NOT EXISTS accounts (
id INTEGER PRIMARY KEY AUTOINCREMENT,
name TEXT NOT NULL,
parent_id INTEGER NULL,
balance NUMERIC NOT NULL DEFAULT 0,
FOREIGN KEY(parent_id) REFERENCES accounts(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_accounts_parent_id ON accounts (parent_id);
`);

  return db;
};
