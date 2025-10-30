import type { Account } from "./types";

/**
 * Build hierarchical tree from flat account list
 */
export const buildAccountTree = (accounts: Account[]): Account[] => {
  const accountMap = new Map<number, Account & { children: Account[] }>();

  // Create lookup map with empty children arrays
  accounts.forEach((account) =>
    accountMap.set(account.id, { ...account, children: [] }),
  );

  const roots: Account[] = [];

  // Build tree structure
  accountMap.forEach((account) => {
    if (account.parent_id === null) {
      roots.push(account);
    } else {
      const parent = accountMap.get(account.parent_id);
      if (parent) {
        parent.children.push(account);
      } else {
        // Orphaned account - add to root
        roots.push(account);
      }
    }
  });
  return roots;
};
