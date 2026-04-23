import Dexie, { type Table } from "dexie";

export interface Product {
  id?: number;
  name: string;
  basePrice: number;
  stockInBaseUnit: number;
  unitName: string;
  wholesaleUnit: string;
  conversionRatio: number;
}

export interface CartItem extends Product {
  isWholesale: boolean;
  displayQty: number;
  finalQty: number;
  totalPrice: number;
  unitLabel: string;
}

export interface Sale {
  id?: number;
  items: CartItem[];
  totalPrice: number;
  timestamp: number;
  synced: boolean;
}

export class DemoDB extends Dexie {
  products!: Table<Product>;
  sales!: Table<Sale>;

  constructor() {
    super("DemoDB");
    this.version(1).stores({
      products: "++id, name",
      sales: "++id, timestamp, synced",
    });
  }
}

export const db = new DemoDB();
