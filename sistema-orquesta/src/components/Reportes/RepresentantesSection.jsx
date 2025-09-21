import ReportTable from "./ReportTable";
import ReportPieChart from "./ReportPieChart";

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
        <ReportPieChart title="Representantes por Alumnos" data={representantesPorAlumnos} dataKey="cantidad" nameKey="nombre"/>
      </div>
    );
  }
}
