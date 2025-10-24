import ReportTable from "./ReportTable";
import ReportBarChart from "./ReportBarChart";
import ReportPieChart from "./ReportPieChart";

export default function AlumnosSection({ alumnosPrograma, alumnosEdad, alumnosGenero, viewGlobal }) {
  if (viewGlobal === "tabla") {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ReportTable title="Alumnos por Programa" data={alumnosPrograma} cols={["programa","cantidad"]}/>
        <ReportTable title="Alumnos por Edad" data={alumnosEdad} cols={["edad","cantidad"]}/>
        <ReportTable title="Alumnos por Género" data={alumnosGenero} cols={["genero","cantidad"]}/>
      </div>
    );
  } else {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ReportBarChart title="Alumnos por Programa" data={alumnosPrograma} dataKey="cantidad" nameKey="programa"/>
        <ReportBarChart title="Alumnos por Edad" data={alumnosEdad} dataKey="cantidad" nameKey="edad"/>
        <ReportPieChart title="Alumnos por Género" data={alumnosGenero} dataKey="cantidad" nameKey="genero"/>
      </div>
    );
  }
}
