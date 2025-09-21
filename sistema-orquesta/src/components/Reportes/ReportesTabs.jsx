export default function ReportesTabs({ activeTab, setActiveTab }) {
  const tabs = ["alumnos", "instrumentos", "representantes", "eventos"];
  return (
    <div className="flex gap-2 border-b mt-4">
      {tabs.map(tab => (
        <button
          key={tab}
          onClick={() => setActiveTab(tab)}
          className={`px-4 py-2 rounded-t-lg ${activeTab === tab ? "bg-yellow-400 text-gray-900 font-semibold" : "bg-gray-200 text-gray-700 hover:bg-gray-300"}`}
        >
          {tab.charAt(0).toUpperCase() + tab.slice(1)}
        </button>
      ))}
    </div>
  );
}
