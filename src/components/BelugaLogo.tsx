import React from 'react'

interface BelugaLogoProps {
  className?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  variant?: 'full' | 'icon' | 'white'
}

export const BelugaLogo: React.FC<BelugaLogoProps> = ({
  className = '',
  size = 'md',
  variant = 'full',
}) => {
  const sizeClasses = {
    sm: 'h-7',
    md: 'h-10',
    lg: 'h-14',
    xl: 'h-20',
  }

  const isWhite = variant === 'white'

  return (
    <div className={`flex items-center gap-2 select-none ${className}`}>
      {/* Ícone vetorizado estilizado com as cores oficiais da marca Beluga: Laranja (#F28C28), Rosa (#F26D8C) e Azul Piscina (#1CA0D8) */}
      <svg
        className={`${sizeClasses[size]} w-auto aspect-square`}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M15 65C25 55 40 45 65 40C80 37 88 45 85 55C80 70 55 75 30 78C20 79 15 75 15 65Z"
          fill="#1CA0D8"
        />
        <path d="M25 45C35 30 55 25 75 30C65 35 55 48 45 52C32 57 26 50 25 45Z" fill="#F26D8C" />
        <path d="M10 70C15 60 25 62 35 58C28 68 20 78 10 70Z" fill="#F28C28" />
        <circle cx="72" cy="46" r="3.5" fill="#FFFFFF" />
      </svg>

      {variant !== 'icon' && (
        <div className="flex flex-col leading-none">
          <span
            className={`font-black tracking-tight text-xl ${
              isWhite ? 'text-white' : 'text-[#0B3D5C]'
            }`}
          >
            Beluga
          </span>
          <span
            className={`text-[10px] font-semibold uppercase tracking-widest ${
              isWhite ? 'text-[#7CD4EF]' : 'text-[#1CA0D8]'
            }`}
          >
            piscinas
          </span>
        </div>
      )}
    </div>
  )
}
