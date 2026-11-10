"use client";

import { useEffect, useRef, useState } from "react";
import { socket } from "../lib/socket";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import TicketBoard from "../components/TicketBoard";
import TicketDetails from "../components/TicketDetails";
import { initialTickets } from "../data/tickets";
import type { Ticket, TicketLock } from "../types/ticket";

type Operation = "saving" | "releasing" | null;

export default function Home() {
  const [isConnected, setIsConnected] = useState(false);
  const [tickets, setTickets] = useState<Ticket[]>(initialTickets);
  const [locks, setLocks] = useState<TicketLock[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [agentId, setAgentId] = useState("agent-a");
  const [pendingLockId, setPendingLockId] = useState<string | null>(null);
  const [operation, setOperation] = useState<Operation>(null);

  const selectedTicketRef = useRef<Ticket | null>(null);
  const pendingLockRef = useRef<string | null>(null);
  const operationRef = useRef(false);
  const hadConnectionRef = useRef(false);
  const lostEditorRef = useRef(false);

  const agentName = agentId === "agent-a" ? "Agent A" : "Agent B";

  useEffect(() => {
    function handleConnect() {
      setIsConnected(true);

      if (hadConnectionRef.current && lostEditorRef.current) {
        selectedTicketRef.current = null;
        setSelectedTicket(null);
        lostEditorRef.current = false;

        window.alert(
          "Connection restored. Your previous ticket lock could not be recovered. Please check the ticket's current status before editing again."
        );
      }

      hadConnectionRef.current = true;
    }

    function handleDisconnect() {
      setIsConnected(false);

      if (selectedTicketRef.current) {
        lostEditorRef.current = true;
      }

      pendingLockRef.current = null;
      setPendingLockId(null);

      operationRef.current = false;
      setOperation(null);
    }

    function handleInitialState(data: {
      tickets: Ticket[];
      locks: TicketLock[];
    }) {
      setTickets(data.tickets);
      setLocks(data.locks);
    }

    function handleTicketLocked(lock: TicketLock) {
      setLocks((current) => {
        const updated = current.filter(
          (item) => item.ticketId !== lock.ticketId
        );

        return [...updated, lock];
      });
    }

    function handleTicketUnlocked(data: { ticketId: string }) {
      setLocks((current) =>
        current.filter((lock) => lock.ticketId !== data.ticketId)
      );
    }

    function handleTicketUpdated(updatedTicket: Ticket) {
      setTickets((current) =>
        current.map((ticket) =>
          ticket.id === updatedTicket.id ? updatedTicket : ticket
        )
      );
    }

    function handleTicketCreated(newTicket: Ticket) {
      setTickets((current) => {
        if (current.some((ticket) => ticket.id === newTicket.id)) {
          return current;
        }

        return [newTicket, ...current];
      });
    }

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("initial_state", handleInitialState);
    socket.on("ticket_locked", handleTicketLocked);
    socket.on("ticket_unlocked", handleTicketUnlocked);
    socket.on("ticket_updated", handleTicketUpdated);
    socket.on("ticket_created", handleTicketCreated);

    socket.connect();

    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("initial_state", handleInitialState);
      socket.off("ticket_locked", handleTicketLocked);
      socket.off("ticket_unlocked", handleTicketUnlocked);
      socket.off("ticket_updated", handleTicketUpdated);
      socket.off("ticket_created", handleTicketCreated);

      socket.disconnect();
    };
  }, []);

  function handleSelectTicket(ticket: Ticket) {
    if (!isConnected) {
      window.alert("Connection lost. Please wait for reconnection.");
      return;
    }

    if (pendingLockRef.current || operationRef.current) {
      return;
    }

    const existingLock = locks.find(
      (lock) => lock.ticketId === ticket.id
    );

    if (existingLock) {
      if (existingLock.socketId === socket.id) {
        selectedTicketRef.current = ticket;
        setSelectedTicket(ticket);
      }

      return;
    }

    pendingLockRef.current = ticket.id;
    setPendingLockId(ticket.id);

    socket.timeout(5000).emit(
      "lock_ticket",
      { ticketId: ticket.id, agentId, agentName },
      (
        error: Error | null,
        response: {
          ok: boolean;
          message?: string;
          lock?: TicketLock;
        }
      ) => {
        pendingLockRef.current = null;
        setPendingLockId(null);

        if (error) {
          window.alert(
            "The lock request timed out. Please check the ticket status and try again."
          );
          return;
        }

        if (
          !response?.ok ||
          !response.lock ||
          response.lock.socketId !== socket.id ||
          !socket.connected
        ) {
          window.alert(
            response?.message ||
              "Unable to confirm ownership of this ticket lock."
          );
          return;
        }

        selectedTicketRef.current = ticket;
        setSelectedTicket(ticket);
      }
    );
  }

  function releaseLock() {
    const ticket = selectedTicketRef.current;

    if (!ticket || operationRef.current) {
      return;
    }

    if (!socket.connected) {
      window.alert(
        "Connection lost. The ticket cannot be unlocked right now."
      );
      return;
    }

    operationRef.current = true;
    setOperation("releasing");

    socket.timeout(5000).emit(
      "unlock_ticket",
      { ticketId: ticket.id, agentId },
      (
        error: Error | null,
        response: { ok: boolean; message?: string }
      ) => {
        operationRef.current = false;
        setOperation(null);

        if (error || !response?.ok) {
          window.alert(
            response?.message || "Unable to unlock ticket. Please try again."
          );
          return;
        }

        selectedTicketRef.current = null;
        setSelectedTicket(null);
      }
    );
  }

  function handleSave(
    ticketId: string,
    updates: { subject: string; description: string }
  ) {
    if (operationRef.current) {
      return;
    }

    if (!socket.connected) {
      window.alert(
        "Connection lost. Your changes could not be saved."
      );
      return;
    }

    operationRef.current = true;
    setOperation("saving");

    socket.timeout(5000).emit(
      "save_ticket",
      { ticketId, agentId, updates },
      (
        error: Error | null,
        saveResponse: { ok: boolean; message?: string }
      ) => {
        if (error || !saveResponse?.ok) {
          operationRef.current = false;
          setOperation(null);

          window.alert(
            saveResponse?.message ||
              "Unable to confirm the save. Please check the ticket before retrying."
          );
          return;
        }

        socket.timeout(5000).emit(
          "unlock_ticket",
          { ticketId, agentId },
          (
            unlockError: Error | null,
            unlockResponse: { ok: boolean; message?: string }
          ) => {
            operationRef.current = false;
            setOperation(null);

            if (unlockError || !unlockResponse?.ok) {
              window.alert(
                "Changes were saved, but the ticket could not be unlocked. Please retry Close when the connection is available."
              );
              return;
            }

            selectedTicketRef.current = null;
            setSelectedTicket(null);
          }
        );
      }
    );
  }

  function handleCreateTicket(
    subject: string,
    description: string
  ): Promise<boolean> {
    return new Promise((resolve) => {
      if (!socket.connected) {
        window.alert("Connection lost. Unable to create ticket.");
        resolve(false);
        return;
      }

      socket.timeout(5000).emit(
        "create_ticket",
        { subject, description },
        (
          error: Error | null,
          response: {
            ok: boolean;
            message?: string;
            ticket?: Ticket;
          }
        ) => {
          if (error || !response?.ok) {
            window.alert(
              response?.message ||
                "Unable to confirm ticket creation. Please try again."
            );
            resolve(false);
            return;
          }

          resolve(true);
        }
      );
    });
  }

  return (
    <main className="dashboard">
      <Sidebar />

      <div className="main-content">
        <Header agentName={agentName} />

        <div className="agent-switcher">
          <span>Preview agent:</span>
          <select
            value={agentId}
            onChange={(event) => setAgentId(event.target.value)}
            disabled={
              selectedTicket !== null ||
              pendingLockId !== null ||
              operation !== null
            }
          >
            <option value="agent-a">Agent A</option>
            <option value="agent-b">Agent B</option>
          </select>
        </div>

        <div
          className={`preview-notice ${
            isConnected ? "connection-online" : "connection-lost"
          }`}
        >
          {isConnected
            ? "Connected — real-time updates are active."
            : "Connection Lost: Reconnecting... Your changes might not be saved."}
        </div>

        <TicketBoard
          tickets={tickets}
          locks={locks}
          socketId={socket.id}
          pendingLockId={pendingLockId}
          isConnected={isConnected}
          onSelectTicket={handleSelectTicket}
          onCreateTicket={handleCreateTicket}
        />

        {selectedTicket && (
          <TicketDetails
            ticket={selectedTicket}
            onSave={handleSave}
            onClose={releaseLock}
            isBusy={operation !== null}
            isConnected={isConnected}
          />
        )}
      </div>
    </main>
  );
}