# Live Ops Helpdesk

A real-time support ticket management application built for RapidDispatch Freight & Logistics. It allows multiple support agents to view, create, edit, and manage tickets while coordinating ticket access through real-time locking.

## Live Demo

- **Frontend:** https://live-ops-helpdesk-kappa.vercel.app/
- **Backend:** https://live-ops-helpdesk-server-x8h2.onrender.com
- **GitHub:** https://github.com/gurrampranitha2580-beep/live-ops-helpdesk

## Features

- Live ticket board displaying support tickets.
- Real-time ticket creation across connected clients.
- Ticket locking to prevent multiple agents from editing the same ticket simultaneously.
- Lock status updates across clients, including agent name and lock indicator.
- Ticket updates synchronized immediately after saving.
- Automatic lock release when an agent saves or closes a ticket.
- Connection status indicator with a reconnection warning.
- Socket.io-based communication without polling.

## Tech Stack

**Frontend**
- Next.js
- React
- TypeScript
- Tailwind CSS
- Socket.io Client

**Backend**
- Node.js
- Express
- Socket.io

## Project Structure

```text
live-ops-helpdesk/
├── server/
│   ├── index.js
│   └── package.json
├── src/
│   ├── app/
│   ├── components/
│   ├── data/
│   ├── lib/
│   └── types/
├── Prompts.md
├── package.json
└── README.md
```

## Run Locally

### 1. Clone the repository

```bash
git clone https://github.com/gurrampranitha2580-beep/live-ops-helpdesk.git
cd live-ops-helpdesk
```

### 2. Install frontend dependencies

```bash
npm install
```

### 3. Configure the frontend

Create a `.env.local` file in the project root:

```env
NEXT_PUBLIC_SOCKET_URL=http://localhost:4000
```

### 4. Start the backend

Open a separate terminal:

```bash
cd server
npm install
npm run dev
```

### 5. Start the frontend

Open another terminal in the project root:

```bash
npm run dev
```

Open http://localhost:3000 in your browser.

## Environment Variables

**Frontend**

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_SOCKET_URL` | Socket.io backend URL |

**Backend**

| Variable | Description |
|---|---|
| `PORT` | Backend server port |
| `CLIENT_URL` | Allowed frontend origin for CORS |

For local development, the backend defaults to port `4000` and frontend origin `http://localhost:3000`.

## Testing Real-Time Collaboration

1. Open the application in two separate browser windows.
2. Select Agent A in one window and Agent B in the other.
3. Open a ticket for editing as Agent A.
4. Verify that Agent B immediately sees the ticket locked.
5. Save or close the ticket and verify that the lock is released.
6. Create a new ticket and verify that it appears in both windows without refreshing.

## Deployment

- Frontend deployed on Vercel.
- Socket.io backend deployed on Render.
- Production communication uses HTTPS and secure WebSocket connections.

## Current Limitations

- Ticket data and locks are stored in backend memory and are not persistent across server restarts.
- Agent selection is for demonstration; authentication is not implemented.
- Automatic lock recovery after an agent disconnects is outside the scope of this frontend track.
