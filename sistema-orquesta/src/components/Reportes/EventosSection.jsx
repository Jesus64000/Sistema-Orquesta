import ReportTable from "./ReportTable";

export default function EventosSection({ eventosPorMes, viewGlobal, loading = false }) {
  return <ReportTable title="Eventos por Mes" data={eventosPorMes} cols={["mes","cantidad"]}/>;
}
