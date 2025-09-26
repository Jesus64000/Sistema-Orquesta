import React from "react";

/*
  Pill: componente base para chips / badges.
  Props:
    - children
    - tone: visual semantic (neutral|gray|yellow|red|green|blue)
    - size: xs | sm (default sm)
    - leadingDot: color class para el punto (ej: 'bg-emerald-500')
    - className: extra tailwind
    - as: componente/etiqueta (default span)
    - loading: muestra spinner pequeño
*/

const toneMap = {
  neutral: "bg-gradient-to-b from-gray-50 to-gray-100 text-gray-700 border-gray-200",
  gray: "bg-gradient-to-b from-gray-50 to-gray-100 text-gray-700 border-gray-200",
  yellow: "bg-gradient-to-b from-yellow-50 to-yellow-100 text-yellow-800 border-yellow-200",
  red: "bg-gradient-to-b from-red-50 to-red-100 text-red-700 border-red-200",
  green: "bg-gradient-to-b from-emerald-50 to-emerald-100 text-emerald-700 border-emerald-200",
  blue: "bg-gradient-to-b from-blue-50 to-blue-100 text-blue-700 border-blue-200",
};

export default function Pill(props) {
  const {
    children,
    tone = "neutral",
    size = "sm",
    leadingDot,
    className = "",
    as: Tag = "span",
    loading = false,
    dotClassName = "",
    ...rest
  } = props;
  const base = "inline-flex items-center font-medium rounded-full border shadow-sm";
  const sizing = size === "xs" ? "text-[11px] px-2 py-0.5" : "text-[11px] px-2.5 py-0.5";
  const visual = toneMap[tone] || toneMap.neutral;
  return (
    <Tag
      className={`${base} ${sizing} ${visual} ${className}`}
      {...rest}
    >
      {loading ? (
        <span className="h-3 w-3 inline-block animate-spin rounded-full border-2 border-current border-t-transparent mr-1" aria-label="Cargando" />
      ) : leadingDot ? (
        <span className={`h-2 w-2 rounded-full mr-1 ${leadingDot} ${dotClassName}`} />
      ) : null}
      {children}
    </Tag>
  );
}
