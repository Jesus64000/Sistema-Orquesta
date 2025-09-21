import { BarChart3 } from "lucide-react";

export default function ReportesHeader() {
  return (
    <div className="flex items-center justify-between">
      <h1 className="text-2xl font-bold flex items-center gap-2">
        <BarChart3 className="h-6 w-6" />
        Reportes
      </h1>
    </div>
  );
}
