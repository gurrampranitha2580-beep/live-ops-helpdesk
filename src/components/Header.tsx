interface HeaderProps {
  agentName: string;
}

export default function Header({ agentName }: HeaderProps) {
  return (
    <header className="header">
      <div>
        <p className="breadcrumb">Workspace / Tickets</p>
        <h1>Support Tickets</h1>
        <p className="header-description">
          Monitor and manage active support requests.
        </p>
      </div>

      <div className="agent-profile">
        <div className="agent-avatar">
          {agentName.charAt(0)}
        </div>
        <div>
          <strong>{agentName}</strong>
          <span>Support Agent</span>
        </div>
      </div>
    </header>
  );
}