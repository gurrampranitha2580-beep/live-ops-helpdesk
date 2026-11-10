"use client";

import { useState } from "react";
import type { Ticket, TicketLock } from "../types/ticket";

interface TicketBoardProps {
  tickets: Ticket[];
  locks: TicketLock[];
  socketId: string | undefined;
  pendingLockId: string | null;
  isConnected: boolean;
  onSelectTicket: (ticket: Ticket) => void;
  onCreateTicket: (
    subject: string,
    description: string
  ) => Promise<boolean>;
}

export default function TicketBoard({
  tickets,
  locks,
  socketId,
  pendingLockId,
  isConnected,
  onSelectTicket,
  onCreateTicket,
}: TicketBoardProps) {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleCreateTicket(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    const trimmedSubject = subject.trim();
    const trimmedDescription = description.trim();

    if (!trimmedSubject || !trimmedDescription || isSubmitting) {
      return;
    }

    setIsSubmitting(true);

    try {
      const created = await onCreateTicket(
        trimmedSubject,
        trimmedDescription
      );

      if (created) {
        setSubject("");
        setDescription("");
        setShowCreateForm(false);
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="ticket-board">
      <div className="board-heading">
        <div>
          <h2>Active Tickets</h2>
          <p>View and manage incoming support requests.</p>
        </div>

        <div className="board-actions">
          <span className="ticket-count">{tickets.length} tickets</span>

          <button
            type="button"
            className="primary-button"
            disabled={!isConnected || isSubmitting}
            onClick={() => setShowCreateForm((current) => !current)}
          >
            {showCreateForm ? "Cancel" : "+ New Ticket"}
          </button>
        </div>
      </div>

      {showCreateForm && (
        <form className="create-ticket-form" onSubmit={handleCreateTicket}>
          <h3>Create Ticket</h3>

          <label htmlFor="new-ticket-subject">Subject</label>
          <input
            id="new-ticket-subject"
            value={subject}
            onChange={(event) => setSubject(event.target.value)}
            placeholder="Enter ticket subject"
            required
            disabled={isSubmitting}
          />

          <label htmlFor="new-ticket-description">Description</label>
          <textarea
            id="new-ticket-description"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Describe the support request"
            rows={3}
            required
            disabled={isSubmitting}
          />

          <button
            type="submit"
            className="primary-button"
            disabled={!isConnected || isSubmitting}
          >
            {isSubmitting ? "Creating..." : "Create Ticket"}
          </button>
        </form>
      )}

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Ticket</th>
              <th>Description</th>
              <th>Created</th>
              <th>Access</th>
              <th></th>
            </tr>
          </thead>

          <tbody>
            {tickets.map((ticket) => {
              const lock = locks.find(
                (item) => item.ticketId === ticket.id
              );

              const lockedByOther =
                lock !== undefined && lock.socketId !== socketId;

              const lockPending = pendingLockId === ticket.id;

              return (
                <tr
                  key={ticket.id}
                  className={lockedByOther ? "ticket-locked" : ""}
                >
                  <td>
                    <strong>{ticket.id}</strong>
                    <span className="ticket-subject">
                      {ticket.subject}
                    </span>
                  </td>

                  <td>{ticket.description}</td>

                  <td>
                    {new Intl.DateTimeFormat("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: true,
                      timeZone: "Asia/Kolkata",
                    }).format(new Date(ticket.createdAt))}
                  </td>

                  <td>
                    {lock ? (
                      <span className="lock-label">
                        🔒 Locked by{" "}
                        {lock.socketId === socketId
                          ? "You"
                          : lock.agentName}
                      </span>
                    ) : (
                      <span className="available-label">
                        Available
                      </span>
                    )}
                  </td>

                  <td>
                    <button
                      type="button"
                      className="edit-button"
                      disabled={
                        !isConnected ||
                        lockedByOther ||
                        pendingLockId !== null
                      }
                      onClick={() => onSelectTicket(ticket)}
                    >
                      {lockPending
                        ? "Requesting..."
                        : lock?.socketId === socketId
                          ? "Editing"
                          : "Edit"}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {tickets.length === 0 && (
          <p className="empty-message">No active tickets found.</p>
        )}
      </div>
    </section>
  );
}
