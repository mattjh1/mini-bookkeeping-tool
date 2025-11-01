import axios from "axios";
import type { Account } from "./types";

const API_BASE = "/api";

export const getAccounts = async (): Promise<Account[]> => {
  const res = await axios.get(`${API_BASE}/accounts`);
  return res.data;
};

export const createAccount = async (
  name: string,
  parent_id?: number | null,
) => {
  const res = await axios.post(`${API_BASE}/accounts`, { name, parent_id });
  return res.data;
};

export const updateBalance = async (id: number, delta: number) => {
  const res = await axios.patch(`${API_BASE}/accounts/${id}/balance`, {
    delta,
  });
  return res.data;
};
