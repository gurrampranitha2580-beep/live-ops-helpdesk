
const express = require("express");
const http = require("http");
const cors = require("cors");
const { randomUUID } = require("crypto");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);

const allowedOrigins = (
  process.env.CLIENT_URL || "http://localhost:3000"
)
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const corsOptions = {
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error("Origin not allowed by CORS."));
  },
};

app.use(cors(corsOptions));
app.use(express.json());

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
  },
});

const tickets = [
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

const locks = new Map();

io.on("connection", (socket) => {
  console.log("Agent connected:", socket.id);

  socket.emit("initial_state", {
    tickets,
    locks: Array.from(locks.values()),
  });

  socket.on("lock_ticket", (data, callback) => {
    const { ticketId, agentId, agentName } = data || {};

    if (
      typeof ticketId !== "string" ||
      !ticketId.trim() ||
      typeof agentId !== "string" ||
      !agentId.trim() ||
      typeof agentName !== "string" ||
      !agentName.trim()
    ) {
      return callback?.({
        ok: false,
        message: "Invalid lock request.",
      });
    }

    const ticketExists = tickets.some(
      (ticket) => ticket.id === ticketId
    );

    if (!ticketExists) {
      return callback?.({
        ok: false,
        message: "Ticket not found.",
      });
    }

    if (locks.has(ticketId)) {
      return callback?.({
        ok: false,
        message: "This ticket is already locked.",
      });
    }

    const lock = {
      ticketId,
      agentId,
      agentName,
      socketId: socket.id,
    };

    locks.set(ticketId, lock);
    io.emit("ticket_locked", lock);

    callback?.({ ok: true, lock });
  });

  socket.on("save_ticket", (data, callback) => {
    const { ticketId, agentId, updates } = data || {};
    const lock = locks.get(ticketId);

    if (
      !lock ||
      lock.agentId !== agentId ||
      lock.socketId !== socket.id
    ) {
      return callback?.({
        ok: false,
        message: "You do not own this ticket lock.",
      });
    }

    const ticket = tickets.find(
      (item) => item.id === ticketId
    );

    if (!ticket) {
      return callback?.({
        ok: false,
        message: "Ticket not found.",
      });
    }

    if (
      typeof updates?.subject !== "string" ||
      !updates.subject.trim() ||
      typeof updates?.description !== "string" ||
      !updates.description.trim()
    ) {
      return callback?.({
        ok: false,
        message: "Subject and description are required.",
      });
    }

    ticket.subject = updates.subject.trim();
    ticket.description = updates.description.trim();

    io.emit("ticket_updated", ticket);
    callback?.({ ok: true, ticket });
  });

  socket.on("unlock_ticket", (data, callback) => {
    const { ticketId, agentId } = data || {};
    const lock = locks.get(ticketId);

    if (
      !lock ||
      lock.agentId !== agentId ||
      lock.socketId !== socket.id
    ) {
      return callback?.({
        ok: false,
        message: "You do not own this ticket lock.",
      });
    }

    locks.delete(ticketId);
    io.emit("ticket_unlocked", { ticketId });

    callback?.({ ok: true });
  });

  socket.on("create_ticket", (data, callback) => {
    const { subject, description } = data || {};

    if (
      typeof subject !== "string" ||
      !subject.trim() ||
      typeof description !== "string" ||
      !description.trim()
    ) {
      return callback?.({
        ok: false,
        message: "Subject and description are required.",
      });
    }

    const ticket = {
      id: `TKT-${randomUUID()}`,
      subject: subject.trim(),
      description: description.trim(),
      createdAt: new Date().toISOString(),
    };

    tickets.unshift(ticket);
    io.emit("ticket_created", ticket);

    callback?.({ ok: true, ticket });
  });

  socket.on("disconnect", () => {
    console.log("Agent disconnected:", socket.id);
  });
});

app.get("/", (req, res) => {
  res.send("Live Ops Helpdesk Socket.io server is running.");
});

const PORT = process.env.PORT || 4000;

server.listen(PORT, () => {
  console.log(`Helpdesk server running on port ${PORT}`);
});
