export type Account = {
  id: number;
  name: string;
  parent_id: number | null;
  balance: number;
};

export type AccountTree = Account & {
  children: AccountTree[];
};

export type AccResult = { id: number; parent_id: number | null };
