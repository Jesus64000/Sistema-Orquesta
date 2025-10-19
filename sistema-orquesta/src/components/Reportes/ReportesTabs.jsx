export default function ReportesTabs({ activeTab, setActiveTab }) {
  const tabs = ["alumnos", "instrumentos", "representantes", "eventos"];
  return (
    <div className="flex items-center gap-2 mb-5 border-b muted" role="tablist" aria-label="Secciones de reportes">
      {tabs.map(tab => {
        const active = activeTab === tab;
        const tabId = `report-tab-${tab}`;
        const panelId = `report-panel-${tab}`;
        return (
          <button
            key={tab}
            id={tabId}
            onClick={() => setActiveTab(tab)}
            role="tab"
            aria-selected={active}
            aria-controls={panelId}
            tabIndex={active ? 0 : -1}
            className={`relative px-4 h-10 text-sm font-medium rounded-t-lg transition focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-300 ${active ? "-mb-px border-b-white text-app font-semibold" : "muted hover:text-app"}`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
            {active && <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-yellow-400 to-yellow-500" />}
          </button>
        );
      })}
    </div>
  );
}
