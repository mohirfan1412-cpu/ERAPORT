import { HaditsItemScores } from '../types';

export interface PredicateInfo {
  predicate: 'Mumtaz' | 'Jayyid Jiddan' | 'Jayyid' | 'Maqbul' | 'Kurang' | '-';
  label: string;
  letter: 'A' | 'B' | 'C' | 'D' | '-';
  color: string;
}

export function getPredicateFromScore(score: number | string): PredicateInfo {
  if (score === '' || score === '-' || score === null || score === undefined) {
    return { predicate: '-', label: '-', letter: '-', color: 'text-gray-500' };
  }
  const num = typeof score === 'string' ? parseFloat(score) : score;
  if (isNaN(num)) {
    return { predicate: '-', label: '-', letter: '-', color: 'text-gray-500' };
  }

  if (num >= 100) {
    return { predicate: 'Mumtaz', label: 'Istimewa', letter: 'A', color: 'text-emerald-700' };
  } else if (num >= 90) {
    return { predicate: 'Jayyid Jiddan', label: 'Sangat Memuaskan', letter: 'A', color: 'text-blue-700' };
  } else if (num >= 80) {
    return { predicate: 'Jayyid', label: 'Memuaskan', letter: 'B', color: 'text-indigo-700' };
  } else if (num >= 70) {
    return { predicate: 'Maqbul', label: 'Cukup Memuaskan', letter: 'C', color: 'text-amber-700' };
  } else {
    return { predicate: 'Kurang', label: 'Perlu Bimbingan', letter: 'D', color: 'text-rose-700' };
  }
}

export function calculateHaditsAverage(scores: HaditsItemScores): { average: number | string; predicate: string } {
  const keys = Object.keys(scores) as (keyof HaditsItemScores)[];
  let sum = 0;
  let count = 0;

  for (const key of keys) {
    const val = scores[key];
    if (val !== '' && val !== '-' && val !== null && val !== undefined) {
      const num = typeof val === 'string' ? parseFloat(val) : val;
      if (!isNaN(num)) {
        sum += num;
        count++;
      }
    }
  }

  if (count === 0) {
    return { average: '-', predicate: '-' };
  }

  const avg = Math.round(sum / count);
  const pred = getPredicateFromScore(avg).predicate;
  return { average: avg, predicate: pred };
}

export const HADITS_LIST: { key: keyof HaditsItemScores; title: string }[] = [
  { key: 'niat', title: 'Niat' },
  { key: 'menuntutIlmu', title: 'Menuntut Ilmu' },
  { key: 'amalJariyah', title: '3 Amal Jariyah' },
  { key: 'menunjukkanKebaikan', title: 'Menunjukkan Kebaikan' },
  { key: 'laranganMenyembunyikanIlmu', title: 'Larangan Menyembunyikan ilmu' },
  { key: 'ikhlas', title: 'Ikhlas' },
  { key: 'rukunIslam', title: 'Rukun Islam' },
  { key: 'mukminSempurna', title: 'Mukmin Sempurna' },
  { key: 'ridhoOrangTua', title: 'Ridho Orang tua' },
  { key: 'laranganTidakMenyapa', title: 'Larangan tidak menyapa' },
];

/**
 * Mengambil daftar nama hadits yang telah disesuaikan (custom names) atau default
 */
export function getHaditsList(
  customNames?: Partial<Record<keyof HaditsItemScores, string>>
): { key: keyof HaditsItemScores; title: string; defaultTitle: string }[] {
  return HADITS_LIST.map((h) => ({
    key: h.key,
    title: (customNames && customNames[h.key] && customNames[h.key]!.trim().length > 0)
      ? customNames[h.key]!.trim()
      : h.title,
    defaultTitle: h.title,
  }));
}

