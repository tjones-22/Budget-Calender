import { Bill } from "@/app/types/types";

export const mockBillsByDay: Record<number, Bill[]> = {
  1: [{ type: "payday", name: "Payday" }],
  3: [{ type: "bill", name: "Rent" }],
  7: [{ type: "purchase", name: "Groceries" }],
  12: [
    { type: "bill", name: "Phone bill" },
    { type: "purchase", name: "Gas" },
  ],
  15: [{ type: "payday", name: "Payday" }],
  18: [{ type: "bill", name: "Internet" }],
  22: [{ type: "purchase", name: "Subscriptions" }],
  28: [
    { type: "bill", name: "Car insurance" },
    { type: "purchase", name: "Dining out" },
  ],
};
