export type Inventory = {
  id: number;
  name: string;
  code: string;
  created_at: string;
};

export type Scan = {
  barcode: string;
  description: string;
  time_readed: string;
  inventory_id: number;
};