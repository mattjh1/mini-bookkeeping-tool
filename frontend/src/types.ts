export type Account = {
  id: number;
  name: string;
  parent_id: number | null;
  balance: number;
  children?: Account[];
};
