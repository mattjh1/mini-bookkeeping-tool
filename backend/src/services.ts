import type { Database } from "better-sqlite3";
import type { Account, AccResult } from "./types";

export class AccountService {
  constructor(private db: Database) {}

  /**
   * Get all accounts from database
   */
  getAllAccounts(): Account[] {
    return this.db
      .prepare("SELECT id, name, parent_id, balance FROM accounts")
      .all() as Account[];
  }

  /**
   * Get single account by ID
   */
  getAccountById(id: number): Account | undefined {
    return this.db
      .prepare("SELECT id, name, parent_id, balance FROM accounts WHERE id = ?")
      .get(id) as Account | undefined;
  }

  /**
   * Check if account is a leaf (has no children)
   */
  isLeafAccount(accountId: number): boolean {
    const child = this.db
      .prepare("SELECT id FROM accounts WHERE parent_id = ? LIMIT 1")
      .get(accountId);
    return !child;
  }

  /**
   * Check if parent account exists
   */
  parentExists(parentId: number): boolean {
    const parent = this.db
      .prepare("SELECT id FROM accounts WHERE id = ?")
      .get(parentId);
    return !!parent;
  }

  /**
   * Create new account
   */
  createAccount(name: string, parentId: number | null): Account {
    const result = this.db
      .prepare("INSERT INTO accounts (name, parent_id) VALUES (?, ?)")
      .run(name, parentId);

    return this.getAccountById(result.lastInsertRowid as number)!;
  }

  /**
   * Adjust leaf account balance and cascade updates to parents
   */
  adjustBalance(accountId: number, delta: number): Account {
    const transaction = this.db.transaction(() => {
      // Update leaf balance
      this.db
        .prepare("UPDATE accounts SET balance = balance + ? WHERE id = ?")
        .run(delta, accountId);

      // Recalculate parent balances up the tree
      this.recalculateParentBalances(accountId);
    });

    transaction();
    return this.getAccountById(accountId)!;
  }

  /**
   * Recalculate parent balances up the tree from given account
   */
  private recalculateParentBalances(startAccountId: number): void {
    const getParent = this.db.prepare<number>(
      "SELECT parent_id FROM accounts WHERE id = ?",
    );
    const getChildrenSum = this.db.prepare<number>(
      "SELECT SUM(balance) as total FROM accounts WHERE parent_id = ?",
    );
    const updateBalance = this.db.prepare(
      "UPDATE accounts SET balance = ? WHERE id = ?",
    );

    // Get parent of starting account
    const startAccount = getParent.get(startAccountId) as AccResult | undefined;
    let currentParentId = startAccount?.parent_id ?? null;

    // Walk up the tree, recalculating each parent's balance
    while (currentParentId !== null) {
      const sumResult = getChildrenSum.get(currentParentId) as {
        total: number | null;
      };
      const totalBalance = sumResult?.total ?? 0;

      updateBalance.run(totalBalance, currentParentId);

      // Move to next parent
      const parentAccount = getParent.get(currentParentId) as
        | AccResult
        | undefined;
      currentParentId = parentAccount?.parent_id ?? null;
    }
  }
}
