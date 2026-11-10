export interface Ticket {
  id: string;
  subject: string;
  description: string;
  createdAt: string;
}

export interface Agent {
  id: string;
  name: string;
}

export interface TicketLock {
  ticketId: string;
  agentId: string;
  agentName: string;
  socketId: string;
}
