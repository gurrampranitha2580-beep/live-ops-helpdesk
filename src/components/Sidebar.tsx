export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-mark">R</div>
        <div>
          <h2>RapidDispatch</h2>
          <span>SUPPORT OPERATIONS</span>
        </div>
      </div>

      <nav>
        <p className="nav-label">WORKSPACE</p>

        <div className="nav-item active">
          <span>▦</span>
          Tickets
        </div>
      </nav>

      <div className="sidebar-footer">
        <span className="status-dot" />
        Operations workspace
      </div>
    </aside>
  );
}