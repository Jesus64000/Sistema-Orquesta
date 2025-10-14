// sistema-orquesta/src/context/ProgramaContext.jsx
/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect } from "react";
import { getProgramas } from "../api/programas";
import { useAuth } from "./AuthContext";

// Crear el contexto
const ProgramaContext = createContext();

// Hook para usar el contexto fácilmente
export const usePrograma = () => useContext(ProgramaContext);

// Proveedor del contexto
export function ProgramaProvider({ children }) {
  const [programas, setProgramas] = useState([]);
  const [programaSeleccionado, setProgramaSeleccionado] = useState(null);
  const { token, initializing } = useAuth();

  // Cargar programas al iniciar
  useEffect(() => {
    const loadProgramas = async () => {
      try {
        const res = await getProgramas();
        const list = Array.isArray(res?.data) ? res.data : [];
        setProgramas(list);
        setProgramaSeleccionado(list.length > 0 ? list[0].id_programa : null);
      } catch (err) {
        // Evitar ruido de 401 en login: solo log si hay token
        if (token) console.error("Error cargando programas:", err);
        setProgramas([]);
        setProgramaSeleccionado(null);
      }
    };
    // Esperar a que termine la restauración inicial y a tener token
    if (initializing) return;
    if (!token) {
      setProgramas([]);
      setProgramaSeleccionado(null);
      return;
    }
    loadProgramas();
  }, [token, initializing]);

  return (
    <ProgramaContext.Provider
      value={{ programas, programaSeleccionado, setProgramaSeleccionado }}
    >
      {children}
    </ProgramaContext.Provider>
  );
}
