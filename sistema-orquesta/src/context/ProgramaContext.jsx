// sistema-orquesta/src/context/ProgramaContext.jsx
import { createContext, useContext, useState, useEffect } from "react";
import { getProgramas } from "../api/programas";

// Crear el contexto
const ProgramaContext = createContext();

// Hook para usar el contexto fácilmente
export const usePrograma = () => useContext(ProgramaContext);

// Proveedor del contexto
export function ProgramaProvider({ children }) {
  const [programas, setProgramas] = useState([]);
  const [programaSeleccionado, setProgramaSeleccionado] = useState(null);

  // Cargar programas al iniciar
  useEffect(() => {
    const loadProgramas = async () => {
      try {
        const res = await getProgramas();
        setProgramas(res.data);
        if (res.data.length > 0) {
          setProgramaSeleccionado(res.data[0].id_programa); // seleccionar el primero por defecto
        }
      } catch (err) {
        console.error("Error cargando programas:", err);
      }
    };
    loadProgramas();
  }, []);

  return (
    <ProgramaContext.Provider
      value={{ programas, programaSeleccionado, setProgramaSeleccionado }}
    >
      {children}
    </ProgramaContext.Provider>
  );
}
