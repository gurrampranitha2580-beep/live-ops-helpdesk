import type { Ticket } from "../types/ticket";

export const initialTickets: Ticket[] = [
  {
    id: "TKT-1001",
    subject: "Shipment tracking not updating",
    description: "The shipment status has not updated since dispatch.",
    createdAt: "2026-10-31T09:30:00",
  },
  {
    id: "TKT-1002",
    subject: "Delivery delay reported",
    description: "A customer has reported a delay in their scheduled delivery.",
    createdAt: "2026-10-31T10:15:00",
  },
  {
    id: "TKT-1003",
    subject: "Incorrect delivery address",
    description: "The delivery address needs verification before dispatch.",
    createdAt: "2026-10-31T11:00:00",
  },
  {
    id: "TKT-1004",
    subject: "Invoice details missing",
    description: "The customer cannot find the invoice for their shipment.",
    createdAt: "2026-10-31T12:00:00",
  },
];