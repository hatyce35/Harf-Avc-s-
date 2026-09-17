export interface VirtualOpponent {
  id: string;
  name: string;
  title: string;
  avatarChar: string;
  avatarColor: string; // Tailwind background
  borderColor: string;
  tagColor: string;
  motto: string;
  speed: 'fast' | 'balanced' | 'steady';
  accuracy: number; // 0 to 1
  favoriteCategory?: string;
}

export const VIRTUAL_OPPONENTS: VirtualOpponent[] = [
  {
    id: 'deniz',
    name: 'Deniz',
    title: 'Hızlı Oyuncu',
    avatarChar: 'D',
    avatarColor: 'bg-sky-500 text-white',
    borderColor: 'border-sky-300',
    tagColor: 'bg-sky-100 text-sky-800 border-sky-200',
    motto: 'Hızlı olan kazanır, hadi başlayalım!',
    speed: 'fast',
    accuracy: 0.90
  },
  {
    id: 'zeynep',
    name: 'Zeynep',
    title: 'Kelime Ustası',
    avatarChar: 'Z',
    avatarColor: 'bg-purple-600 text-white',
    borderColor: 'border-purple-300',
    tagColor: 'bg-purple-100 text-purple-800 border-purple-200',
    motto: 'Kitap kurduyum, nadir kelimeleri severim.',
    speed: 'steady',
    accuracy: 0.96,
    favoriteCategory: 'city'
  },
  {
    id: 'can',
    name: 'Can',
    title: 'Dengeli Rakip',
    avatarChar: 'C',
    avatarColor: 'bg-emerald-600 text-white',
    borderColor: 'border-emerald-300',
    tagColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    motto: 'Klasik İsim Şehir taktikleriyle oynarım!',
    speed: 'balanced',
    accuracy: 0.92
  },
  {
    id: 'defne',
    name: 'Defne',
    title: 'Doğa & Hayvan Sever',
    avatarChar: 'D',
    avatarColor: 'bg-amber-500 text-white',
    borderColor: 'border-amber-300',
    tagColor: 'bg-amber-100 text-amber-900 border-amber-200',
    motto: 'Hayvan ve bitkilerde bana güven!',
    speed: 'balanced',
    accuracy: 0.93,
    favoriteCategory: 'animal'
  }
];
