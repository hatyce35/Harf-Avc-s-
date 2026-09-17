import { Category, Difficulty } from '../types';

export const ALL_CATEGORIES: Category[] = [
  {
    id: 'name',
    name: 'İsim (Ad)',
    nameEn: 'Name',
    icon: 'User',
    difficulty: 'easy',
    description: 'Kadın veya erkek isimleri',
    placeholder: 'Örn: Ahmet, Burak, Cemil...'
  },
  {
    id: 'city',
    name: 'Şehir',
    nameEn: 'City',
    icon: 'Building2',
    difficulty: 'easy',
    description: 'Türkiye ve dünya şehirleri',
    placeholder: 'Örn: Ankara, Berlin, Çanakkale...'
  },
  {
    id: 'country',
    name: 'Ülke',
    nameEn: 'Country',
    icon: 'Globe',
    difficulty: 'easy',
    description: 'Dünya üzerindeki bağımsız ülkeler',
    placeholder: 'Örn: Almanya, Brezilya, Danimarka...'
  },
  {
    id: 'animal',
    name: 'Hayvan',
    nameEn: 'Animal',
    icon: 'Cat',
    difficulty: 'easy',
    description: 'Tüm evcil ve vahşi hayvan türleri',
    placeholder: 'Örn: Aslan, Balina, Ceylan...'
  },
  {
    id: 'plant',
    name: 'Bitki / Çiçek',
    nameEn: 'Plant',
    icon: 'Flower2',
    difficulty: 'normal',
    description: 'Çiçekler, ağaçlar, otlar ve bitkiler',
    placeholder: 'Örn: Akasya, Begonya, Çam...'
  },
  {
    id: 'food',
    name: 'Yiyecek / Yemek',
    nameEn: 'Food',
    icon: 'Utensils',
    difficulty: 'easy',
    description: 'Yemekler, meyveler, sebzeler, tatlılar',
    placeholder: 'Örn: Baklava, Çorba, Döner...'
  },
  {
    id: 'drink',
    name: 'İçecek',
    nameEn: 'Drink',
    icon: 'Coffee',
    difficulty: 'normal',
    description: 'Sıcak ve soğuk içecekler',
    placeholder: 'Örn: Ayran, Boza, Çay, Gazoz...'
  },
  {
    id: 'profession',
    name: 'Meslek',
    nameEn: 'Profession',
    icon: 'Briefcase',
    difficulty: 'normal',
    description: 'İş kolları ve unvanlar',
    placeholder: 'Örn: Avukat, Berber, Cerrah, Doktor...'
  },
  {
    id: 'movie',
    name: 'Film / Dizi',
    nameEn: 'Movie',
    icon: 'Film',
    difficulty: 'hard',
    description: 'Yerli ve yabancı sinema ve dizi yapımları',
    placeholder: 'Örn: Avatar, Batman, Çukur, Dağ...'
  },
  {
    id: 'song',
    name: 'Şarkı',
    nameEn: 'Song',
    icon: 'Music',
    difficulty: 'hard',
    description: 'Şarkı isimleri',
    placeholder: 'Örn: Arkadaşım Eşek, Bir Derdim Var...'
  },
  {
    id: 'book',
    name: 'Kitap / Roman',
    nameEn: 'Book',
    icon: 'BookOpen',
    difficulty: 'hard',
    description: 'Edebi eser ve kitap başlıkları',
    placeholder: 'Örn: Acımak, Beyaz Diş, Çalıkuşu...'
  },
  {
    id: 'brand',
    name: 'Marka / Şirket',
    nameEn: 'Brand',
    icon: 'ShoppingBag',
    difficulty: 'normal',
    description: 'Global veya yerli popüler markalar',
    placeholder: 'Örn: Apple, Beko, Casper, Defacto...'
  },
  {
    id: 'vehicle',
    name: 'Taşıt / Araç',
    nameEn: 'Vehicle',
    icon: 'Car',
    difficulty: 'normal',
    description: 'Kara, deniz, hava taşıtları ve modeller',
    placeholder: 'Örn: Araba, Bisiklet, Çekici, Denizaltı...'
  },
  {
    id: 'sport',
    name: 'Spor Dalı',
    nameEn: 'Sport',
    icon: 'Trophy',
    difficulty: 'normal',
    description: 'Olimpik ve geleneksel spor branşları',
    placeholder: 'Örn: Atletizm, Basketbol, Cirit, Dalış...'
  },
  {
    id: 'celebrity',
    name: 'Ünlü Kişi',
    nameEn: 'Celebrity',
    icon: 'Star',
    difficulty: 'hard',
    description: 'Oyuncu, şarkıcı, yönetmen, sporcu vb.',
    placeholder: 'Örn: Acun Ilıcalı, Barış Manço, Cem Yılmaz...'
  },
  {
    id: 'character',
    name: 'Kurgusal Karakter',
    nameEn: 'Character',
    icon: 'Smile',
    difficulty: 'hard',
    description: 'Çizgi roman, film, mitolojik veya oyun karakteri',
    placeholder: 'Örn: Asteriks, Batman, Cedric, Demir Adam...'
  },
  {
    id: 'object',
    name: 'Eşya / Nesne',
    nameEn: 'Object',
    icon: 'Box',
    difficulty: 'easy',
    description: 'Ev ve gündelik hayatta kullanılan alet ve nesneler',
    placeholder: 'Örn: Anahtar, Bardak, Cetvel, Defter...'
  },
  {
    id: 'game',
    name: 'Oyun',
    nameEn: 'Game',
    icon: 'Gamepad2',
    difficulty: 'hard',
    description: 'Video oyunları, kutu oyunları veya sokak oyunları',
    placeholder: 'Örn: Among Us, Brawl Stars, CS:GO, Dama...'
  },
  {
    id: 'app',
    name: 'Mobil Uygulama / Yazılım',
    nameEn: 'App',
    icon: 'Smartphone',
    difficulty: 'normal',
    description: 'Dijital platformlar, uygulamalar ve yazılımlar',
    placeholder: 'Örn: Adobe, Bip, Chrome, Discord, E-Devlet...'
  },
  {
    id: 'color',
    name: 'Renk',
    nameEn: 'Color',
    icon: 'Palette',
    difficulty: 'normal',
    description: 'Temel ve ara renk tonları',
    placeholder: 'Örn: Altın, Beyaz, Camgöbeği, Deniz mavisi...'
  },
  {
    id: 'clothing',
    name: 'Giyim / Kıyafet',
    nameEn: 'Clothing',
    icon: 'Shirt',
    difficulty: 'normal',
    description: 'Giyim eşyaları, kumaşlar ve aksesuarlar',
    placeholder: 'Örn: Atkı, Bere, Ceket, Don, Eldiven...'
  },
  {
    id: 'historical',
    name: 'Tarihi Kişi',
    nameEn: 'Historical Figure',
    icon: 'Scroll',
    difficulty: 'expert',
    description: 'Tarihe yön veren liderler, bilginler ve hükümdarlar',
    placeholder: 'Örn: Atatürk, Barbaros, Cengiz Han, Fatih...'
  },
  {
    id: 'geography',
    name: 'Coğrafi Yer',
    nameEn: 'Geographical Place',
    icon: 'Compass',
    difficulty: 'normal',
    description: 'Dağlar, nehirler, göller, kıtalar, okyanuslar',
    placeholder: 'Örn: Ağrı Dağı, Boğaziçi, Cebelitarık, Dicle...'
  }
];

export const CATEGORY_MAP = new Map<string, Category>(
  ALL_CATEGORIES.map(c => [c.id, c])
);

/**
 * Randomly selects a unique set of categories according to count and difficulty
 */
export function selectRandomCategories(count: number, difficulty: Difficulty = 'normal', previousIds: string[] = []): Category[] {
  let eligible = ALL_CATEGORIES;

  if (difficulty === 'easy') {
    eligible = ALL_CATEGORIES.filter(c => c.difficulty === 'easy' || c.difficulty === 'normal');
  } else if (difficulty === 'hard') {
    eligible = ALL_CATEGORIES.filter(c => c.difficulty === 'normal' || c.difficulty === 'hard');
  } else if (difficulty === 'expert') {
    eligible = ALL_CATEGORIES;
  }

  // Shuffle avoiding direct previous picks if possible
  const notRecent = eligible.filter(c => !previousIds.includes(c.id));
  const pool = notRecent.length >= count ? notRecent : eligible;

  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, shuffled.length));
}
