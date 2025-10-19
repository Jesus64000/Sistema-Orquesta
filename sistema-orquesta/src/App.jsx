import React from "react";
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from "react-router-dom";
import { 
  Gauge, Users, Music2, Calendar, BarChart3, Settings, LogOut, Wrench, UserCircle2
} from "lucide-react";
import { Toaster } from "react-hot-toast";
import { useAuth, IfPermiso } from "./context/AuthContext";
import ThemeToggle from "./components/ui/ThemeToggle";
import AccessDenied from "./components/auth/AccessDenied";

// Páginas
import Dashboard from "./pages/Dashboard";
import Alumnos from "./pages/Alumnos";
import Instrumentos from "./pages/Instrumentos";
import Eventos from "./pages/Eventos";
import Reportes from "./pages/Reportes";
import Configuraciones from "./pages/Configuraciones";
import Administracion from "./pages/Administracion";
import Representantes from "./pages/Representantes"; // nuevo
import Login from "./pages/Login";

// Sidebar item
// eslint-disable-next-line no-unused-vars
const SidebarItem = ({ icon: IconComp, label, to }) => (
  <Link
    to={to}
    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors hover:card"
  >
  <IconComp className="h-5 w-5 muted" />
    <span className="text-app">{label}</span>
  </Link>
);

function AppLayout() {
  const { logout, anyPermiso, user } = useAuth();
  const nivelAcceso = typeof user?.nivel_acceso === 'number' ? user.nivel_acceso : (String(user?.rol?.nombre || user?.rol || '').toLowerCase().includes('admin') ? 0 : 2);
  const canSeeAdminByPerms = anyPermiso([
    ['roles','read'],
    ['usuarios','read'],
    ['programas','read'],
    ['categorias','read'],
    ['estados','read'],
    ['parentescos','read'],
  ]);
  const perms = user?.permisos || [];
  const hasTotal = (r) => perms.includes('*:*') || perms.includes(`${r}:*`);
  const unlocksAdminByTotal = [
    'roles','usuarios','programas','instrumentos','alumnos'
  ].some(hasTotal);
  const canSeeAdmin = nivelAcceso === 0 || (nivelAcceso === 1 && (canSeeAdminByPerms || unlocksAdminByTotal));
  const onLogout = () => { logout(); };

  return (
    <div className="min-h-screen bg-app text-app">
      <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr]">
        {/* Sidebar */}
  <aside className="card border-r p-5 lg:min-h-screen shadow-sm">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-yellow-400 grid place-items-center text-gray-900 shadow">
              <Music2 className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs muted leading-none">Sistema Nacional</p>
              <p className="text-sm font-semibold text-app leading-none">de Orquestas – Cabimas</p>
            </div>
            <div className="ml-auto">
              <ThemeToggle />
            </div>
          </div>

          <div className="mt-6 space-y-2">
            {/* Dashboard siempre visible */}
            <SidebarItem icon={Gauge} label="Panel de control" to="/" />
            <IfPermiso recurso="alumnos" accion="read" fallback={null}>
              <SidebarItem icon={Users} label="Alumnos" to="/alumnos" />
            </IfPermiso>
            <IfPermiso recurso="representantes" accion="read" fallback={null}>
              <SidebarItem icon={UserCircle2} label="Representantes" to="/representantes" />
            </IfPermiso>
            <IfPermiso recurso="instrumentos" accion="read" fallback={null}>
              <SidebarItem icon={Music2} label="Instrumentos" to="/instrumentos" />
            </IfPermiso>
            <IfPermiso recurso="eventos" accion="read" fallback={null}>
              <SidebarItem icon={Calendar} label="Eventos" to="/eventos" />
            </IfPermiso>
            <IfPermiso recurso="reportes" accion="read" fallback={null}>
              <SidebarItem icon={BarChart3} label="Reportes" to="/reportes" />
            </IfPermiso>
            {/* Configuraciones siempre visible (contenido se adapta a permisos) */}
            <SidebarItem icon={Settings} label="Configuraciones" to="/configuraciones" />
            {canSeeAdmin && (
              <SidebarItem icon={Wrench} label="Administración" to="/administracion" />
            )}
          </div>

          <div className="mt-8 pt-4 border-t border-gray-200">
            <button type="button" onClick={onLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-100">
              <LogOut className="h-5 w-5" />
              <span>Cerrar sesión</span>
            </button>
          </div>
        </aside>

        {/* Main */}
        <main className="p-6 lg:p-8">
          <Routes>
            {/* Dashboard sin gating de permisos */}
            <Route path="/" element={<Dashboard />} />
            <Route path="/alumnos" element={
              <IfPermiso recurso="alumnos" accion="read" fallback={<AccessDenied title="Alumnos" message="No tienes permiso para ver alumnos." />}>
                <Alumnos />
              </IfPermiso>
            } />
            <Route path="/representantes" element={
              <IfPermiso recurso="representantes" accion="read" fallback={<AccessDenied title="Representantes" message="No tienes permiso para ver representantes." />}>
                <Representantes />
              </IfPermiso>
            } />
            <Route path="/instrumentos" element={
              <IfPermiso recurso="instrumentos" accion="read" fallback={<AccessDenied title="Instrumentos" message="No tienes permiso para ver instrumentos." />}>
                <Instrumentos />
              </IfPermiso>
            } />
            <Route path="/eventos" element={
              <IfPermiso recurso="eventos" accion="read" fallback={<AccessDenied title="Eventos" message="No tienes permiso para ver eventos." />}>
                <Eventos />
              </IfPermiso>
            } />
            <Route path="/reportes" element={
              <IfPermiso recurso="reportes" accion="read" fallback={<AccessDenied title="Reportes" message="No tienes permiso para ver reportes." />}>
                <Reportes />
              </IfPermiso>
            } />
            {/* Configuraciones sin gating; su contenido internamente se adapta */}
            <Route path="/configuraciones" element={<Configuraciones />} />
            <Route path="/administracion" element={ canSeeAdmin ? (
              <Administracion />
            ) : (
              <AccessDenied title="Administración" message="No tienes permisos para esta sección." />
            ) } />
            <Route path="/login" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default function App() {
  const { user, initializing } = useAuth();
  return (
    <Router>
      <Toaster />
      {initializing ? (
        <div className="min-h-screen grid place-items-center">Cargando…</div>
      ) : user ? (
        <AppLayout />
      ) : (
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      )}
    </Router>
  );
}
