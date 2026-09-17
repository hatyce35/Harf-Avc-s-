import { toTurkishLower, getFirstTurkishLetter } from '../utils/turkish';

/**
 * Structured Turkish Knowledge Database
 * Maps categoryId -> letter -> list of valid Turkish words/entries
 */
export const TURKISH_DICTIONARY: Record<string, Record<string, string[]>> = {
  name: {
    A: ['Ahmet', 'Ali', 'Ayşe', 'Aslı', 'Aylin', 'Alper', 'Arda', 'Ata', 'Aysel', 'Adem', 'Akın', 'Azra', 'Asuman', 'Alp', 'Alperen', 'Ayhan', 'Aybüke', 'Atlas', 'Asaf', 'Aykut', 'Aysun', 'Atilla', 'Alev', 'Aras', 'Ateş', 'Aynur', 'Azmi'],
    B: ['Burak', 'Büşra', 'Barış', 'Berk', 'Buse', 'Berna', 'Bora', 'Bilal', 'Batuhan', 'Banu', 'Begüm', 'Bahadır', 'Berkay', 'Bahar', 'Bülent', 'Beste', 'Beyza', 'Birkan'],
    C: ['Cem', 'Can', 'Ceren', 'Cansu', 'Cemre', 'Cüneyt', 'Cihan', 'Ceyda', 'Canan', 'Cenk', 'Civan', 'Celal', 'Cavit', 'Cahit', 'Cemil', 'Caner'],
    Ç: ['Çağla', 'Çağrı', 'Çiğdem', 'Çetin', 'Çınar', 'Çağlar', 'Çolpan', 'Çelebi', 'Çiçek'],
    D: ['Deniz', 'Derya', 'Damla', 'Doruk', 'Defne', 'Doğukan', 'Dilek', 'Dursun', 'Duygu', 'Demir', 'Didem', 'Derya', 'Deryacan', 'Dilara', 'Doğan', 'Deryanur'],
    E: ['Emre', 'Elif', 'Ece', 'Eren', 'Ebru', 'Efe', 'Emin', 'Esra', 'Erdem', 'Eylül', 'Enes', 'Ezgi', 'Emir', 'Eymen', 'Erhan', 'Erkan', 'Erol', 'Engin', 'Esma', 'Eda'],
    F: ['Fatih', 'Fatma', 'Furkan', 'Filiz', 'Feyza', 'Ferhat', 'Fikret', 'Fulya', 'Funda', 'Fırat', 'Faruk', 'Feridun', 'Fahri', 'Fazıl', 'Feraye'],
    G: ['Gül', 'Gamze', 'Görkem', 'Gizem', 'Gökhan', 'Gözde', 'Gaye', 'Gülşah', 'Gürkan', 'Gonca', 'Güneş', 'Gökçe', 'Gülben', 'Gülseren', 'Gündüz'],
    H: ['Hakan', 'Hasan', 'Hüseyin', 'Hatice', 'Halil', 'Hilal', 'Hande', 'Harun', 'Hale', 'Hülya', 'Hamza', 'Hulusi', 'Hacer', 'Hayati', 'Haluk', 'Hazan'],
    I: ['Işık', 'Işıl', 'Ilgaz', 'Iraz', 'Ilgın', 'Itrı'],
    İ: ['İrem', 'İsmail', 'İbrahim', 'İlker', 'İpek', 'İlayda', 'İnci', 'İdris', 'İhsan', 'İlknur', 'İlyas', 'İsa', 'İlkay', 'İsmet', 'İzzet'],
    J: ['Jale', 'Jülide', 'Janset', 'Jelena'],
    K: ['Kaan', 'Kerem', 'Kemal', 'Kübra', 'Koray', 'Kadir', 'Kaya', 'Kenan', 'Kıvanç', 'Kudret', 'Kamuran', 'Kazım', 'Kerim', 'Kaan', 'Kuzey', 'Korel'],
    L: ['Leyla', 'Levent', 'Leman', 'Lale', 'Lokman', 'Lütfi', 'Latif', 'Lara', 'Lamia'],
    M: ['Mehmet', 'Murat', 'Merve', 'Mustafa', 'Melis', 'Mert', 'Mahmut', 'Mina', 'Melike', 'Mete', 'Muhammed', 'Miraç', 'Melda', 'Meltem', 'Metin', 'Mesut', 'Mümtaz'],
    N: ['Nur', 'Nisa', 'Nihat', 'Naz', 'Neslihan', 'Necati', 'Nalan', 'Nergis', 'Numan', 'Nazlı', 'Nuri', 'Nedim', 'Nehir', 'Nilüfer', 'Nevin', 'Nazım'],
    O: ['Onur', 'Oğuz', 'Okan', 'Orhan', 'Ozan', 'Osman', 'Olcay', 'Oğuzhan', 'Ogün', 'Orçun', 'Oktay'],
    Ö: ['Ömer', 'Özge', 'Özgür', 'Özlem', 'Önder', 'Öznur', 'Özkan', 'Övgü', 'Övünç', 'Özcan', 'Özden'],
    P: ['Pelin', 'Polat', 'Pınar', 'Perihan', 'Pakize', 'Poyraz', 'Pamir', 'Petek', 'Pervin'],
    R: ['Ramazan', 'Rana', 'Recep', 'Rüya', 'Rıdvan', 'Resul', 'Reyhan', 'Rıza', 'Refik', 'Ruhi', 'Rasim', 'Remzi', 'Rojda'],
    S: ['Selin', 'Sinan', 'Seda', 'Serkan', 'Semih', 'Sibel', 'Sena', 'Salih', 'Süleyman', 'Sarp', 'Suat', 'Sedat', 'Sevim', 'Seher', 'Songül', 'Serdar', 'Sami'],
    Ş: ['Şeyma', 'Şafak', 'Şener', 'Şule', 'Şahin', 'Şükrü', 'Şükran', 'Şevket', 'Şaban', 'Şule', 'Şerif', 'Şenay', 'Şenol'],
    T: ['Tolga', 'Tuğçe', 'Tarik', 'Tarık', 'Tuna', 'Tayfun', 'Turgut', 'Tuba', 'Taner', 'Timur', 'Talat', 'Tahsin', 'Taha', 'Taylan', 'Tülay'],
    U: ['Uğur', 'Umut', 'Ufuk', 'Utku', 'Uras', 'Uraz', 'Ufukcan', 'Ulvi', 'Ulaş'],
    Ü: ['Ümit', 'Ünal', 'Ülkü', 'Ümran', 'Üzeyir', 'Ünsal', 'Ülviye'],
    V: ['Volkan', 'Veli', 'Vedat', 'Vildan', 'Veysel', 'Vahdet', 'Varol', 'Vural'],
    Y: ['Yusuf', 'Yasemin', 'Yasin', 'Yağmur', 'Yiğit', 'Yunus', 'Yeliz', 'Yalçın', 'Yavuz', 'Yaren', 'Yalın', 'Yelda'],
    Z: ['Zeynep', 'Zafer', 'Zehra', 'Zeki', 'Zuhal', 'Ziya', 'Zerrin', 'Zeliha', 'Zekiye', 'Zümra', 'Zilan']
  },
  city: {
    A: ['Adana', 'Adıyaman', 'Afyonkarahisar', 'Ağrı', 'Amasya', 'Ankara', 'Antalya', 'Artvin', 'Aydın', 'Amsterdam', 'Atina'],
    B: ['Balıkesir', 'Bilecik', 'Bingöl', 'Bitlis', 'Bolu', 'Burdur', 'Bursa', 'Berlin', 'Bakü', 'Beyrut', 'Budapeşte'],
    C: ['Cidde', 'Cenevre', 'Cezayir', 'Cakarta', 'Cardiff'],
    Ç: ['Çanakkale', 'Çankırı', 'Çorum', 'Çernobil', 'Çelyabinsk'],
    D: ['Denizli', 'Diyarbakır', 'Düzce', 'Dublin', 'Doha', 'Dresden', 'Dubrovnik', 'Delhi'],
    E: ['Edirne', 'Elazığ', 'Erzincan', 'Erzurum', 'Eskişehir', 'Erivan', 'Edinburgh', 'Eindhoven'],
    F: ['Frankfurt', 'Floransa', 'Famagusta', 'Fethiye', 'Fatsa', 'Fas'],
    G: ['Gaziantep', 'Giresun', 'Gümüşhane', 'Gazze', 'Glasgow', 'Gdansk', 'Göteborg'],
    H: ['Hakkari', 'Hatay', 'Havana', 'Helsinki', 'Hamburg', 'Houston', 'Hannover'],
    I: ['Isparta', 'Iğdır', 'Innsbruck'],
    İ: ['İstanbul', 'İzmir', 'İçel', 'İskenderiye', 'İslamabad', 'İnönü'],
    J: ['Johannesburg', 'Jeddah', 'Jerusalem', 'Jaipur', 'Jakarta'],
    K: ['Kars', 'Kastamonu', 'Kayseri', 'Kırklareli', 'Kırşehir', 'Kocaeli', 'Konya', 'Kütahya', 'Kahramanmaraş', 'Karaman', 'Kırıkkale', 'Kilis', 'Karabük', 'Kahire', 'Kiev'],
    L: ['Londra', 'Lizbon', 'Limasol', 'Lviv', 'Lille', 'Lozan', 'Lefkoşa', 'Lüksemburg'],
    M: ['Malatya', 'Manisa', 'Mardin', 'Mersin', 'Muğla', 'Muş', 'Madrid', 'Milano', 'Münih', 'Moskova'],
    N: ['Nevşehir', 'Niğde', 'New York', 'Napoli', 'Nis', 'Nairobi'],
    O: ['Ordu', 'Osmaniye', 'Oslo', 'Oxford', 'Odessa', 'Orlando'],
    Ö: ['Ödemiş', 'Ölüdeniz', 'Örebro'],
    P: ['Paris', 'Prag', 'Pekin', 'Pisa', 'Porto', 'Palermo', 'Pristina'],
    R: ['Rize', 'Roma', 'Riyad', 'Rotterdam', 'Reykjavik', 'Rabat'],
    S: ['Sakarya', 'Samsun', 'Siirt', 'Sinop', 'Sivas', 'Tekirdağ', 'Sofya', 'Seul', 'Stockholm', 'Sidney', 'Saraybosna'],
    Ş: ['Şanlıurfa', 'Şırnak', 'Şam', 'Şanghay', 'Şişli'],
    T: ['Tekirdağ', 'Tokat', 'Trabzon', 'Tunceli', 'Tokyo', 'Toronto', 'Tiflis', 'Tunus', 'Tiran'],
    U: ['Uşak', 'Ulanbatur', 'Utrecht', 'Ufa'],
    Ü: ['Üsküp', 'Üsküdar', 'Ürgüp'],
    V: ['Van', 'Viyana', 'Varşova', 'Venedik', 'Vilnius', 'Valensiya'],
    Y: ['Yalova', 'Yozgat', 'Yokohama', 'Yerevan'],
    Z: ['Zonguldak', 'Zagreb', 'Zürih', 'Zaragoza']
  },
  country: {
    A: ['Almanya', 'Arjantin', 'Avusturya', 'Avustralya', 'Azerbaycan', 'Arnavutluk', 'Afganistan', 'Angola'],
    B: ['Brezilya', 'Belçika', 'Bulgaristan', 'Bosna Hersek', 'Bahreyn', 'Bangladeş', 'Belarus'],
    C: ['Cezayir', 'Cibuti', 'Curacao'],
    Ç: ['Çekya', 'Çin', 'Çad'],
    D: ['Danimarka', 'Dominik Cumhuriyeti', 'Doğu Timor'],
    E: ['Ekvador', 'Endonezya', 'Ermenistan', 'Estonya', 'Etiyopya', 'Eritre', 'Esvatini'],
    F: ['Fransa', 'Finlandiya', 'Filipinler', 'Filistin', 'Fas', 'Fiji'],
    G: ['Güney Afrika', 'Güney Kore', 'Gürcistan', 'Gana', 'Galler', 'Guatemala'],
    H: ['Hırvatistan', 'Hindistan', 'Hollanda', 'Honduras', 'Haiti', 'Macaristan'],
    I: ['Irak', 'İran'],
    İ: ['İtalya', 'İspanya', 'İngiltere', 'İsveç', 'İsviçre', 'İzlanda', 'İrlanda', 'İsrail'],
    J: ['Japonya', 'Jamaika', 'Jordanya'],
    K: ['Kanada', 'Kazakistan', 'Kolombiya', 'Katar', 'Küba', 'Kuveyt', 'Kırgızistan', 'Kenya', 'Kuzey Kore'],
    L: ['Litvanya', 'Letonya', 'Lübnan', 'Lüksemburg', 'Libya'],
    M: ['Meksika', 'Mısır', 'Moğolistan', 'Maldivler', 'Malezya', 'Macaristan', 'Moldova', 'Madagaskar'],
    N: ['Norveç', 'Nijerya', 'Nepal', 'Yeni Zelanda', 'Nijer', 'Nikaragua'],
    O: ['Umman', 'Orta Afrika'],
    Ö: ['Özbekistan'],
    P: ['Portekiz', 'Polonya', 'Peru', 'Pakistan', 'Panama', 'Paraguay'],
    R: ['Rusya', 'Romanya', 'Ruanda'],
    S: ['Sırbistan', 'Suriye', 'Suudi Arabistan', 'Slovakya', 'Slovenya', 'Senegal', 'Somali'],
    Ş: ['Şili'],
    T: ['Türkiye', 'Tunus', 'Tayland', 'Türkmenistan', 'Tacikistan', 'Togo'],
    U: ['Ukrayna', 'Uruguay', 'Uganda', 'Umman'],
    Ü: ['Ürdün'],
    V: ['Venezuela', 'Vietnam', 'Vatikan'],
    Y: ['Yunanistan', 'Yemen', 'Yeni Zelanda'],
    Z: ['Zambiya', 'Zimbabve']
  },
  animal: {
    A: ['Aslan', 'Ayı', 'Akbaba', 'At', 'Antilop', 'Ahtapot', 'Arı', 'Albatros', 'Ateşböceği', 'Atmaca', 'Akrep', 'Alabalık', 'Ağaçkakan', 'Anakonda'],
    B: ['Balina', 'Bukalemun', 'Baykuş', 'Boğa', 'Bıldırcın', 'Balık', 'Bizon', 'Böcek', 'Bülbül', 'Babun', 'Balporsuğu', 'Bit'],
    C: ['Ceylan', 'Cırcır Böceği', 'Civciv', 'Ceviz Kurdu', 'Cüce Şempanze'],
    Ç: ['Çita', 'Çakal', 'Çekirge', 'Çulluk', 'Çipura', 'Çavuşkuşu'],
    D: ['Deve', 'Domuz', 'Dinozor', 'Denizanası', 'Denizatı', 'Yunus Balığı', 'Doğan', 'Danalburnu', 'Dülger Balığı', 'Dana'],
    E: ['Eşek', 'Engerek', 'Ejderha', 'Emu', 'Engerek Yılanı', 'Eşek Arısı'],
    F: ['Fil', 'Fare', 'Fok', 'Flamingo', 'Fasulye Böceği', 'Fındık Faresi'],
    G: ['Geyik', 'Goril', 'Guguk Kuşu', 'Güvercin', 'Guanako', 'Gelincik', 'Gökdoğan'],
    H: ['Hamster', 'Horoz', 'Hindi', 'Hamsi', 'Hipopotam', 'Hercai Menekşe Kelebeği', 'Halı Böceği'],
    I: ['Istakoz', 'Iskarmoz', 'Ispanak Kurdu', 'Ilgaz Dağ Keçisi'],
    İ: ['İnek', 'İpekböceği', 'İstavrit', 'İspinoz', 'İbibik', 'İguana', 'İzmarit'],
    J: ['Jaguar', 'Japon Balığı'],
    K: ['Kedi', 'Köpek', 'Kaplan', 'Kartal', 'Karga', 'Kirpi', 'Köstebek', 'Koala', 'Kanguru', 'Kunduz', 'Karınca', 'Kelebek', 'Koyun', 'Keçi', 'Kuğu', 'Kertenkele', 'Koç', 'Kuzu'],
    L: ['Leylek', 'Lama', 'Lemur', 'Levrek', 'Leopar', 'Lüfer', 'Loris'],
    M: ['Maymun', 'Martı', 'Manda', 'Mors', 'Mürekkep Balığı', 'Midye', 'Mezgit', 'Muhabbet Kuşu'],
    N: ['Nandu', 'Nar Bülbülü', 'Nalbur Böceği'],
    O: ['Orangutan', 'Okapi', 'Opossum', 'Orkinos', 'Oklu Kirpi'],
    Ö: ['Ördek', 'Öküz', 'Örümcek', 'Ötleğen Kuşu', 'Öveç'],
    P: ['Papağan', 'Panda', 'Pelikan', 'Penguen', 'Puma', 'Panter', 'Palamut', 'Porsuk', 'Pire'],
    R: ['Rakun', 'Ren Geyiği', 'Ringa Balığı', 'Rottweiler'],
    S: ['Sincap', 'Sırtlan', 'Suaygırı', 'Salyangoz', 'Sazan', 'Somon', 'Samur', 'Sülün', 'Sardalya', 'Sığırcık', 'Sinek'],
    Ş: ['Şahin', 'Şempanze', 'Şebek'],
    T: ['Tavşan', 'Tilki', 'Timsah', 'Turna', 'Tavuskuşu', 'Tosbağa', 'Tarantula', 'Toygar', 'Tavuk', 'Tırtıl'],
    U: ['Uğurböceği', 'Uskumru', 'Uzunbacak Kuşu'],
    Ü: ['Üveyik', 'Üçgözlü Balık'],
    V: ['Vatoz', 'Vaşak', 'Vombat', 'Vicuna'],
    Y: ['Yılan', 'Yunus', 'Yarasa', 'Yaban Domuzu', 'Yengeç', 'Yabanarısı', 'Yelve Kuşu'],
    Z: ['Zürafa', 'Zebra', 'Zargana', 'Zümrüt Kuşu']
  },
  plant: {
    A: ['Armut', 'Ayva', 'Ananas', 'Ahududu', 'Avokado', 'Akasya', 'Ayçiçeği', 'Açelya', 'Anemon', 'Adaçayı', 'Aloe Vera', 'Asma', 'Arpa', 'Acur', 'Antep Fıstığı', 'Armut Ağacı'],
    B: ['Biber', 'Bamya', 'Bezelye', 'Bakla', 'Böğürtlen', 'Brokoli', 'Balkabağı', 'Badem', 'Begonya', 'Bambu', 'Buğday', 'Biberiye', 'Begonvil', 'Badem Ağacı'],
    C: ['Ceviz', 'Civanperçemi', 'Ceviz Ağacı', 'Camgüzeli', 'Cennet Hurması'],
    Ç: ['Çilek', 'Çam', 'Çınar', 'Çiğdem', 'Çuha Çiçeği', 'Çay', 'Çörek Otu'],
    D: ['Domates', 'Dereotu', 'Dut', 'Defne', 'Dut Ağacı', 'Dikenotu', 'Dahlia'],
    E: ['Elma', 'Erik', 'Enginar', 'Elma Ağacı', 'Eğrelti Otu', 'Ebegümeci', 'Erguvan', 'Erik Ağacı'],
    F: ['Fındık', 'Fasulye', 'Fesleğen', 'Fındık Ağacı', 'Frezya', 'Frenk Üzümü'],
    G: ['Gül', 'Greyfurt', 'Gelincik', 'Gürgen', 'Gardenya', 'Glayöl', 'Greyfurt Ağacı'],
    H: ['Havuç', 'Hıyar', 'Hurma', 'Hanımeli', 'Hercai Menekşe', 'Ihlamur', 'Hurma Ağacı', 'Hünnap'],
    I: ['Ispanak', 'Ihlamur', 'Isırgan Otu', 'Ilgın Ağacı'],
    İ: ['İncir', 'İğde', 'İncir Ağacı', 'İris', 'İpek Otu'],
    J: ['Jakaranda', 'Japon Gülü', 'Japon Elması'],
    K: ['Kiraz', 'Karpuz', 'Kavun', 'Kayısı', 'Kivi', 'Kestane', 'Karnabahar', 'Kaktüs', 'Karanfil', 'Kavak', 'Kasımpatı', 'Kardelen', 'Kiraz Ağacı', 'Kekik', 'Kereviz'],
    L: ['Limon', 'Lahana', 'Lale', 'Lavanta', 'Leylak', 'Limon Ağacı', 'Lotus', 'Ladin'],
    M: ['Muz', 'Mandalina', 'Marul', 'Maydanoz', 'Mantar', 'Mısır', 'Menekşe', 'Mimoza', 'Meşe', 'Manolya', 'Mürver', 'Melisa', 'Muz Ağacı'],
    N: ['Nar', 'Nane', 'Nohut', 'Nergis', 'Nilüfer', 'Nar Ağacı', 'Nevruz Çiçeği', 'Nektarin', 'Narenciye'],
    O: ['Orkide', 'Okaliptüs', 'Ortanca', 'Oğul Otu', 'Ot'],
    Ö: ['Ökseotu', 'Ölmez Otu'],
    P: ['Portakal', 'Patates', 'Patlıcan', 'Pırasa', 'Pancar', 'Papatya', 'Palmiye', 'Petunya', 'Pelin Otu', 'Portakal Ağacı'],
    R: ['Roka', 'Reyhan', 'Rezene', 'Rhododendron', 'Ravent'],
    S: ['Sarımsak', 'Soğan', 'Salatalık', 'Semizotu', 'Sardunya', 'Sümbül', 'Söğüt', 'Sarısabır', 'Sarmaşık'],
    Ş: ['Şeftali', 'Şalgam', 'Şebboy', 'Şakayık', 'Şimşir', 'Şeftali Ağacı'],
    T: ['Turp', 'Tere', 'Tarçın', 'Tütün', 'Taflan', 'Taze Fasulye', 'Tilki Kuyruğu'],
    U: ['Unutmabeni Çiçeği', 'Uşkun', 'Urmu Dutu'],
    Ü: ['Üzüm', 'Üvez', 'Üzüm Asması', 'Üvez Ağacı'],
    V: ['Vişne', 'Vanilya', 'Vişne Ağacı'],
    Y: ['Yaban Mersini', 'Yonca', 'Yasemin', 'Yosun', 'Yulaf', 'Yer Fıstığı'],
    Z: ['Zeytin', 'Zencefil', 'Zerdeçal', 'Zambak', 'Zeytin Ağacı', 'Zakkum']
  },
  food: {
    A: ['Aşure', 'Adana Kebap', 'Ali Nazik', 'Ayva Tatlısı', 'Arpa Şehriye', 'Acuka', 'Ayran'],
    B: ['Baklava', 'Börek', 'Balık Ekmek', 'Beyti', 'Bulgur Pilavı', 'Biber Dolması', 'Bamya'],
    C: ['Cacık', 'Ciğer Tava', 'Cevizli Sucuk', 'Cıvık Helva'],
    Ç: ['Çorba', 'Çiğ Köfte', 'Çılbır', 'Çöp Şiş', 'Çikolata', 'Çörek'],
    D: ['Döner', 'Dolma', 'Dürüm', 'Dondurma', 'Dalyan Köfte'],
    E: ['Etli Ekmek', 'Elma Turtası', 'Enginar Dolması', 'Ekmek Kadayıfı'],
    F: ['Fasulye', 'Fırın Sütlaç', 'Fındık Ezmesi', 'Falafel', 'Fajita'],
    G: ['Gözleme', 'Güveç', 'Güllü Lokum', 'Gaziantep Baklavası', 'Gavurdağı Salatası'],
    H: ['Hünkar Beğendi', 'Humus', 'Hamsi Tava', 'Haşlama', 'Helva', 'Hamburger'],
    I: ['Ispanaklı Börek', 'Ispanak Yemeği', 'Islak Kek', 'Izgara Köfte'],
    İ: ['İçli Köfte', 'İskender Kebap', 'İrmik Tatlısı', 'İmam Bayıldı', 'İnegöl Köfte'],
    J: ['Jambon', 'Jelibon', 'Jöle'],
    K: ['Köfte', 'Kuru Fasulye', 'Künefe', 'Kadayıf', 'Kazandibi', 'Karnıyarık', 'Kumpir', 'Kokoreç', 'Kelle Paça'],
    L: ['Lahmacun', 'Lokum', 'Lazanya', 'Levrek Buğulama', 'Lentil Soup', 'Lüle Kebap'],
    M: ['Mantı', 'Menemen', 'Mercimek Çorbası', 'Muhallebi', 'Mücver', 'Makarna'],
    N: ['Nohut Yemeği', 'Narlı Salata', 'Nugget'],
    O: ['Omlet', 'Oruk', 'Orman Kebabı'],
    Ö: ['Ördek Dolması', 'Öcce'],
    P: ['Pilav', 'Pide', 'Profiterol', 'Patates Kızartması', 'Pankek', 'Pizza', 'Pastırma'],
    R: ['Revani', 'Roka Salatası', 'Risotto', 'Ratatouille'],
    S: ['Su Böreği', 'Sarma', 'Sütlaç', 'Sucuk', 'Sosis', 'Simit', 'Salata'],
    Ş: ['Şiş Kebap', 'Şekerpare', 'Şöbiyet', 'Şakşuka'],
    T: ['Tantuni', 'Tarhana Çorbası', 'Tas Kebabı', 'Tiramisu', 'Tavuk Sote', 'Tost'],
    U: ['Un Helvası', 'Urfa Kebap', 'Uskumru Dolması'],
    Ü: ['Üzüm Hoşafı', 'Üç Peynirli Makarna'],
    V: ['Waffle', 'Vişneli Ekmek Kadayıfı', 'Van Kahvaltısı'],
    Y: ['Yayık Ayranı', 'Yaprak Sarma', 'Yoğurtlu Kebap', 'Yumurta'],
    Z: ['Zeytinyağlı Enginar', 'Zerde', 'Zeytinyağlı Fasulye', 'Zeytin Ezmesi']
  },
  profession: {
    A: ['Avukat', 'Aşçı', 'Aktör', 'Akademisyen', 'Antrenör', 'Arkeolog', 'Astronot', 'Asker'],
    B: ['Berber', 'Bakkal', 'Banka Memuru', 'Bahçıvan', 'Biyolog', 'Borsacı', 'Balerin'],
    C: ['Cerrah', 'Cankurtaran', 'Cellat'],
    Ç: ['Çiftçi', 'Çevirmen', 'Çilingir', 'Çocuk Gelişimci'],
    D: ['Doktor', 'Diş Hekimi', 'Diyetisyen', 'Dalgıç', 'Dedektif', 'Danışman', 'Denizci'],
    E: ['Eczacı', 'Elektrikçi', 'Ekonomist', 'Editör', 'Ebe', 'Emlakçı'],
    F: ['Fotoğrafçı', 'Felsefeci', 'Fizyoterapist', 'Fırıncı', 'Futbolcu'],
    G: ['Gazeteci', 'Grafiker', 'Garson', 'Gemi Kaptanı', 'Güvenlik Görevlisi'],
    H: ['Hemşire', 'Hakim', 'Hukukçu', 'Hattat', 'Halterci'],
    I: ['Işıkçı', 'Irgat'],
    İ: ['İnşaat Mühendisi', 'İtfaiyeci', 'İç Mimar', 'İstatistikçi', 'İşletmeci'],
    J: ['Jandarma', 'Jeolog', 'Jokey', 'Jimnastikçi'],
    K: ['Kaptan', 'Kasap', 'Kuaför', 'Kimyager', 'Kütüphaneci', 'Komi', 'Kurye', 'Koreograf'],
    L: ['Laborant', 'Lokman Hekim', 'Lojistik Uzmanı', 'Lastikçi'],
    M: ['Mimar', 'Mühendis', 'Müzisyen', 'Marangoz', 'Muhasebeci', 'Müdür', 'Manav', 'Model'],
    N: ['Noter', 'Nörolog', 'Nalbur'],
    O: ['Oyuncu', 'Operatör', 'Optisyen', 'Otobüs Şoförü'],
    Ö: ['Öğretmen', 'Öğretim Görevlisi', 'Özel Güvenlik'],
    P: ['Pilot', 'Polis', 'Psikolog', 'Programcı', 'Postacı', 'Politikacı', 'Pazarlamacı'],
    R: ['Ressam', 'Radyolog', 'Rehber', 'Rejisör', 'Rektör'],
    S: ['Savcı', 'Sanatçı', 'Sosyolog', 'Spiker', 'Sunucu', 'Sekreter', 'Sigortacı'],
    Ş: ['Şair', 'Şarkıcı', 'Şoför', 'Şef'],
    T: ['Tercüman', 'Terzi', 'Tarihçi', 'Tesisatçı', 'Tasarımcı', 'Teknisyen'],
    U: ['Uçak Mühendisi', 'Uzman Çavuş', 'Uzay Bilimci'],
    Ü: ['Ürolog', 'Üniversite Hocası'],
    V: ['Veteriner', 'Vali', 'Veznedar', 'Vinç Operatörü'],
    Y: ['Yazılımcı', 'Yazar', 'Yönetmen', 'Yargıç', 'Yüzücü'],
    Z: ['Ziraat Mühendisi', 'Zabıta', 'Zanaatkar']
  },
  brand: {
    A: ['Apple', 'Adidas', 'Amazon', 'Audi', 'Arçelik', 'Asus', 'Acer', 'Avon'],
    B: ['BMW', 'Beko', 'Burger King', 'Bosch', 'Bic', 'Bridgestone', 'Beymen'],
    C: ['Casper', 'Chanel', 'Coca-Cola', 'Canon', 'Converse', 'Colgate'],
    Ç: ['Çilek Mobilya', 'Çaykur', 'Çizgi Telekom'],
    D: ['Dacia', 'Dell', 'Defacto', 'Dior', 'Dominos', 'Danone', 'Durex'],
    E: ['Eti', 'Eczacıbaşı', 'Erikli', 'Epson', 'Evkur', 'Enza Home'],
    F: ['Ford', 'Ferrari', 'Fiat', 'Fanta', 'Faber-Castell', 'Flormar'],
    G: ['Google', 'Gucci', 'Garanti', 'Grundig', 'Gap', 'Gillette'],
    H: ['Honda', 'Hyundai', 'Huawei', 'HP', 'H&M', 'Haribo', 'Head & Shoulders'],
    I: ['IKEA', 'IBM', 'Intel', 'Inglot'],
    İ: ['İpek Kağıt', 'İstikbal', 'İş Bankası', 'İçim Süt'],
    J: ['Jeep', 'Jordan', 'JBL', 'Jack & Jones'],
    K: ['Koton', 'Kia', 'Koçtaş', 'KFC', 'Knorr', 'Kahve Dünyası', 'Korkmaz'],
    L: ['Lenovo', 'LG', 'Lacoste', 'Lego', 'Lipton', 'Loreal', 'LC Waikiki'],
    M: ['Mercedes', 'Microsoft', 'McDonalds', 'Migros', 'Mavi', 'Monster', 'Milka'],
    N: ['Nike', 'Netflix', 'Nestle', 'Nissan', 'Nivea', 'Nokia'],
    O: ['Opel', 'Oppo', 'Oral-B', 'Omo', 'Orkid'],
    Ö: ['Özdilek', 'Özkaynak'],
    P: ['Puma', 'Peugeot', 'Philips', 'Penti', 'Pepsi', 'Pringles', 'Porsche'],
    R: ['Renault', 'Red Bull', 'Reebok', 'Rolex', 'Rowenta'],
    S: ['Samsung', 'Sony', 'Starbucks', 'Spotify', 'Siemens', 'Sütaş', 'Skoda'],
    Ş: ['Şölen', 'Şişecam', 'Şok Market'],
    T: ['Toyota', 'Tesla', 'Turkcell', 'Türk Telekom', 'Torku', 'Tchibo', 'THY'],
    U: ['Uber', 'Under Armour', 'Ülker', 'Unilever'],
    Ü: ['Ülker', 'Ümit Bisiklet'],
    V: ['Volvo', 'Volkswagen', 'Vestel', 'Vakko', 'Vodafone', 'Vans'],
    Y: ['Yapı Kredi', 'Yemeksepeti', 'Yamaha', 'Yves Rocher'],
    Z: ['Zara', 'Ziraat Bankası', 'Zen Pırlanta', 'Zorlu']
  },
  object: {
    A: ['Araba', 'Anahtar', 'Ayna', 'Askı', 'Ampul', 'Avize', 'Ataş', 'Ayakkabı', 'Ajanda', 'Anten', 'Akü', 'Atkı', 'Abajur', 'Açacak'],
    B: ['Bardak', 'Bıçak', 'Bilgisayar', 'Bavul', 'Biberon', 'Bileklik', 'Boya', 'Bant', 'Boru', 'Baza', 'Bere', 'Baston', 'Battaniye'],
    C: ['Ceket', 'Cetvel', 'Cüzdan', 'Cımbız', 'Cam', 'Cezve', 'Cep Telefonu'],
    Ç: ['Çanta', 'Çatal', 'Çekiç', 'Çakmak', 'Çorap', 'Çaydanlık', 'Çerçeve', 'Çizme', 'Çan', 'Çekmece'],
    D: ['Defter', 'Dolap', 'Düğme', 'Dürbün', 'Dikiş İğnesi', 'Dalgıç Tüpü', 'Dantel', 'Davul', 'Düdük', 'Dambıl'],
    E: ['Eldiven', 'Etek', 'Elek', 'Evrak Çantası', 'El Feneri', 'Ekmek Bıçağı', 'Elbise', 'Ekran', 'Eşarp', 'Emzik'],
    F: ['Fincan', 'Fırça', 'Fener', 'Fular', 'Flüt', 'Fırın', 'Fermuar', 'Filtre'],
    G: ['Gözlük', 'Gömlek', 'Gitar', 'Gemi Maketi', 'Gazete', 'Göz Kalemi', 'Gırgır'],
    H: ['Halı', 'Havlu', 'Hırka', 'Hoparlör', 'Hesap Makinesi', 'Heybe', 'Huni', 'Halka', 'Hortum'],
    I: ['Ispanak Rendesi', 'Işık Kaynağı', 'Ip', 'Işık'],
    İ: ['İğne', 'İplik', 'İlaç Kutusu', 'İskambil Kağıdı', 'İpucu Kartı', 'İlaç', 'İp'],
    J: ['Jilet', 'Jant', 'Joker Kartı'],
    K: ['Kalem', 'Kitap', 'Kaşık', 'Koltuk', 'Klavye', 'Kulaklık', 'Kemer', 'Kavanoz', 'Kilit', 'Kupa', 'Kutu', 'Kazak', 'Kaban', 'Kravat', 'Kamyon', 'Kova'],
    L: ['Lamba', 'Laptop', 'Levha', 'Leğen', 'Lif', 'Limonluk', 'Lastik', 'Lavabo'],
    M: ['Masa', 'Makas', 'Minder', 'Matara', 'Mikrofon', 'Mumluk', 'Mıknatıs', 'Mikser', 'Monitör', 'Mendil', 'Matkap', 'Motor'],
    N: ['Nal', 'Nargile', 'Not Defteri', 'Narenciye Sıkacağı', 'Nevresim'],
    O: ['Ocak', 'Oklava', 'Oyuncak', 'Oturan Boğa Heykeli', 'Oto Koltuğu'],
    Ö: ['Önlük', 'Örgü Şişi', 'Ölçü Kabı', 'Örtü'],
    P: ['Paspas', 'Perde', 'Pantolon', 'Pusula', 'Pense', 'Pil', 'Para', 'Priz', 'Pijama', 'Paket', 'Pano', 'Peçete', 'Pikap'],
    R: ['Radyo', 'Rende', 'Ruj', 'Raket', 'Resim Fırçası', 'Ranza'],
    S: ['Sandalye', 'Saat', 'Süpürge', 'Silgi', 'Sözlük', 'Saksı', 'Sürahi', 'Sehpa', 'Soba', 'Sabun', 'Sünger', 'Sepet', 'Süzgeç'],
    Ş: ['Şemsiye', 'Şişe', 'Şapka', 'Şamdan', 'Şerit Metre', 'Şort', 'Şal'],
    T: ['Tabak', 'Tarak', 'Telefon', 'Televizyon', 'Tava', 'Tencere', 'Termos', 'Toka', 'Tişört', 'Tornavida', 'Terlik', 'Tabure', 'Tül', 'Tırnak Makası'],
    U: ['Uçak Maketi', 'Uyku Tulumu', 'USB Bellek', 'Uzatma Kablosu', 'Uçurtma'],
    Ü: ['Ütü', 'Ütü Masası', 'Üçgen Cetvel', 'Üniforma'],
    V: ['Vazo', 'Vantilatör', 'Vida', 'Valiz', 'Vagon'],
    Y: ['Yastık', 'Yorgan', 'Yüzük', 'Yapıştırıcı', 'Yelek', 'Yatak', 'Yelken', 'Yay'],
    Z: ['Zil', 'Zarf', 'Zımba', 'Zincir', 'Zar', 'Zırh']
  },
  sport: {
    A: ['Atletizm', 'Amerikan Futbolu', 'At Biniciliği', 'Aikido', 'Artistik Buz Pateni'],
    B: ['Basketbol', 'Boks', 'Beyzbol', 'Badminton', 'Buz Hokeyi', 'Bisiklet', 'Bowling'],
    C: ['Cirit', 'Cimnastik', 'Curling'],
    Ç: ['Çim Hokeyi', 'Çekiç Atma'],
    D: ['Dalış', 'Dağcılık', 'Dart', 'Dama'],
    E: ['Eskrim', 'Esports', 'Engelli Koşu'],
    F: ['Futbol', 'Formula 1', 'Futsal', 'Frizbi'],
    G: ['Güreş', 'Golf', 'Gülle Atma'],
    H: ['Hentbol', 'Halter', 'Hokey', 'Havacılık'],
    I: ['Irak Koşusu', 'Izgara Futbolu'],
    İ: ['İp Atlama', 'İsveç Jimnastiği'],
    J: ['Judo', 'Jiu Jitsu', 'Jimnastik'],
    K: ['Karate', 'Kürek', 'Kayak', 'Kano', 'Kriket', 'Kick Boks', 'Kikboks'],
    L: ['Langırt', 'Lacrosse'],
    M: ['Masa Tenisi', 'Maraton', 'Motorsporları', 'Modern Pentatlon'],
    N: ['Nordik Kombine'],
    O: ['Okçuluk', 'Oryantiring', 'Otomobil Yarışı'],
    Ö: ['Özgür Dalış'],
    P: ['Pilates', 'Paten', 'Polo', 'Parkur'],
    R: ['Ragbi', 'Rafting', 'Rüzgar Sörfü', 'Ritmik Cimnastik'],
    S: ['Sörf', 'Squash', 'Su Topu', 'Snowboard', 'Sırıkla Atlama'],
    Ş: ['Şınav', 'Şut'],
    T: ['Tenis', 'Tekvando', 'Triatlon', 'Tırmanış'],
    U: ['Uzun Atlama', 'Uçurtma Sörfü'],
    Ü: ['Üç Adım Atlama'],
    V: ['Voleybol', 'Vücut Geliştirme', 'Vela'],
    Y: ['Yüzme', 'Yelken', 'Yamaç Paraşütü', 'Yağlı Güreş', 'Yoga'],
    Z: ['Zumba', 'Zıpkınla Balık Avı']
  },
  color: {
    A: ['Al', 'Altın', 'Açık Mavi', 'Ak', 'Antrasit', 'Alev Kırmızısı'],
    B: ['Beyaz', 'Bordo', 'Bej', 'Bakır', 'Buz Mavisi'],
    C: ['Camgöbeği', 'Ceviz'],
    Ç: ['Çivit Mavisi', 'Çikolata Kahvesi'],
    D: ['Deniz Mavisi', 'Duman Rengi', 'Dore'],
    E: ['Eflatun', 'Erguvan'],
    F: ['Fıstık Yeşili', 'Fuşya', 'Fildişi'],
    G: ['Gri', 'Gül Kurusu', 'Gümüş'],
    H: ['Haki', 'Hardal'],
    I: ['Işık Sarısı'],
    İ: ['İnci Beyazı', 'İndigo'],
    J: ['Jel Rengi'],
    K: ['Kırmızı', 'Kahverengi', 'Kara', 'Kobalt', 'Kavuniçi', 'Krem'],
    L: ['Lacivert', 'Lila', 'Limon Sarısı'],
    M: ['Mavi', 'Mor', 'Mercan', 'Menekşe', 'Mint Yeşili'],
    N: ['Nar Çiçeği', 'Nefti'],
    O: ['Okyanus Mavisi'],
    Ö: ['Ördek Başı Yeşili'],
    P: ['Pembe', 'Pastel Mavi', 'Platin', 'Petrol Yeşili'],
    R: ['Roz', 'Rugan'],
    S: ['Sarı', 'Siyah', 'Somon', 'Su Yeşili'],
    Ş: ['Şampanya', 'Şarap Rengi'],
    T: ['Turuncu', 'Turkuaz', 'Toprak Rengi', 'Taba'],
    U: ['Uçuk Mavi', 'Uçuk Pembe'],
    Ü: ['Üzüm Moru'],
    V: ['Vişne Çürüğü', 'Vizon'],
    Y: ['Yeşil', 'Yosun Yeşili'],
    Z: ['Zümrüt Yeşili', 'Zeytin Yeşili']
  },
  drink: {
    A: ['Ayran', 'Amerikano', 'Adaçayı', 'Ananas Suyu', 'Avokado Smoothie'],
    B: ['Boza', 'Bira', 'Bitki Çayı', 'Buzlu Çay', 'Buzlu Kahve'],
    C: ['Cappuccino', 'Cider', 'Coca Cola'],
    Ç: ['Çay', 'Çikolatalı Süt', 'Çilekli Milkshake'],
    D: ['Damla Sakızlı Türk Kahvesi', 'Domates Suyu'],
    E: ['Espresso', 'Elma Suyu', 'Enerji İçeceği', 'Erik Suyu'],
    F: ['Fanta', 'Filtre Kahve', 'Frappe', 'Fesleğenli Ayran'],
    G: ['Gazoz', 'Greyfurt Suyu', 'Gül Suyu', 'Ginseng Çayı'],
    H: ['Ihlamur', 'Havuc Suyu', 'Hibiskus'],
    I: ['Isırgan Otu Çayı', 'Ihlamur'],
    İ: ['İncir Suyu', 'İce Tea', 'İrlanda Kahvesi'],
    J: ['Jelibonlu İçecek'],
    K: ['Kahve', 'Kefir', 'Kola', 'Kuşburnu', 'Kımız', 'Kayısı Suyu', 'Kakao'],
    L: ['Limonata', 'Latte', 'Limonlu Maden Suyu', 'Likör'],
    M: ['Maden Suyu', 'Mocha', 'Milkshake', 'Meyve Suyu', 'Menengiç Kahvesi'],
    N: ['Nar Suyu', 'Nane Çayı', 'Nescafe'],
    O: ['Oralet', 'Oolong Çayı'],
    Ö: ['Ökseotu Çayı'],
    P: ['Portakal Suyu', 'Papatya Çayı', 'Pancar Suyu'],
    R: ['Rezene Çayı', 'Rooibos Çayı', 'Rakı'],
    S: ['Su', 'Süt', 'Salep', 'Soda', 'Smoothie', 'Soğuk Çay'],
    Ş: ['Şalgam', 'Şerbet', 'Şıra', 'Şarap'],
    T: ['Türk Kahvesi', 'Tarçın Çayı', 'Tonik'],
    U: ['Uzun Kahve', 'Uludağ Gazoz'],
    Ü: ['Üzüm Suyu', 'Üzüm Şırası'],
    V: ['Vişne Suyu', 'Vanilyalı Süt', 'Votka'],
    Y: ['Yeşil Çay', 'Yaban Mersini Suyu'],
    Z: ['Zencefil Çayı', 'Zerdeçal Latte']
  }
};

