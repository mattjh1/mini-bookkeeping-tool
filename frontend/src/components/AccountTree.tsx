import { useState } from "react";
import type { Account } from "../types";

interface Props {
  accounts: Account[];
  onSelect: (account: Account) => void;
}

export const AccountTree = ({ accounts, onSelect }: Props) => (
  <ul>
    {accounts.map((a) => (
      <TreeNode key={a.id} account={a} onSelect={onSelect} />
    ))}
  </ul>
);

const TreeNode = ({
  account,
  onSelect,
}: {
  account: Account;
  onSelect: (a: Account) => void;
}) => {
  const [open, setOpen] = useState(true);
  const hasChildren = account.children && account.children.length > 0;

  return (
    <li>
      <div className="account-row" onClick={() => onSelect(account)}>
        {hasChildren && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setOpen((o) => !o);
            }}
          >
            {open ? "▾" : "▸"}
          </button>
        )}
        <span>{account.name}</span>
        <span className="balance">{account.balance.toFixed(2)}</span>
      </div>
      {open && hasChildren && (
        <AccountTree accounts={account.children!} onSelect={onSelect} />
      )}
    </li>
  );
};
