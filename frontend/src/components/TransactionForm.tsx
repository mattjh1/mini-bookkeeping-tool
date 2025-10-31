import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateBalance } from "../api";
import type { Account } from "../types";

interface Props {
  selected: Account | null;
  onUpdated?: () => void;
}

export const TransactionForm = ({ selected, onUpdated }: Props) => {
  const [delta, setDelta] = useState<number>(0);
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (d: number) => updateBalance(selected!.id, d),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
      setDelta(0);
      onUpdated?.();
    },
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!selected) {
          return;
        }
        mutation.mutate(delta);
      }}
    >
      <h3>Post Transaction</h3>
      <input
        type="number"
        step="0.01"
        value={delta}
        onChange={(e) => setDelta(Number(e.target.value))}
        placeholder="Amount (+/-)"
      />
      <button type="submit" className="secondary">
        Apply
      </button>
      {mutation.isError && <p className="error">Error posting transaction</p>}
      <small>Target: {selected ? selected.name : "None"}</small>
    </form>
  );
};
