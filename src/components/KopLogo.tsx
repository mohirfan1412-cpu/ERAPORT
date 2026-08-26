import React from 'react';

interface KopLogoProps {
  logoUrl?: string;
  className?: string;
  size?: number;
}

export const KopLogo: React.FC<KopLogoProps> = ({
  logoUrl,
  className = '',
  size = 64,
}) => {
  if (logoUrl && logoUrl.trim() !== '') {
    return (
      <img
        src={logoUrl}
        alt="Logo Lembaga"
        className={`object-contain rounded-full ${className}`}
        style={{ width: `${size}px`, height: `${size}px` }}
        crossOrigin="anonymous"
      />
    );
  }

  // Authentic Islamic Education & UMMI Al-Qur'an Emblem Vector Logo
  return (
    <div
      className={`inline-flex items-center justify-center select-none ${className}`}
      style={{ width: `${size}px`, height: `${size}px` }}
    >
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-xs"
      >
        {/* Outer Circular Rings */}
        <circle cx="50" cy="50" r="47" stroke="#000080" strokeWidth="2.5" fill="#f8fafc" />
        <circle cx="50" cy="50" r="43" stroke="#059669" strokeWidth="1.2" strokeDasharray="2 1.5" />
        <circle cx="50" cy="50" r="39" stroke="#000080" strokeWidth="1" fill="#ffffff" />

        {/* Decorative Golden Starburst Rays */}
        <g stroke="#d97706" strokeWidth="1" opacity="0.6">
          <line x1="50" y1="13" x2="50" y2="17" />
          <line x1="50" y1="83" x2="50" y2="87" />
          <line x1="13" y1="50" x2="17" y2="50" />
          <line x1="83" y1="50" x2="87" y2="50" />
          <line x1="24" y1="24" x2="27" y2="27" />
          <line x1="73" y1="73" x2="76" y2="76" />
          <line x1="24" y1="76" x2="27" y2="73" />
          <line x1="73" y1="27" x2="76" y2="24" />
        </g>

        {/* Islamic Crescent Moon */}
        <path
          d="M 54 22 C 40 23 30 34 30 48 C 30 62 41 73 55 73 C 58 73 62 72 65 70 C 53 68 45 58 45 47 C 45 36 52 26 64 23 C 61 22 57 22 54 22 Z"
          fill="#059669"
        />

        {/* Golden 8-pointed Star */}
        <path
          d="M 59 30 L 61 35 L 66 33 L 64 38 L 69 40 L 64 42 L 66 47 L 61 45 L 59 50 L 57 45 L 52 47 L 54 42 L 49 40 L 54 38 L 52 33 L 57 35 Z"
          fill="#d97706"
        />

        {/* Open Holy Qur'an (Mushaf Rehal) */}
        <g transform="translate(0, 3)">
          {/* Wooden Rehal Stand */}
          <path
            d="M 33 69 L 50 60 L 67 69 M 37 69 L 50 63 L 63 69"
            stroke="#92400e"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          {/* Left Page */}
          <path
            d="M 50 56 C 44 54 36 55 31 59 L 31 46 C 36 42 44 41 50 43 Z"
            fill="#fef08a"
            stroke="#000080"
            strokeWidth="1.2"
          />
          {/* Right Page */}
          <path
            d="M 50 56 C 56 54 64 55 69 59 L 69 46 C 64 42 56 41 50 43 Z"
            fill="#fef08a"
            stroke="#000080"
            strokeWidth="1.2"
          />
          {/* Qur'an Page Lines (Ayat) */}
          <line x1="34" y1="48" x2="47" y2="46" stroke="#000080" strokeWidth="0.7" />
          <line x1="34" y1="52" x2="47" y2="50" stroke="#000080" strokeWidth="0.7" />
          <line x1="34" y1="56" x2="47" y2="54" stroke="#000080" strokeWidth="0.7" />

          <line x1="53" y1="46" x2="66" y2="48" stroke="#000080" strokeWidth="0.7" />
          <line x1="53" y1="50" x2="66" y2="52" stroke="#000080" strokeWidth="0.7" />
          <line x1="53" y1="54" x2="66" y2="56" stroke="#000080" strokeWidth="0.7" />
        </g>

        {/* Bottom Banner Ribbon: UMMI */}
        <path
          d="M 28 80 Q 50 74 72 80 L 70 86 Q 50 80 30 86 Z"
          fill="#000080"
        />
        <text
          x="50"
          y="83.5"
          textAnchor="middle"
          fill="#ffffff"
          fontSize="5.2"
          fontWeight="bold"
          fontFamily="sans-serif"
          letterSpacing="1"
        >
          UMMI & TAHFIDZ
        </text>
      </svg>
    </div>
  );
};
