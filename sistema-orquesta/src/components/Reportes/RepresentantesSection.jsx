import ReportTable from "./ReportTable";

export default function RepresentantesSection({ representantesPorAlumnos, viewGlobal }) {
  if (viewGlobal === "tabla") {
    return (
      <div className="grid grid-cols-1 gap-4">
        <ReportTable title="Representantes por Alumnos" data={representantesPorAlumnos} cols={["nombre","cantidad"]}/>
      </div>
    );
  } else {
    return (
      <div className="grid grid-cols-1 gap-4">
        {/* Mantener como tabla también en vista de gráficas */}
        <ReportTable title="Representantes por Alumnos" data={representantesPorAlumnos} cols={["nombre","cantidad"]}/>
      </div>
    );
  }
}