/**
 * Validates whether an answer exists in our Turkish database or matches sensible rules.
 */
export function validateAnswerLocally(categoryId: string, answer: string, targetLetter: string): { isValid: boolean; reason?: string } {
  if (!answer || answer.trim().length === 0) {
    return { isValid: false, reason: 'Boş cevap' };
  }

  const clean = answer.trim();

  // First letter check
  const firstLetter = getFirstTurkishLetter(clean);
  if (firstLetter !== targetLetter) {
    return { isValid: false, reason: `Cevap '${targetLetter}' harfi ile başlamalı (Başlayan: '${firstLetter}')` };
  }

  // Minimum length check
  if (clean.length < 2) {
    return { isValid: false, reason: 'Çok kısa cevap' };
  }

  // Obvious keyboard mash check (e.g. asdfgh, qwert, zxcv, aaaaaa)
  if (/(.)\1{3,}/.test(clean) || /^[asdfghjklzxcvbnm]+$/i.test(clean) && clean.length > 5 && !TURKISH_DICTIONARY[categoryId]) {
    return { isValid: false, reason: 'Geçersiz harf dizilimi' };
  }

  const categoryDict = TURKISH_DICTIONARY[categoryId];
  if (!categoryDict) {
    // If category has no dedicated list (e.g. general ones), accept if starts with right letter and plausible
    return { isValid: true };
  }

  const letterList = categoryDict[targetLetter];
  if (!letterList || letterList.length === 0) {
    // Rare letter without full listing, be lenient if plausibly Turkish
    return { isValid: true };
  }

  // Normalized search
  const lowerAnswer = toTurkishLower(clean);
  const found = letterList.some(item => {
    const lowerItem = toTurkishLower(item);
    return lowerItem === lowerAnswer;
  });

  if (found) {
    return { isValid: true };
  }

  return { isValid: false, reason: 'Sözlükte bulunamadı veya geçersiz kelime' };
}
