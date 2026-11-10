
"use client";

import { useState } from "react";
import type { Ticket } from "../types/ticket";

interface TicketDetailsProps {
  ticket: Ticket;
  onSave: (
    ticketId: string,
    updates: {
      subject: string;
      description: string;
    }
  ) => void;
  onClose: () => void;
  isBusy: boolean;
  isConnected: boolean;
}

export default function TicketDetails({
  ticket,
  onSave,
  onClose,
  isBusy,
  isConnected,
}: TicketDetailsProps) {
  const [subject, setSubject] = useState(ticket.subject);
  const [description, setDescription] = useState(ticket.description);

  function handleSave() {
    const trimmedSubject = subject.trim();
    const trimmedDescription = description.trim();

    if (
      !trimmedSubject ||
      !trimmedDescription ||
      isBusy ||
      !isConnected
    ) {
      return;
    }

    onSave(ticket.id, {
      subject: trimmedSubject,
      description: trimmedDescription,
    });
  }

  return (
    <section className="ticket-details">
      <div className="details-heading">
        <div>
          <span className="details-label">{ticket.id}</span>
          <h2>Ticket Details</h2>
        </div>

        <button
          type="button"
          className="close-button"
          onClick={onClose}
          aria-label="Close ticket"
          disabled={isBusy || !isConnected}
        >
          ×
        </button>
      </div>

      <label htmlFor="ticket-subject">Subject</label>
      <input
        id="ticket-subject"
        value={subject}
        onChange={(event) => setSubject(event.target.value)}
        disabled={isBusy || !isConnected}
        required
      />

      <label htmlFor="ticket-description">Description</label>
      <textarea
        id="ticket-description"
        value={description}
        onChange={(event) => setDescription(event.target.value)}
        rows={5}
        disabled={isBusy || !isConnected}
        required
      />

      <div className="details-actions">
        <button
          type="button"
          className="secondary-button"
          onClick={onClose}
          disabled={isBusy || !isConnected}
        >
          {isBusy ? "Please wait..." : "Close"}
        </button>

        <button
          type="button"
          className="primary-button"
          onClick={handleSave}
          disabled={
            isBusy ||
            !isConnected ||
            !subject.trim() ||
            !description.trim()
          }
        >
          {isBusy ? "Saving..." : "Save"}
        </button>
      </div>
    </section>
  );
}
