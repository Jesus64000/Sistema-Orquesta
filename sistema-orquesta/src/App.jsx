import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { 
  Gauge, Users, Music2, Calendar, BarChart3, Settings, LogOut, Wrench, UserCircle2
} from "lucide-react";
import { Toaster } from "react-hot-toast";

// Páginas
import Dashboard from "./pages/Dashboard";
import Alumnos from "./pages/Alumnos";
import Instrumentos from "./pages/Instrumentos";
import Eventos from "./pages/Eventos";
import Reportes from "./pages/Reportes";
import Configuraciones from "./pages/Configuraciones";
import Administracion from "./pages/Administracion";
import Representantes from "./pages/Representantes"; // nuevo

// Sidebar item
// eslint-disable-next-line no-unused-vars
const SidebarItem = ({ icon: IconComp, label, to }) => (
  <Link
    to={to}
    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors hover:bg-gray-100"
  >
  <IconComp className="h-5 w-5" />
    <span>{label}</span>
  </Link>
);

export default function App() {
  return (
    <Router>
      <div className="min-h-screen bg-white text-gray-900">
        <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr]">
          {/* Sidebar */}
          <aside className="bg-white border-r border-gray-200 p-5 lg:min-h-screen shadow-sm">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-yellow-400 grid place-items-center text-gray-900 shadow">
                <Music2 className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-gray-500 leading-none">Sistema Nacional</p>
                <p className="text-sm font-semibold text-gray-900 leading-none">de Orquestas – Cabimas</p>
              </div>
            </div>

            <div className="mt-6 space-y-2">
              <SidebarItem icon={Gauge} label="Panel de control" to="/" />
              <SidebarItem icon={Users} label="Alumnos" to="/alumnos" />
              <SidebarItem icon={UserCircle2} label="Representantes" to="/representantes" />
              <SidebarItem icon={Music2} label="Instrumentos" to="/instrumentos" />
              <SidebarItem icon={Calendar} label="Eventos" to="/eventos" />
              <SidebarItem icon={BarChart3} label="Reportes" to="/reportes" />
              <SidebarItem icon={Settings} label="Configuraciones" to="/configuraciones" />
              <SidebarItem icon={Wrench} label="Administración" to="/administracion" />
            </div>

            <div className="mt-8 pt-4 border-t border-gray-200">
              <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-100">
                <LogOut className="h-5 w-5" />
                <span>Cerrar sesión</span>
              </button>
            </div>
          </aside>

          {/* Main */}
          <main className="p-6 lg:p-8">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/alumnos" element={<Alumnos />} />
              <Route path="/representantes" element={<Representantes />} />
              <Route path="/instrumentos" element={<Instrumentos />} />
              <Route path="/eventos" element={<Eventos />} />
              <Route path="/reportes" element={<Reportes />} />
              <Route path="/configuraciones" element={<Configuraciones />} />
              <Route path="/administracion" element={<Administracion />} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
}
