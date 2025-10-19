// SegmentedDropdown.jsx
// Grupo de "mini botones" (segmented control) para alternar opciones en KPIs.
// Props:
// - options: Array<{ label: string, value: string }>
// - value: string
// - onChange: (value: string) => void
// - size?: 'xs' | 'sm' | 'md'
// - accent?: 'gray' | 'yellow' | 'sky' | 'green' | 'purple'
// - className?: string

import React from "react";

const sizes = {
  xs: { wrapper: "p-0.5", option: "px-2 py-0.5 text-[10px]", radius: "rounded-md" },
  sm: { wrapper: "p-0.5", option: "px-2.5 py-1 text-[11px]", radius: "rounded-md" },
  md: { wrapper: "p-1", option: "px-3 py-1.5 text-sm", radius: "rounded-lg" },
};

  const accents = {
  gray: {
    group: "card-90 border",
    active: "card text-app border",
    inactive: "muted hover:text-app",
    ring: "focus:ring-gray-300",
  },
  yellow: {
    group: "bg-yellow-50 border-yellow-200",
    active: "bg-white text-gray-900 border-yellow-200",
    inactive: "text-yellow-800 hover:text-yellow-900",
    ring: "focus:ring-yellow-400",
  },
  sky: {
    group: "card-90 border",
    active: "card text-app border",
    inactive: "text-sky-700 hover:text-sky-900",
    ring: "focus:ring-sky-400",
  },
  green: {
    group: "card-90 border",
    active: "card text-app border",
    inactive: "text-emerald-700 hover:text-emerald-900",
    ring: "focus:ring-emerald-400",
  },
  purple: {
    group: "card-90 border",
    active: "card text-app border",
    inactive: "text-violet-700 hover:text-violet-900",
    ring: "focus:ring-violet-400",
  },
};

export default function SegmentedDropdown({ options = [], value, onChange, size = "sm", accent = "gray", className = "" }) {
  const S = sizes[size] || sizes.sm;
  const A = accents[accent] || accents.gray;

  return (
    <div
      role="tablist"
      aria-label="Selector de vista"
      className={`inline-flex ${S.radius} ${S.wrapper} ${A.group} ${className}`}
    >
  {options.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            role="tab"
            aria-selected={active}
            tabIndex={active ? 0 : -1}
            onClick={() => onChange?.(opt.value)}
            className={`transition-colors ${S.option} ${S.radius} font-medium border focus:outline-none focus:ring-2 ${A.ring} focus:ring-offset-1 focus:ring-offset-white
              ${active ? `${A.active}` : `border-transparent ${A.inactive}`}`}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
