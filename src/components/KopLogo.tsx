import React from 'react';

interface KopLogoProps {
  logoUrl?: string;
  className?: string;
  size?: number;
  alt?: string;
}

/**
 * Komponen Logo Utama (Kiri Kop Raport)
 */
export const KopLogo: React.FC<KopLogoProps> = ({
  logoUrl,
  className = '',
  size = 64,
  alt = 'Logo Lembaga',
}) => {
  if (logoUrl && logoUrl.trim() !== '') {
    return (
      <img
        src={logoUrl}
        alt={alt}
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

interface SecondaryLogoProps {
  logoUrl?: string;
  className?: string;
  size?: number;
  show?: boolean;
}

/**
 * Komponen Logo Kedua (Logo Kanan Kop Raport / Logo Yang Satunya)
 * Mendukung kustomisasi gambar (upload/link) atau preset Mutu UMMI / Kemenag / Kemendikbud
 */
export const SecondaryLogo: React.FC<SecondaryLogoProps> = ({
  logoUrl,
  className = '',
  size = 64,
  show = true,
}) => {
  if (!show) return null;

  // Custom image (Data URL / external link)
  if (logoUrl && logoUrl.trim() !== '' && !logoUrl.startsWith('preset:')) {
    return (
      <img
        src={logoUrl}
        alt="Logo Kanan"
        className={`object-contain rounded-full ${className}`}
        style={{ width: `${size}px`, height: `${size}px` }}
        crossOrigin="anonymous"
      />
    );
  }

  // Preset: Kemenag RI (Ikhlas Beramal)
  if (logoUrl === 'preset:kemenag') {
    return (
      <div
        className={`inline-flex items-center justify-center select-none ${className}`}
        style={{ width: `${size}px`, height: `${size}px` }}
      >
        <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
          <polygon points="50,4 96,50 50,96 4,50" fill="#047857" stroke="#fbbf24" strokeWidth="3" />
          <polygon points="50,14 86,50 50,86 14,50" fill="#ffffff" stroke="#047857" strokeWidth="1.5" />
          <circle cx="50" cy="50" r="24" fill="#065f46" stroke="#fbbf24" strokeWidth="1.5" />
          <path d="M 38 48 Q 50 42 62 48 L 60 56 Q 50 50 40 56 Z" fill="#fef08a" stroke="#d97706" strokeWidth="0.8" />
          <text x="50" y="65" textAnchor="middle" fill="#ffffff" fontSize="5.2" fontWeight="bold" fontFamily="sans-serif">
            KEMENAG
          </text>
        </svg>
      </div>
    );
  }

  // Preset: Kemendikbudristek (Tut Wuri Handayani)
  if (logoUrl === 'preset:kemendikbud') {
    return (
      <div
        className={`inline-flex items-center justify-center select-none ${className}`}
        style={{ width: `${size}px`, height: `${size}px` }}
      >
        <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
          <circle cx="50" cy="50" r="46" fill="#0284c7" stroke="#fbbf24" strokeWidth="3" />
          <circle cx="50" cy="50" r="38" fill="#ffffff" stroke="#0284c7" strokeWidth="1.5" />
          {/* Flame & Wings */}
          <path d="M 50 25 C 44 35 46 45 50 48 C 54 45 56 35 50 25 Z" fill="#dc2626" />
          <path d="M 32 50 C 40 46 48 52 50 58 C 44 58 36 56 32 50 Z" fill="#0284c7" />
          <path d="M 68 50 C 60 46 52 52 50 58 C 56 58 64 56 68 50 Z" fill="#0284c7" />
          {/* Rehal Book */}
          <path d="M 38 66 L 50 60 L 62 66" stroke="#d97706" strokeWidth="2.5" strokeLinecap="round" />
          <text x="50" y="76" textAnchor="middle" fill="#0369a1" fontSize="5" fontWeight="bold" fontFamily="sans-serif">
            TUT WURI
          </text>
        </svg>
      </div>
    );
  }

  // Preset: Standard UMMI Foundation Vector Logo
  if (logoUrl === 'preset:ummi_vector') {
    return (
      <div
        className={`inline-flex items-center justify-center select-none ${className}`}
        style={{ width: `${size}px`, height: `${size}px` }}
      >
        <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
          <circle cx="50" cy="50" r="46" fill="#000080" stroke="#f59e0b" strokeWidth="2.5" />
          <circle cx="50" cy="50" r="38" fill="#ffffff" stroke="#000080" strokeWidth="1.2" />
          <path d="M 50 26 C 40 26 34 34 34 44 C 34 54 42 62 50 62 C 58 62 66 54 66 44 C 66 34 60 26 50 26 Z" fill="#059669" opacity="0.15" />
          {/* Mushaf */}
          <path d="M 33 60 L 50 52 L 67 60 M 36 60 L 50 54 L 64 60" stroke="#92400e" strokeWidth="2" strokeLinecap="round" />
          <path d="M 50 50 C 44 48 36 49 32 53 L 32 40 C 37 36 44 35 50 37 Z" fill="#fef08a" stroke="#000080" strokeWidth="1.2" />
          <path d="M 50 50 C 56 48 64 49 68 53 L 68 40 C 63 36 56 35 50 37 Z" fill="#fef08a" stroke="#000080" strokeWidth="1.2" />
          <text x="50" y="73" textAnchor="middle" fill="#000080" fontSize="6.5" fontWeight="900" fontFamily="sans-serif" letterSpacing="0.5">
            UMMI
          </text>
        </svg>
      </div>
    );
  }

  // Default: Official Mutu UMMI Terjamin Seal Badge (High contrast & perfectly legible)
  return (
    <div
      className={`inline-flex items-center justify-center select-none ${className}`}
      style={{ width: `${size}px`, height: `${size}px` }}
    >
      <div className="w-full h-full rounded-full border-2 border-dashed border-[#000080] bg-white flex flex-col items-center justify-center text-[8.5px] font-bold text-[#000080] text-center p-1 leading-none shadow-2xs">
        <span className="text-[7.5px] font-bold text-slate-700 tracking-wider">MUTU</span>
        <span className="text-[#059669] font-black my-0.5 text-[9.5px] tracking-tight">UMMI</span>
        <span className="text-[7px] font-extrabold text-[#000080]">TERJAMIN</span>
      </div>
    </div>
  );
};
