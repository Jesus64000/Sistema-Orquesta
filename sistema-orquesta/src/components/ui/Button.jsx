import React from 'react';
import clsx from 'clsx';

/*
  Componente Button unificado
  Props:
    - variant: primary | success | neutral | dark | ghost | danger
    - size: sm | md | lg
    - loading: bool (muestra spinner)
    - leftIcon / rightIcon: componentes React (opcional)
    - fullWidth: ocupa 100% ancho
    - rounded: full | xl | lg (override)
*/

const base = 'inline-flex items-center justify-center font-medium select-none whitespace-nowrap transition focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed gap-2';

const variantStyles = {
  primary: 'bg-gradient-to-b from-yellow-300 to-yellow-400 hover:from-yellow-400 hover:to-yellow-500 text-gray-900 border border-yellow-400 shadow-sm focus-visible:ring-yellow-300',
  success: 'bg-gradient-to-b from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white border border-emerald-600 shadow-sm focus-visible:ring-emerald-300',
  neutral: 'bg-gradient-to-b from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 text-gray-700 border border-gray-300 shadow-sm focus-visible:ring-gray-300/70',
  dark: 'bg-gradient-to-b from-gray-800 to-gray-900 hover:from-black hover:to-gray-900 text-white border border-gray-800 shadow-sm focus-visible:ring-gray-300',
  ghost: 'bg-transparent text-gray-500 hover:text-gray-700 underline decoration-dotted border-0 focus-visible:ring-gray-300',
  danger: 'bg-gradient-to-b from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white border border-red-600 shadow-sm focus-visible:ring-red-300'
};

const sizeStyles = {
  sm: 'h-8 px-3 text-xs rounded-full',
  md: 'h-10 px-5 text-sm rounded-full',
  lg: 'h-12 px-7 text-base rounded-full'
};

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  leftIcon: LeftIcon,
  rightIcon: RightIcon,
  fullWidth = false,
  rounded, // override
  className = '',
  ...rest
}) {
  const radiusOverride = rounded ? (rounded === 'full' ? 'rounded-full' : rounded === 'xl' ? 'rounded-xl' : 'rounded-lg') : '';
  return (
    <button
      className={clsx(base, variantStyles[variant], sizeStyles[size], radiusOverride, fullWidth && 'w-full', className)}
      aria-disabled={rest.disabled || loading ? 'true' : 'false'}
      {...rest}
    >
      {loading && (
        <span className="animate-spin border-2 border-t-transparent rounded-full h-4 w-4" role="status" aria-label="Cargando" />
      )}
      {LeftIcon && !loading && (
        <span className="inline-flex items-center justify-center h-4 w-4 text-current">
          <LeftIcon className="h-4 w-4" />
        </span>
      )}
      <span className="inline-flex items-center">{children}</span>
      {RightIcon && !loading && (
        <span className="inline-flex items-center justify-center h-4 w-4 text-current">
          <RightIcon className="h-4 w-4" />
        </span>
      )}
    </button>
  );
}
