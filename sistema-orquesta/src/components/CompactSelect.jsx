// CompactSelect.jsx
// Desplegable compacto, moderno, pensado para KPIs.
// Props:
// - options: Array<{ label: string, value: string }>
// - value: string
// - onChange: (value: string) => void
// - size?: 'sm' | 'md'
// - variant?: 'pill' | 'outline'
// - tone?: 'subtle' | 'filled'
// - accent?: 'yellow' | 'sky' | 'green' | 'purple' | 'gray'
// - className?: string

import React from "react";

export default function CompactSelect({ options = [], value, onChange, size = "sm", variant = "pill", tone = "subtle", accent = "gray", className = "" }) {
  const sizes = {
    sm: "text-[11px] py-1 pl-2 pr-6 h-7 min-w-[110px]",
    md: "text-sm py-1.5 pl-3 pr-8 h-9 min-w-[140px]",
  };

  const variants = {
    pill: "rounded-full",
    outline: "rounded-md",
  };

  const accents = {
    yellow: {
      ring: "focus:ring-yellow-400",
      border: "border-yellow-200 hover:border-yellow-300",
      bgHover: "hover:bg-yellow-50/80",
      filledBg: "bg-yellow-400 hover:bg-yellow-500",
      textFilled: "text-gray-900",
    },
    sky: {
      ring: "focus:ring-sky-400",
      border: "border-sky-200 hover:border-sky-300",
      bgHover: "hover:bg-sky-50/80",
      filledBg: "bg-sky-500 hover:bg-sky-600",
      textFilled: "text-white",
    },
    green: {
      ring: "focus:ring-emerald-400",
      border: "border-emerald-200 hover:border-emerald-300",
      bgHover: "hover:bg-emerald-50/80",
      filledBg: "bg-emerald-500 hover:bg-emerald-600",
      textFilled: "text-white",
    },
    purple: {
      ring: "focus:ring-violet-400",
      border: "border-violet-200 hover:border-violet-300",
      bgHover: "hover:bg-violet-50/80",
      filledBg: "bg-violet-500 hover:bg-violet-600",
      textFilled: "text-white",
    },
    gray: {
      ring: "focus:ring-gray-300",
      border: "border-gray-200 hover:border-gray-300",
      bgHover: "hover:bg-gray-50/80",
      filledBg: "bg-gray-500 hover:bg-gray-600",
      textFilled: "text-white",
    },
  };
  const A = accents[accent] || accents.gray;

  return (
    <div className={`relative inline-flex items-center ${className}`}>
      <select
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        className={`appearance-none cursor-pointer transition-colors duration-150 ease-out focus:outline-none focus:ring-2 ${A.ring} focus:ring-offset-1 focus:ring-offset-white px-2 ${sizes[size]} ${variants[variant]} ${
          tone === "filled"
            ? `${A.filledBg} ${A.textFilled} border border-transparent`
            : `bg-white/80 backdrop-blur-sm ${A.border} ${A.bgHover} border shadow-sm`
        }`}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <svg
        className={`pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 ${tone === "filled" ? A.textFilled : "text-gray-500"}`}
        viewBox="0 0 20 20"
        fill="currentColor"
        aria-hidden="true"
      >
        <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 011.08 1.04l-4.25 4.25a.75.75 0 01-1.08 0L5.21 8.27a.75.75 0 01.02-1.06z" clipRule="evenodd" />
      </svg>
    </div>
  );
}
