import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { db } from "./db/schema";

const initDB = async () => {
  const count = await db.products.count();
  if (count === 0) {
    await db.products.bulkAdd([
      {
        name: "Pakan Kenari Super",
        basePrice: 20,
        stockInBaseUnit: 100000,
        unitName: "Gram",
        wholesaleUnit: "Karung",
        conversionRatio: 25000,
      },
      {
        name: "Milet Putih Import",
        basePrice: 15,
        stockInBaseUnit: 200000,
        unitName: "Gram",
        wholesaleUnit: "Karung",
        conversionRatio: 50000,
      },
      {
        name: "Biji Sawi",
        basePrice: 30,
        stockInBaseUnit: 50000,
        unitName: "Gram",
        wholesaleUnit: "Bungkus",
        conversionRatio: 1000,
      },
    ]);
    console.log("✅ Seeding complete");
  }
};

initDB().then(() => {
  ReactDOM.createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  );
});