export const HADITS_PRESET_TEMPLATES: {
  name: string;
  sectionTitle: string;
  haditsNames: Record<keyof HaditsItemScores, string>;
}[] = [
  {
    name: 'Standar UMMI (10 Hadits Pilihan)',
    sectionTitle: 'III. HAFALAN HADITS',
    haditsNames: {
      niat: 'Niat',
      menuntutIlmu: 'Menuntut Ilmu',
      amalJariyah: '3 Amal Jariyah',
      menunjukkanKebaikan: 'Menunjukkan Kebaikan',
      laranganMenyembunyikanIlmu: 'Larangan Menyembunyikan ilmu',
      ikhlas: 'Ikhlas',
      rukunIslam: 'Rukun Islam',
      mukminSempurna: 'Mukmin Sempurna',
      ridhoOrangTua: 'Ridho Orang tua',
      laranganTidakMenyapa: 'Larangan tidak menyapa',
    },
  },
  {
    name: 'Hadits Adab & Akhlak Santri',
    sectionTitle: 'III. HAFALAN HADITS AKHLAK & ADAB',
    haditsNames: {
      niat: 'Niat & Keikhlasan',
      menuntutIlmu: 'Keutamaan Belajar',
      amalJariyah: 'Sedekah & Jariyah',
      menunjukkanKebaikan: 'Tolong Menolong',
      laranganMenyembunyikanIlmu: 'Menyampaikan Ilmu',
      ikhlas: 'Adab Berbicara',
      rukunIslam: 'Menjaga Kebersihan',
      mukminSempurna: 'Menyayangi Saudara',
      ridhoOrangTua: 'Birrul Walidain',
      laranganTidakMenyapa: 'Menyebarkan Salam',
    },
  },
  {
    name: 'Hadits & Doa Harian',
    sectionTitle: 'III. HAFALAN HADITS & DOA HARIAN',
    haditsNames: {
      niat: 'Hadits Niat',
      menuntutIlmu: 'Hadits Menuntut Ilmu',
      amalJariyah: 'Hadits Senyum Shodaqoh',
      menunjukkanKebaikan: 'Hadits Menahan Marah',
      laranganMenyembunyikanIlmu: 'Doa Sebelum Belajar',
      ikhlas: 'Doa Kebaikan Dunia Akhirat',
      rukunIslam: 'Doa Masuk Masjid',
      mukminSempurna: 'Doa Keluar Masjid',
      ridhoOrangTua: 'Doa Untuk Orang Tua',
      laranganTidakMenyapa: 'Doa Kafaratul Majlis',
    },
  },
];

export const JUZ_LIST = [
  { key: 'juz30', label: 'Juz 30' },
  { key: 'juz29', label: 'Juz 29' },
  { key: 'juz28', label: 'Juz 28' },
  { key: 'juz1', label: 'Juz 1' },
  { key: 'juz2', label: 'Juz 2' },
  { key: 'juz3', label: 'Juz 3' },
  { key: 'juz4', label: 'Juz 4' },
  { key: 'juz5', label: 'Juz 5' },
  { key: 'juz6', label: 'Juz 6' },
  { key: 'juz7', label: 'Juz 7' },
  { key: 'juz8', label: 'Juz 8' },
  { key: 'juz9', label: 'Juz 9' },
  { key: 'juz10', label: 'Juz 10' },
] as const;

export const DESKRIPSI_PRESETS_TURJUMAN = [
  "Alhamdulillah Ananda memiliki kemampuan yang baik dalam mempelajari dan memahami arti perkata, perkalimat dan Intisari surah-surah pendek dalam Al-Qur'an. Harapannya Ananda dapat terus berinteraksi terhadap Al-Qur'an dengan tilawah dan selalu memuroja'ah hafalannya.",
  "Alhamdulillah Ananda menunjukkan kemajuan yang sangat memuaskan dalam menguasai terjemah perkata dan pemahaman makna ayat. Terus tingkatkan muraja'ah dan tadabbur Al-Qur'an.",
  "Alhamdulillah Ananda cukup baik dalam memahami mufrodat dan intisari ayat Al-Qur'an. Perlu terus diperbanyak latihan menulis (imla') dan memahami konteks kalimat.",
  "Alhamdulillah Ananda memiliki antusiasme tinggi dalam belajar Al-Qur'an dan Turjuman. Semoga Allah senantiasa memberikan keistiqomahan dan keberkahan ilmu."
];

export const CATATAN_GURU_PRESETS_TAHFIDZ = [
  "Alhamdulillah Ananda telah menyelesaikan ujian tahfidz juz 30 surah An-Naas sampai surah An-Naba'. Semoga Ananda istiqomah dalam memuroja'ah dan menambah hafalannya.",
  "Alhamdulillah Ananda telah menuntaskan hafalan Juz 30 dan Juz 29 dengan mutqin. Pertahankan tajwid, makharijul huruf, dan terus melangkah ke juz berikutnya.",
  "Alhamdulillah Ananda telah menyelesaikan target hafalan semester ini dengan capaian memuaskan. Tingkatkan intensitas muroja'ah bersama orang tua di rumah.",
  "Barakallahu fiik, Ananda memiliki kelancaran hafalan dan tajwid yang sangat baik. Semoga menjadi ahlul Qur'an yang membanggakan orang tua di dunia dan akhirat."
];
