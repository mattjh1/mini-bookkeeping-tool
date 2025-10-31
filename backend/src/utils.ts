import type { Account, AccountTree } from "./types";

/**
 * Build hierarchical tree from flat account list
 */
export const buildAccountTree = (accounts: Account[]): AccountTree[] => {
  const map = new Map<number, AccountTree>();
  accounts.forEach((a) => map.set(a.id, { ...a, children: [] }));

  const roots: AccountTree[] = [];
  map.forEach((node) => {
    if (node.parent_id === null) {
      roots.push(node);
    } else {
      const parent = map.get(node.parent_id);
      if (parent) {
        parent.children.push(node);
      } else {
        roots.push(node); // orphan
      }
    }
  });
  return roots;
};
