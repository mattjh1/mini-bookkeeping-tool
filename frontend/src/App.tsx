import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getAccounts } from "./api";
import type { Account } from "./types";
import { AccountTree } from "./components/AccountTree";
import { AccountForm } from "./components/AccountForm";
import { TransactionForm } from "./components/TransactionForm";

const App = () => {
  const queryClient = useQueryClient();
  const [selected, setSelected] = useState<Account | null>(null);

  const {
    data: accounts,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["accounts"],
    queryFn: getAccounts,
  });

  const refresh = () =>
    queryClient.invalidateQueries({ queryKey: ["accounts"] });

  if (isLoading) return <p className="panel">Loading accounts...</p>;
  if (error) return <p className="panel error">Error loading accounts.</p>;

  return (
    <div className="app">
      <div className="panel">
        <h2>Accounts</h2>
        {accounts && <AccountTree accounts={accounts} onSelect={setSelected} />}
      </div>

      <div className="panel">
        <AccountForm selected={selected} onCreated={refresh} />
        <hr />
        <TransactionForm selected={selected} onUpdated={refresh} />
      </div>
    </div>
  );
};

export default App;
