import { Router, Request, Response } from "express";
import type { Database } from "better-sqlite3";
import { AccountService } from "./services";
import { buildAccountTree } from "./utils";

export const makeRouter = (db: Database) => {
  const router = Router();
  const accountService = new AccountService(db);

  /**
   * GET /accounts
   * Returns hierarchical tree of all accounts with balances
   */
  router.get("/accounts", (req: Request, res: Response) => {
    const accounts = accountService.getAllAccounts();
    const tree = buildAccountTree(accounts);
    res.json(tree);
  });

  /**
   * POST /accounts
   * Create a new account
   */
  router.post("/accounts", (req: Request, res: Response) => {
    const { name, parent_id } = req.body;

    // Validate name
    if (!name || typeof name !== "string") {
      return res.status(400).json({ error: "name is required" });
    }

    // Validate parent exists (if provided)
    if (parent_id !== null && parent_id !== undefined) {
      if (!accountService.parentExists(parent_id)) {
        return res.status(400).json({ error: "parent account not found" });
      }
    }

    const created = accountService.createAccount(name, parent_id ?? null);
    res.status(201).json(created);
  });

  /**
   * PATCH /accounts/:id/balance
   * Adjust leaf account balance (cascades to parents)
   */
  router.patch("/accounts/:id/balance", (req: Request, res: Response) => {
    const accountId = Number(req.params.id);
    const { delta } = req.body;

    if (typeof delta !== "number") {
      return res.status(400).json({ error: "delta must be a number" });
    }

    // Check account exists
    const account = accountService.getAccountById(accountId);
    if (!account) {
      return res.status(404).json({ error: "account not found" });
    }

    // Only leaf accounts can have balance adjustments
    if (!accountService.isLeafAccount(accountId)) {
      return res.status(400).json({
        error: "cannot adjust balance of non-leaf account",
      });
    }

    try {
      const updatedTree = accountService.adjustBalance(accountId, delta);
      res.json({ ok: true, tree: updatedTree });
    } catch (error) {
      console.error("Failed to update account balance:", error);
      res.status(500).json({ error: "database error" });
    }
  });

  return router;
};
