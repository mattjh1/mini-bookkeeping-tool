import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createAccount } from "../api";
import type { Account } from "../types";

interface Props {
  selected: Account | null;
  onCreated?: () => void;
}

export const AccountForm = ({ selected, onCreated }: Props) => {
  const [name, setName] = useState("");
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (name: string) => createAccount(name, selected?.id ?? null),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
      setName("");
      onCreated?.();
    },
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        mutation.mutate(name);
      }}
    >
      <h3>Create Account</h3>
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Account name"
        type="text"
        required
      />
      <button type="submit" className="primary">
        Create
      </button>
      {mutation.isError && <p className="error">Error creating account</p>}
      <small>Parent: {selected ? selected.name : "None"}</small>
    </form>
  );
};
