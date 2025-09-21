import ReportTable from "./ReportTable";
import ReportBarChart from "./ReportBarChart";
import ReportPieChart from "./ReportPieChart";

export default function InstrumentosSection({ instrumentosEstado, instrumentosCategoria, instrumentosTop, viewGlobal }) {
  if (viewGlobal === "tabla") {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ReportTable title="Instrumentos por Estado" data={instrumentosEstado} cols={["estado","cantidad"]}/>
        <ReportTable title="Instrumentos por Categoría" data={instrumentosCategoria} cols={["categoria","cantidad"]}/>
        <ReportTable title="Top Instrumentos Asignados" data={instrumentosTop} cols={["nombre","cantidad"]}/>
      </div>
    );
  } else {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ReportPieChart title="Instrumentos por Estado" data={instrumentosEstado} dataKey="cantidad" nameKey="estado"/>
        <ReportBarChart title="Instrumentos por Categoría" data={instrumentosCategoria} dataKey="cantidad" nameKey="categoria"/>
        <ReportBarChart title="Top Instrumentos Asignados" data={instrumentosTop} dataKey="cantidad" nameKey="nombre"/>
      </div>
    );
  }
}
