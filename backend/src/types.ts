export type Account = {
  id: number;
  name: string;
  parent_id: number | null;
  balance: number;
  children?: Account[];
};

export type AccResult = { id: number; parent_id: number | null };
