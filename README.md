# Live Ops Helpdesk

A real-time support ticket management application developed for RapidDispatch Freight & Logistics.

The application allows multiple support agents to view and manage tickets simultaneously. It uses Socket.io to synchronize ticket updates and prevent multiple agents from editing the same ticket at the same time.

## Features

- Live support ticket dashboard.
- Real-time ticket creation and updates across connected clients.
- Ticket locking to prevent simultaneous editing.
- Displays the agent currently holding a ticket lock.
- Disables editing for other agents while a ticket is locked.
- Automatically releases locks after a successful save or when an agent closes the editing panel.
- Connection-loss notification and automatic reconnection.
- Agent A and Agent B preview switcher for testing collaboration.

## Tech Stack

**Frontend**
- Next.js
- React
- TypeScript
- Tailwind CSS
- Socket.io-client

**Backend**
- Node.js
- Express
- Socket.io
- CORS

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
├── public/
├── Prompts.md
├── README.md
└── package.json
```

## Running the Project Locally

### 1. Clone the repository

```bash
git clone YOUR_GITHUB_REPOSITORY_URL
cd live-ops-helpdesk
```

### 2. Install frontend dependencies

```bash
npm install
```

### 3. Install backend dependencies

```bash
cd server
npm install
```

### 4. Start the backend

From the `server` directory:

```bash
npm run dev
```

The backend runs on port 4000 by default.

### 5. Configure the frontend

Create a `.env.local` file in the project root:

```env
NEXT_PUBLIC_SOCKET_URL=http://localhost:4000
```

### 6. Start the frontend

Open another terminal in the project root:

```bash
npm run dev
```

Open:

http://localhost:3000

## Testing Real-Time Collaboration

Open the application in two separate browser windows.

1. Select Agent A in the first window and Agent B in the second.
2. Open a ticket as Agent A.
3. Check that Agent B immediately sees the ticket locked.
4. Try to edit the same ticket as Agent B.
5. Save or close the ticket as Agent A.
6. Verify that Agent B can edit it again.
7. Create a new ticket and check that it appears in both windows.

## Environment Variables

| Variable | Purpose |
|---|---|
| `NEXT_PUBLIC_SOCKET_URL` | Socket.io backend URL used by the frontend |
| `CLIENT_URL` | Frontend origin allowed by the backend CORS configuration |
| `PORT` | Backend listening port; defaults to 4000 locally |

## Current Scope and Limitations

- Ticket and lock data are stored in backend memory and reset when the server restarts.
- The Agent A / Agent B selector is for demonstration and testing, not production authentication.
- The application implements the Frontend Track A requirements and does not include the Track B Ghost Disconnect feature.

## Deployment

Deployment URLs will be added after the frontend and backend are deployed and verified.
