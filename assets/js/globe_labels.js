/**
 * Shared 3D Country Atlas, Micro-Flag SVG Library & Zoom-Adaptive Label Engine
 * Used by IPAS Kelas 4 (iklim_3d_kelas4.html) & IPAS Kelas 6 (dunia_3d_kelas6.html).
 * Requires Three.js and window.PKBM_EARTH.latLonToVec3.
 */
(function (global) {
  'use strict';

  const CONTINENTS = {
    asia:      { name: 'Asia',      lat: 16,  lon: 109,  defaultPin: 'id', radius: 8.6, color: 0x22C55E, fact: '🏮 ASIA: Benua terluas (±44 juta km²) & terpadat penduduknya — rumah Indonesia, Singapura, Brunei, Timor Leste, Jepang, Tiongkok & Maladewa!' },
    amerika:   { name: 'Amerika',   lat: 15,  lon: -78,  defaultPin: 'us', radius: 8.8, color: 0x10B981, fact: '🗽 AMERIKA: Benua terpanjang dari Utara (Kanada, AS, Kuba, Panama) ke Selatan (Brasil • Sungai Amazon & Argentina).' },
    afrika:    { name: 'Afrika',    lat: 8,   lon: 24,   defaultPin: 'eg', radius: 8.8, color: 0xEAB308, fact: '🦁 AFRIKA: Kaya keajaiban alam — Mesir (Sahara & Sungai Nil), Kenya di khatulistiwa, Afrika Selatan & pulau Seychelles.' },
    eropa:     { name: 'Eropa',     lat: 48,  lon: 8,    defaultPin: 'de', radius: 7.4, color: 0x38BDF8, fact: '🏰 EROPA: Benua Biru penuh negara besar hingga negara terkecil dunia (Vatikan, Monako, Luksemburg, Belanda, Swiss)!' },
    australia: { name: 'Australia', lat: -22, lon: 145,  defaultPin: 'au', radius: 8.6, color: 0xF97316, fact: '🦘 AUSTRALIA & OSEANIA: Benua terkecil sekaligus negara Australia, Selandia Baru, Papua Nugini, serta negara kepulauan kecil Fiji & Palau!' },
    antartika: { name: 'Antartika', lat: -80, lon: 15,   defaultPin: 'aq', radius: 8.4, color: 0xF8FAFC, fact: '🐧 ANTARTIKA: Benua es abadi di Kutub Selatan tanpa negara — hanya terdapat stasiun penelitian ilmiah internasional!' }
  };

  const CLIMATE_ZONES = {
    tropis:    { label: 'Iklim Tropis',    lat: 1,   lon: 109,  defaultPin: 'id', radius: 6.4, fact: '🌴 IKLIM TROPIS (0°–23,5° LU/LS): Hangat sepanjang tahun dengan 2 musim (Hujan & Kemarau) — contohnya Indonesia, Singapura, Malaysia, Brunei & Brasil!' },
    subtropis: { label: 'Iklim Subtropis', lat: 43,  lon: 12,   defaultPin: 'de', radius: 6.8, fact: '🍂 IKLIM SUBTROPIS / SEDANG (23,5°–66,5°): Mengalami 4 musim (Semi, Panas, Gugur, Dingin) — contohnya Jepang, Korea Selatan, Jerman, Swiss, Vatikan & Prancis!' },
    kering:    { label: 'Iklim Kering',    lat: 25,  lon: 41,   defaultPin: 'eg', radius: 7.6, fact: '🏜️ IKLIM KERING / GURUN: Curah hujan sangat sedikit dan udara panas kering di siang hari — contohnya Mesir, Arab Saudi & Qatar!' },
    dingin:    { label: 'Iklim Dingin',    lat: 63,  lon: -3,   defaultPin: 'is', radius: 7.8, fact: '❄️ IKLIM DINGIN / KUTUB (>66,5°): Suhu beku bersalju hampir sepanjang tahun — contohnya Islandia, Norwegia utara & benua es Antartika!' }
  };

  // Tier 1 = primary continental hubs; Tier 2 = major regional countries; Tier 3 = small countries, city-states & island micro-nations
  const COUNTRIES = [
    // --- ASIA (15) ---
    {
      id: 'id', name: 'Indonesia', continentId: 'asia', continentLabel: 'Asia', tier: 1, isSmall: false,
      climateZone: 'tropis', climateLabel: 'Tropis • 2 Musim', flag: 'id', lat: -1.5, lon: 114.0, color: 0x10B981,
      factGeo: '🇮🇩 INDONESIA (Asia Tenggara): Negara kepulauan terbesar di dunia yang dilalui garis Khatulistiwa!',
      factClimate: '🇮🇩 INDONESIA (Iklim Tropis): Berada tepat di Khatulistiwa sehingga bersuhu hangat dan mengalami 2 musim (Hujan & Kemarau).'
    },
    {
      id: 'sg', name: 'Singapura', continentId: 'asia', continentLabel: 'Negara Kecil', tier: 3, isSmall: true,
      climateZone: 'tropis', climateLabel: 'Tropis • Negara Kota', flag: 'sg', lat: 1.35, lon: 103.82, color: 0x34D399,
      factGeo: '🇸🇬 SINGAPURA (Negara Kecil • Asia Tenggara): Negara pulau & kota kecil (±734 km²) di ujung Semenanjung Malaya, tetangga dekat Indonesia!',
      factClimate: '🇸🇬 SINGAPURA (Iklim Tropis Khatulistiwa): Negara pulau kecil di garis Khatulistiwa, hangat & lembap dengan hujan merata sepanjang tahun.'
    },
    {
      id: 'bn', name: 'Brunei Darussalam', continentId: 'asia', continentLabel: 'Negara Kecil', tier: 3, isSmall: true,
      climateZone: 'tropis', climateLabel: 'Tropis • Negara Kecil', flag: 'bn', lat: 4.53, lon: 114.72, color: 0x34D399,
      factGeo: '🇧🇳 BRUNEI DARUSSALAM (Negara Kecil • Asia Tenggara): Negara kecil di pantai utara Pulau Kalimantan!',
      factClimate: '🇧🇳 BRUNEI DARUSSALAM (Iklim Tropis): Terletak di Kalimantan utara, beriklim tropis hujan hutan hujan lebat.'
    },
    {
      id: 'tl', name: 'Timor Leste', continentId: 'asia', continentLabel: 'Negara Kecil', tier: 3, isSmall: true,
      climateZone: 'tropis', climateLabel: 'Tropis • Negara Kecil', flag: 'tl', lat: -8.87, lon: 125.73, color: 0x34D399,
      factGeo: '🇹🇱 TIMOR LESTE (Negara Kecil • Asia Tenggara): Negara muda dan mungil di sebelah timur Nusa Tenggara Timur, Indonesia!',
      factClimate: '🇹🇱 TIMOR LESTE (Iklim Tropis Monsun): Memiliki musim kemarau panjang yang dipengaruhi angin kering Australia.'
    },
    {
      id: 'my', name: 'Malaysia', continentId: 'asia', continentLabel: 'Asia', tier: 2, isSmall: false,
      climateZone: 'tropis', climateLabel: 'Tropis • 2 Musim', flag: 'my', lat: 4.21, lon: 101.98, color: 0x22C55E,
      factGeo: '🇲🇾 MALAYSIA (Asia Tenggara): Negara tetangga serumpun yang wilayahnya terbagi di Semenanjung Malaya dan Kalimantan!',
      factClimate: '🇲🇾 MALAYSIA (Iklim Tropis): Dipengaruhi angin monsun Barat Daya dan Timur Laut seperti Indonesia.'
    },
    {
      id: 'th', name: 'Thailand', continentId: 'asia', continentLabel: 'Asia', tier: 2, isSmall: false,
      climateZone: 'tropis', climateLabel: 'Tropis Monsun', flag: 'th', lat: 15.87, lon: 100.99, color: 0x22C55E,
      factGeo: '🇹🇭 THAILAND (Asia Tenggara): Dijuluki Negeri Gajah Putih di daratan utama Asia Tenggara!',
      factClimate: '🇹🇭 THAILAND (Iklim Tropis): Mengalami musim hujan, sejuk singkat, dan kemarau terik.'
    },
    {
      id: 'vn', name: 'Vietnam', continentId: 'asia', continentLabel: 'Asia', tier: 3, isSmall: false,
      climateZone: 'tropis', climateLabel: 'Tropis / Subtropis', flag: 'vn', lat: 14.06, lon: 108.28, color: 0x4ADE80,
      factGeo: '🇻🇳 VIETNAM (Asia Tenggara): Negara pesisir memanjang di timur Semenanjung Indocina.',
      factClimate: '🇻🇳 VIETNAM (Iklim Tropis Monsun): Bagian selatan panas tropis, sedangkan utara lebih sejuk saat angin dingin Asia Timur.'
    },
    {
      id: 'ph', name: 'Filipina', continentId: 'asia', continentLabel: 'Asia', tier: 2, isSmall: false,
      climateZone: 'tropis', climateLabel: 'Tropis Maritim', flag: 'ph', lat: 14.5, lon: 121.1, color: 0x22C55E,
      factGeo: '🇵🇭 FILIPINA (Asia Tenggara): Negara kepulauan dengan lebih dari 7.600 pulau di Samudra Pasifik barat!',
      factClimate: '🇵🇭 FILIPINA (Iklim Tropis Laut): Hangat sepanjang tahun & sering dilintasi badai taifun tropis dari Pasifik.'
    },
    {
      id: 'cn', name: 'Tiongkok', continentId: 'asia', continentLabel: 'Asia', tier: 1, isSmall: false,
      climateZone: 'subtropis', climateLabel: 'Subtropis • 4 Musim', flag: 'cn', lat: 35.86, lon: 104.20, color: 0x22C55E,
      factGeo: '🇨🇳 TIONGKOK (Asia Timur): Salah satu negara terluas & terpadat di Bumi, rumah Tembok Besar Tiongkok!',
      factClimate: '🇨🇳 TIONGKOK (Iklim Subtropis–Sedang): Mengalami 4 musim berbeda & variasi suhu gunung serta dataran luas.'
    },
    {
      id: 'jp', name: 'Jepang', continentId: 'asia', continentLabel: 'Asia', tier: 1, isSmall: false,
      climateZone: 'subtropis', climateLabel: 'Subtropis • 4 Musim', flag: 'jp', lat: 36.20, lon: 138.25, color: 0x22C55E,
      factGeo: '🇯🇵 JEPANG (Asia Timur): Negara kepulauan Matahari Terbit dengan Gunung Fuji yang terkenal!',
      factClimate: '🇯🇵 JEPANG (Iklim Subtropis): Memiliki 4 musim jelas — Semi (mekarnya sakura), Panas, Gugur, dan Dingin bersalju!'
    },
    {
      id: 'kr', name: 'Korea Selatan', continentId: 'asia', continentLabel: 'Asia', tier: 2, isSmall: false,
      climateZone: 'subtropis', climateLabel: 'Subtropis • 4 Musim', flag: 'kr', lat: 35.91, lon: 127.77, color: 0x4ADE80,
      factGeo: '🇰🇷 KOREA SELATAN (Asia Timur): Negara semenanjung modern dengan teknologi tinggi dan budaya K-Pop.',
      factClimate: '🇰🇷 KOREA SELATAN (Iklim Sedang 4 Musim): Musim dingin bersalju sejuk dan musim panas cukup lembap.'
    },
    {
      id: 'in', name: 'India', continentId: 'asia', continentLabel: 'Asia', tier: 1, isSmall: false,
      climateZone: 'tropis', climateLabel: 'Tropis Monsun', flag: 'in', lat: 20.59, lon: 78.96, color: 0x22C55E,
      factGeo: '🇮🇳 INDIA (Asia Selatan): Negara berpenduduk terbanyak di dunia saat ini, terkenal dengan Taj Mahal & Sungai Gangga.',
      factClimate: '🇮🇳 INDIA (Iklim Monsun Tropis): Terhalang Pegunungan Himalaya di utara sehingga musim hujan monsunnya sangat kuat.'
    },
    {
      id: 'mv', name: 'Maladewa', continentId: 'asia', continentLabel: 'Negara Kecil', tier: 3, isSmall: true,
      climateZone: 'tropis', climateLabel: 'Tropis • Pulau Rendah', flag: 'mv', lat: 3.20, lon: 73.22, color: 0x34D399,
      factGeo: '🇲🇻 MALADEWA (Negara Kecil • Samudra Hindia): Negara pulau karang terkecil di Asia & wilayah daratan paling rendah di dunia!',
      factClimate: '🇲🇻 MALADEWA (Iklim Tropis Laut): Sangat rentan terhadap kenaikan permukaan air laut akibat pemanasan global!'
    },
    {
      id: 'sa', name: 'Arab Saudi', continentId: 'asia', continentLabel: 'Asia Barat', tier: 2, isSmall: false,
      climateZone: 'kering', climateLabel: 'Iklim Gurun Kering', flag: 'sa', lat: 23.89, lon: 45.08, color: 0x4ADE80,
      factGeo: '🇸🇦 ARAB SAUDI (Asia Barat): Negara gurun pasir terbesar di Semenanjung Arab.',
      factClimate: '🇸🇦 ARAB SAUDI (Iklim Kering / Gurun): Hujan amat jarang sepanjang tahun; siang hari sangat panas, malam sejuk.'
    },
    {
      id: 'qa', name: 'Qatar', continentId: 'asia', continentLabel: 'Negara Kecil', tier: 3, isSmall: true,
      climateZone: 'kering', climateLabel: 'Gurun • Negara Kecil', flag: 'qa', lat: 25.35, lon: 51.18, color: 0x4ADE80,
      factGeo: '🇶🇦 QATAR (Negara Kecil • Teluk Persia): Negara semenanjung mungil di Jazirah Arab yang sangat modern.',
      factClimate: '🇶🇦 QATAR (Iklim Gurun Kering): Musim panas sangat terik dan curah hujan tahunan sangat kecil.'
    },

    // --- EROPA (12) ---
    {
      id: 'de', name: 'Jerman', continentId: 'eropa', continentLabel: 'Eropa', tier: 1, isSmall: false,
      climateZone: 'subtropis', climateLabel: 'Sedang • 4 Musim', flag: 'de', lat: 51.16, lon: 10.45, color: 0x38BDF8,
      factGeo: '🇩🇪 JERMAN (Eropa Tengah): Negara industri & sains terkemuka di jantung Benua Biru (Eropa).',
      factClimate: '🇩🇪 JERMAN (Iklim Sedang 4 Musim): Mengalami musim semi sejuk, panas ringan, gugur, dan dingin bersalju.'
    },
    {
      id: 'fr', name: 'Prancis', continentId: 'eropa', continentLabel: 'Eropa', tier: 2, isSmall: false,
      climateZone: 'subtropis', climateLabel: 'Sedang • 4 Musim', flag: 'fr', lat: 46.23, lon: 2.21, color: 0x38BDF8,
      factGeo: '🇫🇷 PRANCIS (Eropa Barat): Terkenal dengan Menara Eiffel di Paris dan berbatasan dengan Pegunungan Alpen.',
      factClimate: '🇫🇷 PRANCIS (Iklim Sedang): Terdiri dari iklim maritim barat, mediterania hangat di selatan, dan pegunungan Alpen.'
    },
    {
      id: 'gb', name: 'Inggris (UK)', continentId: 'eropa', continentLabel: 'Eropa', tier: 2, isSmall: false,
      climateZone: 'subtropis', climateLabel: 'Sedang Maritim', flag: 'gb', lat: 54.0, lon: -2.5, color: 0x38BDF8,
      factGeo: '🇬🇧 INGGRIS / BRITANIA RAYA (Eropa): Negara kepulauan yang juga menjadi titik garis waktu nol derajat Greenwich (GMT)!',
      factClimate: '🇬🇧 INGGRIS (Iklim Sedang Laut): Sering berawan dan gerimis sepanjang tahun karena pengaruh Samudra Atlantik.'
    },
    {
      id: 'nl', name: 'Belanda', continentId: 'eropa', continentLabel: 'Negara Kecil', tier: 3, isSmall: true,
      climateZone: 'subtropis', climateLabel: 'Sedang • Negara Kecil', flag: 'nl', lat: 52.10, lon: 5.60, color: 0x7DD3FC,
      factGeo: '🇳🇱 BELANDA (Negara Kecil • Eropa Barat): Negara dataran rendah kincir angin & bunga tulip; sebagian tanahnya lebih rendah dari laut!',
      factClimate: '🇳🇱 BELANDA (Iklim Sedang Laut): Membangun tanggul laut raksasa agar terlindungi dari naiknya permukaan laut global.'
    },
    {
      id: 'ch', name: 'Swiss', continentId: 'eropa', continentLabel: 'Negara Kecil', tier: 3, isSmall: true,
      climateZone: 'subtropis', climateLabel: 'Alpen Dingin • Kecil', flag: 'ch', lat: 46.82, lon: 8.23, color: 0x7DD3FC,
      factGeo: '🇨🇭 SWISS (Negara Kecil • Eropa Tengah): Negara mungil di Pegunungan Alpen yang terkenal dengan jam akurat, cokelat & danau jernih.',
      factClimate: '🇨🇭 SWISS (Iklim Pegunungan Alpen): Puncak gunungnya memiliki gletser salju abadi yang juga sensitif terhadap pemanasan global.'
    },
    {
      id: 'it', name: 'Italia', continentId: 'eropa', continentLabel: 'Eropa', tier: 2, isSmall: false,
      climateZone: 'subtropis', climateLabel: 'Mediterania Hangat', flag: 'it', lat: 40.3, lon: 16.0, color: 0x38BDF8,
      factGeo: '🇮🇹 ITALIA (Eropa Selatan): Berbentuk unik seperti sepatu bot yang menjorok ke Laut Mediterania!',
      factClimate: '🇮🇹 ITALIA (Iklim Mediterania): Musim panas kering cerah dan musim dingin yang relatif sejuk berhujan.'
    },
    {
      id: 'va', name: 'Vatikan', continentId: 'eropa', continentLabel: 'Terkecil Dunia', tier: 3, isSmall: true,
      climateZone: 'subtropis', climateLabel: 'Mediterania • Terkecil', flag: 'va', lat: 41.90, lon: 12.45, color: 0xBAE6FD,
      factGeo: '🇻🇦 VATIKAN (Negara Terkecil di Dunia! • Eropa): Luasnya hanya ±0,44 km² di dalam Kota Roma — bahkan lebih kecil dari satu kecamatan!',
      factClimate: '🇻🇦 VATIKAN (Iklim Mediterania): Negara kota terkecil di dunia dengan musim panas hangat dan musim dingin sejuk.'
    },
    {
      id: 'mc', name: 'Monako', continentId: 'eropa', continentLabel: 'Terkecil ke-2', tier: 3, isSmall: true,
      climateZone: 'subtropis', climateLabel: 'Mediterania • Kecil', flag: 'mc', lat: 43.73, lon: 7.42, color: 0xBAE6FD,
      factGeo: '🇲🇨 MONAKO (Negara Kecil • Eropa Barat): Negara terkecil ke-2 di dunia (±2 km²) di pesisir Laut Mediterania, berbatasan dengan Prancis!',
      factClimate: '🇲🇨 MONAKO (Iklim Mediterania Pesisir): Disinari matahari hampir sepanjang tahun dengan angin laut hangat.'
    },
    {
      id: 'lu', name: 'Luksemburg', continentId: 'eropa', continentLabel: 'Negara Kecil', tier: 3, isSmall: true,
      climateZone: 'subtropis', climateLabel: 'Sedang • Negara Kecil', flag: 'lu', lat: 49.6, lon: 6.13, color: 0xBAE6FD,
      factGeo: '🇱🇺 LUKSEMBURG (Negara Kecil • Eropa Barat): Negara kecil berpemandangan benteng tua di antara Prancis, Jerman & Belgia.',
      factClimate: '🇱🇺 LUKSEMBURG (Iklim Sedang Eropa): Memiliki 4 musim seimbang dengan hutan rindang di perbukitan.'
    },
    {
      id: 'es', name: 'Spanyol', continentId: 'eropa', continentLabel: 'Eropa', tier: 2, isSmall: false,
      climateZone: 'subtropis', climateLabel: 'Mediterania Cerah', flag: 'es', lat: 40.46, lon: -3.75, color: 0x38BDF8,
      factGeo: '🇪🇸 SPANYOL (Eropa Selatan): Berada di Semenanjung Iberia dekat pertemuan Benua Eropa dan Afrika.',
      factClimate: '🇪🇸 SPANYOL (Iklim Mediterania & Semi-Kering): Salah satu wilayah paling cerah di Benua Eropa.'
    },
    {
      id: 'no', name: 'Norwegia', continentId: 'eropa', continentLabel: 'Eropa Utara', tier: 2, isSmall: false,
      climateZone: 'dingin', climateLabel: 'Iklim Dingin • Aurora', flag: 'no', lat: 61.5, lon: 9.5, color: 0x7DD3FC,
      factGeo: '🇳🇴 NORWEGIA (Eropa Utara): Negeri fjord dan cahaya Aurora Borealis di dekat Lingkar Arktik!',
      factClimate: '🇳🇴 NORWEGIA (Iklim Dingin Subarktik): Musim dingin bersalju panjang dan mengalami fenomena "Matahari Tengah Malam".'
    },
    {
      id: 'is', name: 'Islandia', continentId: 'eropa', continentLabel: 'Negara Kecil', tier: 3, isSmall: true,
      climateZone: 'dingin', climateLabel: 'Dingin Subarktik • Kecil', flag: 'is', lat: 64.96, lon: -19.02, color: 0xBAE6FD,
      factGeo: '🇮🇸 ISLANDIA (Negara Pulau Kecil • Atlantik Utara): Pulau kecil penuh gletser es dan gunung api air panas (geiser)!',
      factClimate: '🇮🇸 ISLANDIA (Iklim Subarktik): Beriklim dingin & berangin dekat Kutub Utara, memanfaatkan energi panas bumi ramah lingkungan!'
    },

    // --- AFRIKA (7) ---
    {
      id: 'eg', name: 'Mesir', continentId: 'afrika', continentLabel: 'Afrika', tier: 1, isSmall: false,
      climateZone: 'kering', climateLabel: 'Iklim Gurun Sahara', flag: 'eg', lat: 26.82, lon: 30.80, color: 0xEAB308,
      factGeo: '🇪🇬 MESIR (Afrika Utara): Terkenal dengan Piramida Giza, Gurun Sahara terluas, dan Sungai Nil terpanjang di dunia!',
      factClimate: '🇪🇬 MESIR (Iklim Gurun Kering): Curah hujan sangat rendah hampir sepanjang tahun di wilayah Gurun Sahara.'
    },
    {
      id: 'ma', name: 'Maroko', continentId: 'afrika', continentLabel: 'Afrika', tier: 2, isSmall: false,
      climateZone: 'kering', climateLabel: 'Mediterania & Gurun', flag: 'ma', lat: 31.79, lon: -7.09, color: 0xFACC15,
      factGeo: '🇲🇦 MAROKO (Afrika Barat Laut): Gerbang barat Benua Afrika yang hanya dipisahkan selat sempit dari Spanyol (Eropa).',
      factClimate: '🇲🇦 MAROKO (Iklim Pesisir & Gurun): Pesisir utara lebih sejuk berangin laut, sedangkan bagian selatan sangat kering.'
    },
    {
      id: 'ng', name: 'Nigeria', continentId: 'afrika', continentLabel: 'Afrika', tier: 2, isSmall: false,
      climateZone: 'tropis', climateLabel: 'Tropis Sabana', flag: 'ng', lat: 9.08, lon: 8.68, color: 0xFACC15,
      factGeo: '🇳🇬 NIGERIA (Afrika Barat): Negara dengan jumlah penduduk terbanyak di seluruh Benua Afrika!',
      factClimate: '🇳🇬 NIGERIA (Iklim Tropis): Bagian selatan lembap hujan tropis dan bagian utara berupa sabana tropis kering.'
    },
    {
      id: 'ke', name: 'Kenya', continentId: 'afrika', continentLabel: 'Afrika', tier: 2, isSmall: false,
      climateZone: 'tropis', climateLabel: 'Tropis Khatulistiwa', flag: 'ke', lat: 0.02, lon: 37.91, color: 0xFACC15,
      factGeo: '🇰🇪 KENYA (Afrika Timur): Dilalui langsung oleh garis Khatulistiwa seperti Indonesia, rumah sabana satwa liar Afrika!',
      factClimate: '🇰🇪 KENYA (Iklim Tropis Dataran Tinggi): Berada di garis Khatulistiwa dengan 2 musim hujan dan musim kemarau.'
    },
    {
      id: 'za', name: 'Afrika Selatan', continentId: 'afrika', continentLabel: 'Afrika', tier: 1, isSmall: false,
      climateZone: 'subtropis', climateLabel: 'Subtropis Selatan', flag: 'za', lat: -30.56, lon: 22.94, color: 0xEAB308,
      factGeo: '🇿🇦 AFRIKA SELATAN (Ujung Selatan Afrika): Tempat bertemunya Samudra Atlantik dan Samudra Hindia!',
      factClimate: '🇿🇦 AFRIKA SELATAN (Iklim Subtropis): Kebalikan Indonesia utara, musim dinginnya terjadi sekitar Juni–Agustus.'
    },
    {
      id: 'sc', name: 'Seychelles', continentId: 'afrika', continentLabel: 'Negara Kecil', tier: 3, isSmall: true,
      climateZone: 'tropis', climateLabel: 'Tropis • Pulau Kecil', flag: 'sc', lat: -4.68, lon: 55.49, color: 0xFDE047,
      factGeo: '🇸🇨 SEYCHELLES (Negara Kecil • Afrika): Negara pulau terkecil di Benua Afrika di tengah Samudra Hindia (±459 km²)!',
      factClimate: '🇸🇨 SEYCHELLES (Iklim Tropis Laut): Hangat, lembap, dan dipengaruhi perubahan angin monsun Samudra Hindia.'
    },
    {
      id: 'mg', name: 'Madagaskar', continentId: 'afrika', continentLabel: 'Afrika', tier: 2, isSmall: false,
      climateZone: 'tropis', climateLabel: 'Tropis Pulau', flag: 'mg', lat: -18.77, lon: 46.87, color: 0xFACC15,
      factGeo: '🇲🇬 MADAGASKAR (Afrika): Negara pulau terbesar di Afrika, habitat unik satwa lemur & pohon baobab raksasa!',
      factClimate: '🇲🇬 MADAGASKAR (Iklim Tropis): Pesisir timurnya sangat basah oleh angin pasat Samudra Hindia.'
    },

    // --- AMERIKA (7) ---
    {
      id: 'ca', name: 'Kanada', continentId: 'amerika', continentLabel: 'Amerika', tier: 2, isSmall: false,
      climateZone: 'dingin', climateLabel: 'Dingin–Sedang', flag: 'ca', lat: 56.13, lon: -106.35, color: 0x34D399,
      factGeo: '🇨🇦 KANADA (Amerika Utara): Negara terluas ke-2 di dunia, terkenal dengan bendera daun maple dan beruang kutub di utara!',
      factClimate: '🇨🇦 KANADA (Iklim Dingin & Kutub Utara): Bagian utaranya bersalju tebal dan sangat dingin hingga Lingkar Arktik.'
    },
    {
      id: 'us', name: 'Amerika Serikat', continentId: 'amerika', continentLabel: 'Amerika', tier: 1, isSmall: false,
      climateZone: 'subtropis', climateLabel: 'Subtropis • 4 Musim', flag: 'us', lat: 39.83, lon: -98.58, color: 0x10B981,
      factGeo: '🇺🇸 AMERIKA SERIKAT (Amerika Utara): Negara luas dengan Patung Liberty di New York dan Ngarai Grand Canyon.',
      factClimate: '🇺🇸 AMERIKA SERIKAT (Iklim Sedang & Subtropis): Sebagian besar wilayahnya mengalami 4 musim berbeda setiap tahun.'
    },
    {
      id: 'mx', name: 'Meksiko', continentId: 'amerika', continentLabel: 'Amerika', tier: 2, isSmall: false,
      climateZone: 'tropis', climateLabel: 'Tropis & Kering', flag: 'mx', lat: 23.63, lon: -102.55, color: 0x34D399,
      factGeo: '🇲🇽 MEKSIKO (Amerika Utara/Tengah): Negara penuh sejarah peradaban Maya & Aztec di selatan Amerika Serikat.',
      factClimate: '🇲🇽 MEKSIKO (Iklim Kering Utara & Tropis Selatan): Dilintasi Garis Balik Utara (23,5° LU) dengan gurun sekaligus hutan tropis!'
    },
    {
      id: 'cu', name: 'Kuba', continentId: 'amerika', continentLabel: 'Negara Kecil', tier: 3, isSmall: true,
      climateZone: 'tropis', climateLabel: 'Tropis • Pulau Kecil', flag: 'cu', lat: 21.52, lon: -77.78, color: 0x6EE7B7,
      factGeo: '🇨🇺 KUBA (Negara Pulau • Laut Karibia): Negara kepulauan eksotis di gerbang Teluk Meksiko, Benua Amerika.',
      factClimate: '🇨🇺 KUBA (Iklim Tropis Laut): Hangat oleh angin pasat tropis dan terkadang dilalui angin topan Karibia.'
    },
    {
      id: 'pa', name: 'Panama', continentId: 'amerika', continentLabel: 'Negara Kecil', tier: 3, isSmall: true,
      climateZone: 'tropis', climateLabel: 'Tropis • Negara Kecil', flag: 'pa', lat: 8.54, lon: -80.78, color: 0x6EE7B7,
      factGeo: '🇵🇦 PANAMA (Negara Kecil • Amerika Tengah): Negara sempit tempat Terusan Panama yang menghubungkan Samudra Atlantik & Pasifik!',
      factClimate: '🇵🇦 PANAMA (Iklim Tropis Basah): Hutan hujan tropisnya menjadi koridor penting keanekaragaman hayati dua benua.'
    },
    {
      id: 'br', name: 'Brasil', continentId: 'amerika', continentLabel: 'Amerika', tier: 1, isSmall: false,
      climateZone: 'tropis', climateLabel: 'Tropis Amazon', flag: 'br', lat: -10.33, lon: -53.20, color: 0x10B981,
      factGeo: '🇧🇷 BRASIL (Amerika Selatan): Negara terbesar di Amerika Selatan, pemilik Hutan Hujan & Sungai Amazon!',
      factClimate: '🇧🇷 BRASIL (Iklim Tropis Hutan Hujan): Hutan Amazon menyerap miliaran ton karbon (CO₂) layaknya paru-paru Bumi!'
    },
    {
      id: 'ar', name: 'Argentina', continentId: 'amerika', continentLabel: 'Amerika', tier: 2, isSmall: false,
      climateZone: 'subtropis', climateLabel: 'Subtropis–Dingin', flag: 'ar', lat: -38.42, lon: -63.62, color: 0x34D399,
      factGeo: '🇦🇷 ARGENTINA (Amerika Selatan): Negara di sepanjang Pegunungan Andes hingga ujung paling selatan Amerika.',
      factClimate: '🇦🇷 ARGENTINA (Iklim Sedang hingga Subkutub): Semakin ke selatan mendekati Antartika, suhunya makin dingin & bersalju.'
    },

    // --- AUSTRALIA & OSEANIA (5) ---
    {
      id: 'au', name: 'Australia', continentId: 'australia', continentLabel: 'Benua', tier: 1, isSmall: false,
      climateZone: 'kering', climateLabel: 'Kering & Subtropis', flag: 'au', lat: -25.27, lon: 133.78, color: 0xF97316,
      factGeo: '🇦🇺 AUSTRALIA (Benua Australia): Satu negara raksasa yang sekaligus menjadi seluruh benua terkecil di Bumi!',
      factClimate: '🇦🇺 AUSTRALIA (Iklim Kering & Subtropis): Gurun tengahnya kering — saat musim kemarau Indonesia (Apr–Okt), angin Monsun Timur berhembus dari Australia!'
    },
    {
      id: 'pg', name: 'Papua Nugini', continentId: 'australia', continentLabel: 'Oseania', tier: 2, isSmall: false,
      climateZone: 'tropis', climateLabel: 'Tropis Basah', flag: 'pg', lat: -6.31, lon: 143.96, color: 0xFB923C,
      factGeo: '🇵🇬 PAPUA NUGINI (Oseania): Negara tetangga yang berbagi satu pulau besar Papua secara langsung dengan Indonesia timur!',
      factClimate: '🇵🇬 PAPUA NUGINI (Iklim Tropis): Berhutan hujan lebat dan pegunungan tinggi dekat garis Khatulistiwa.'
    },
    {
      id: 'nz', name: 'Selandia Baru', continentId: 'australia', continentLabel: 'Oseania', tier: 2, isSmall: false,
      climateZone: 'subtropis', climateLabel: 'Sedang • 4 Musim', flag: 'nz', lat: -40.90, lon: 174.89, color: 0xFB923C,
      factGeo: '🇳🇿 SELANDIA BARU (Oseania): Negara kepulauan indah di tenggara Australia dengan pegunungan salju dan burung Kiwi.',
      factClimate: '🇳🇿 SELANDIA BARU (Iklim Sedang Laut): Udara sejuk bersih 4 musim karena dikelilingi Samudra Pasifik Selatan.'
    },
    {
      id: 'pw', name: 'Palau', continentId: 'australia', continentLabel: 'Negara Kecil', tier: 3, isSmall: true,
      climateZone: 'tropis', climateLabel: 'Tropis • Pulau Kecil', flag: 'pw', lat: 7.51, lon: 134.58, color: 0xFDBA74,
      factGeo: '🇵🇼 PALAU (Negara Kecil • Pasifik): Negara kepulauan mungil (±459 km²) di sebelah timur laut Indonesia & Filipina!',
      factClimate: '🇵🇼 PALAU (Iklim Tropis Samudra): Surga terumbu karang yang terancam oleh kenaikan suhu air laut global.'
    },
    {
      id: 'fj', name: 'Fiji', continentId: 'australia', continentLabel: 'Negara Kecil', tier: 3, isSmall: true,
      climateZone: 'tropis', climateLabel: 'Tropis • Pulau Pasifik', flag: 'fj', lat: -17.71, lon: 178.07, color: 0xFDBA74,
      factGeo: '🇫🇯 FIJI (Negara Kecil • Pasifik Selatan): Negara kepulauan mungil di Pasifik dekat garis batas tanggal internasional.',
      factClimate: '🇫🇯 FIJI (Iklim Tropis Laut): Negara kepulauan Pasifik yang gencar menyuarakan penanggulangan perubahan iklim.'
    },

    // --- ANTARTIKA (1) ---
    {
      id: 'aq', name: 'Antartika', continentId: 'antartika', continentLabel: 'Tanpa Negara', tier: 1, isSmall: false,
      climateZone: 'dingin', climateLabel: 'Kutub Abadi • Non-Negara', flag: 'aq', lat: -80.0, lon: 15.0, color: 0xF8FAFC,
      factGeo: '🐧 ANTARTIKA (Kutub Selatan): Benua es abadi yang BUKAN sebuah negara — dijaga sebagai zona penelitian ilmiah damai!',
      factClimate: '🐧 ANTARTIKA (Iklim Kutub Terdingin): Menyimpan sebagian besar cadangan es tawar Bumi; pencairannya menaikkan permukaan laut dunia!'
    }
  ];

  const FLAG_SVGS = {
    id: '<rect width="15" height="5.5" fill="#EF4444"/><rect y="5.5" width="15" height="5.5" fill="#FFFFFF"/>',
    sg: '<rect width="15" height="5.5" fill="#EF4444"/><rect y="5.5" width="15" height="5.5" fill="#FFFFFF"/><circle cx="3.2" cy="2.7" r="1.5" fill="#FFFFFF"/><circle cx="3.9" cy="2.7" r="1.25" fill="#EF4444"/><circle cx="4.8" cy="1.9" r="0.35" fill="#FFFFFF"/><circle cx="5.6" cy="2.7" r="0.35" fill="#FFFFFF"/><circle cx="4.8" cy="3.6" r="0.35" fill="#FFFFFF"/>',
    bn: '<rect width="15" height="11" fill="#FACC15"/><polygon points="0,0 15,8 15,11 0,3" fill="#FFFFFF"/><polygon points="0,2 15,10 15,11 0,4.5" fill="#111827"/><circle cx="7.5" cy="5.5" r="1.4" fill="#DC2626"/>',
    tl: '<rect width="15" height="11" fill="#DC2626"/><polygon points="0,0 8.5,5.5 0,11" fill="#FACC15"/><polygon points="0,0 5.8,5.5 0,11" fill="#111827"/><circle cx="2.2" cy="5.5" r="1.15" fill="#FFFFFF"/>',
    my: '<rect width="15" height="11" fill="#FFFFFF"/><rect y="0" width="15" height="1.5" fill="#DC2626"/><rect y="3" width="15" height="1.5" fill="#DC2626"/><rect y="6" width="15" height="1.5" fill="#DC2626"/><rect y="9" width="15" height="1.5" fill="#DC2626"/><rect width="7.2" height="6" fill="#1E3A8A"/><circle cx="3.1" cy="3" r="1.5" fill="#FACC15"/><circle cx="3.7" cy="3" r="1.2" fill="#1E3A8A"/><circle cx="5.2" cy="3" r="0.85" fill="#FACC15"/>',
    th: '<rect width="15" height="11" fill="#DC2626"/><rect y="2" width="15" height="7" fill="#FFFFFF"/><rect y="3.6" width="15" height="3.8" fill="#1E3A8A"/>',
    vn: '<rect width="15" height="11" fill="#DA251D"/><polygon points="7.5,2.3 8.4,4.7 10.9,4.7 8.9,6.2 9.7,8.6 7.5,7.1 5.3,8.6 6.1,6.2 4.1,4.7 6.6,4.7" fill="#FFDE00"/>',
    ph: '<rect width="15" height="5.5" fill="#0038A8"/><rect y="5.5" width="15" height="5.5" fill="#CE1126"/><polygon points="0,0 6.8,5.5 0,11" fill="#FFFFFF"/><circle cx="2.5" cy="5.5" r="1.3" fill="#FCD116"/>',
    cn: '<rect width="15" height="11" fill="#DE2910"/><circle cx="3.6" cy="3.4" r="1.45" fill="#FFDE00"/><circle cx="6.2" cy="1.8" r="0.45" fill="#FFDE00"/><circle cx="7.1" cy="3.1" r="0.45" fill="#FFDE00"/><circle cx="6.9" cy="4.7" r="0.45" fill="#FFDE00"/><circle cx="5.9" cy="5.8" r="0.45" fill="#FFDE00"/>',
    jp: '<rect width="15" height="11" fill="#FFFFFF"/><circle cx="7.5" cy="5.5" r="2.8" fill="#BC002D"/>',
    kr: '<rect width="15" height="11" fill="#FFFFFF"/><circle cx="7.5" cy="5.5" r="2.4" fill="#CD2E3A"/><path d="M5.1,5.5 A2.4,2.4 0 0,0 9.9,5.5 A1.2,1.2 0 0,0 7.5,5.5 A1.2,1.2 0 0,1 5.1,5.5 Z" fill="#0047A0"/><rect x="1.8" y="1.8" width="2" height="0.8" fill="#111827"/><rect x="11.2" y="1.8" width="2" height="0.8" fill="#111827"/><rect x="1.8" y="8.4" width="2" height="0.8" fill="#111827"/><rect x="11.2" y="8.4" width="2" height="0.8" fill="#111827"/>',
    in: '<rect width="15" height="3.7" fill="#FF9933"/><rect y="3.7" width="15" height="3.6" fill="#FFFFFF"/><rect y="7.3" width="15" height="3.7" fill="#138808"/><circle cx="7.5" cy="5.5" r="1.35" fill="none" stroke="#1D4ED8" stroke-width="0.65"/>',
    mv: '<rect width="15" height="11" fill="#D21034"/><rect x="2.6" y="2.2" width="9.8" height="6.6" fill="#007E3A"/><circle cx="7.8" cy="5.5" r="1.8" fill="#FFFFFF"/><circle cx="8.5" cy="5.5" r="1.5" fill="#007E3A"/>',
    sa: '<rect width="15" height="11" fill="#006C35"/><rect x="3.5" y="3.8" width="8" height="1.2" rx="0.4" fill="#FFFFFF"/><rect x="4" y="6.8" width="7" height="0.7" fill="#FFFFFF"/>',
    qa: '<rect width="15" height="11" fill="#8A1538"/><polygon points="0,0 4.8,0 6,1.4 4.8,2.8 6,4.2 4.8,5.5 6,6.9 4.8,8.3 6,9.7 4.8,11 0,11" fill="#FFFFFF"/>',
    de: '<rect width="15" height="3.7" fill="#111827"/><rect y="3.7" width="15" height="3.6" fill="#DC2626"/><rect y="7.3" width="15" height="3.7" fill="#FACC15"/>',
    fr: '<rect width="5" height="11" fill="#002395"/><rect x="5" width="5" height="11" fill="#FFFFFF"/><rect x="10" width="5" height="11" fill="#ED2939"/>',
    gb: '<rect width="15" height="11" fill="#012169"/><line x1="0" y1="0" x2="15" y2="11" stroke="#FFFFFF" stroke-width="2.2"/><line x1="15" y1="0" x2="0" y2="11" stroke="#FFFFFF" stroke-width="2.2"/><line x1="0" y1="0" x2="15" y2="11" stroke="#C8102E" stroke-width="1"/><line x1="15" y1="0" x2="0" y2="11" stroke="#C8102E" stroke-width="1"/><rect x="6" width="3" height="11" fill="#FFFFFF"/><rect y="4" width="15" height="3" fill="#FFFFFF"/><rect x="6.6" width="1.8" height="11" fill="#C8102E"/><rect y="4.6" width="15" height="1.8" fill="#C8102E"/>',
    nl: '<rect width="15" height="3.7" fill="#AE1C28"/><rect y="3.7" width="15" height="3.6" fill="#FFFFFF"/><rect y="7.3" width="15" height="3.7" fill="#21468B"/>',
    ch: '<rect width="15" height="11" fill="#D52B1E"/><rect x="6.2" y="2.3" width="2.6" height="6.4" fill="#FFFFFF"/><rect x="4.3" y="4.2" width="6.4" height="2.6" fill="#FFFFFF"/>',
    it: '<rect width="5" height="11" fill="#009246"/><rect x="5" width="5" height="11" fill="#FFFFFF"/><rect x="10" width="5" height="11" fill="#CE2B37"/>',
    va: '<rect width="7.5" height="11" fill="#FFE000"/><rect x="7.5" width="7.5" height="11" fill="#FFFFFF"/><circle cx="11.2" cy="5.5" r="1.4" fill="#D97706"/>',
    mc: '<rect width="15" height="5.5" fill="#CE1126"/><rect y="5.5" width="15" height="5.5" fill="#FFFFFF"/>',
    lu: '<rect width="15" height="3.7" fill="#ED2939"/><rect y="3.7" width="15" height="3.6" fill="#FFFFFF"/><rect y="7.3" width="15" height="3.7" fill="#00A1DE"/>',
    es: '<rect width="15" height="11" fill="#AA151B"/><rect y="2.8" width="15" height="5.4" fill="#F1BF00"/><circle cx="4.5" cy="5.5" r="1.1" fill="#AA151B"/>',
    no: '<rect width="15" height="11" fill="#BA0C2F"/><rect x="4.2" width="2.6" height="11" fill="#FFFFFF"/><rect y="4.2" width="15" height="2.6" fill="#FFFFFF"/><rect x="4.8" width="1.4" height="11" fill="#00205B"/><rect y="4.8" width="15" height="1.4" fill="#00205B"/>',
    is: '<rect width="15" height="11" fill="#02529C"/><rect x="4.2" width="2.6" height="11" fill="#FFFFFF"/><rect y="4.2" width="15" height="2.6" fill="#FFFFFF"/><rect x="4.8" width="1.4" height="11" fill="#DC1E35"/><rect y="4.8" width="15" height="1.4" fill="#DC1E35"/>',
    eg: '<rect width="15" height="3.7" fill="#CE1126"/><rect y="3.7" width="15" height="3.6" fill="#FFFFFF"/><rect y="7.3" width="15" height="3.7" fill="#111827"/><circle cx="7.5" cy="5.5" r="0.95" fill="#C09300"/>',
    ma: '<rect width="15" height="11" fill="#C1272D"/><polygon points="7.5,3 8.3,5.2 10.6,5.2 8.7,6.5 9.4,8.7 7.5,7.3 5.6,8.7 6.3,6.5 4.4,5.2 6.7,5.2" fill="none" stroke="#006233" stroke-width="0.9"/>',
    ng: '<rect width="5" height="11" fill="#008751"/><rect x="5" width="5" height="11" fill="#FFFFFF"/><rect x="10" width="5" height="11" fill="#008751"/>',
    ke: '<rect width="15" height="3.2" fill="#111827"/><rect y="3.2" width="15" height="0.8" fill="#FFFFFF"/><rect y="4.0" width="15" height="3.0" fill="#BB0000"/><rect y="7.0" width="15" height="0.8" fill="#FFFFFF"/><rect y="7.8" width="15" height="3.2" fill="#006600"/><ellipse cx="7.5" cy="5.5" rx="1.15" ry="2.2" fill="#FFFFFF" stroke="#111827" stroke-width="0.5"/>',
    za: '<rect width="15" height="5.5" fill="#E03C31"/><rect y="5.5" width="15" height="5.5" fill="#001489"/><polygon points="0,0 7.2,5.5 0,11" fill="#111827"/><path d="M0,1.2 L6,5.5 L15,5.5 L6,5.5 L0,9.8" stroke="#007749" stroke-width="2.4" fill="none"/><polygon points="0,2.7 3.8,5.5 0,8.3" fill="#FFB81C"/>',
    sc: '<polygon points="0,11 0,0 5,0" fill="#003F87"/><polygon points="0,11 5,0 10,0" fill="#FCD856"/><polygon points="0,11 10,0 15,0 15,3.8" fill="#D62828"/><polygon points="0,11 15,3.8 15,7.4" fill="#FFFFFF"/><polygon points="0,11 15,7.4 15,11" fill="#007A3D"/>',
    mg: '<rect width="5" height="11" fill="#FFFFFF"/><rect x="5" width="10" height="5.5" fill="#FC3D32"/><rect x="5" y="5.5" width="10" height="5.5" fill="#007E3A"/>',
    ca: '<rect width="4" height="11" fill="#FF0000"/><rect x="4" width="7" height="11" fill="#FFFFFF"/><rect x="11" width="4" height="11" fill="#FF0000"/><polygon points="7.5,2.4 8.4,4.8 10,4.5 8.8,6.2 9.4,7.6 7.5,7 5.6,7.6 6.2,6.2 5,4.5 6.6,4.8" fill="#FF0000"/>',
    us: '<rect width="15" height="11" fill="#FFFFFF"/><rect y="0" width="15" height="1.6" fill="#DC2626"/><rect y="3.1" width="15" height="1.6" fill="#DC2626"/><rect y="6.2" width="15" height="1.6" fill="#DC2626"/><rect y="9.3" width="15" height="1.7" fill="#DC2626"/><rect width="6.8" height="6" fill="#1D4ED8"/><circle cx="2" cy="2" r="0.55" fill="#FFFFFF"/><circle cx="4.8" cy="2" r="0.55" fill="#FFFFFF"/><circle cx="3.4" cy="4" r="0.55" fill="#FFFFFF"/>',
    mx: '<rect width="5" height="11" fill="#006847"/><rect x="5" width="5" height="11" fill="#FFFFFF"/><rect x="10" width="5" height="11" fill="#CE1126"/><circle cx="7.5" cy="5.5" r="1.2" fill="#854D0E"/>',
    cu: '<rect width="15" height="11" fill="#002A8F"/><rect y="2.2" width="15" height="2.2" fill="#FFFFFF"/><rect y="6.6" width="15" height="2.2" fill="#FFFFFF"/><polygon points="0,0 7.2,5.5 0,11" fill="#CF142B"/><circle cx="2.5" cy="5.5" r="1.0" fill="#FFFFFF"/>',
    pa: '<rect width="7.5" height="5.5" fill="#FFFFFF"/><rect x="7.5" width="7.5" height="5.5" fill="#DA121A"/><rect y="5.5" width="7.5" height="5.5" fill="#072357"/><rect x="7.5" y="5.5" width="7.5" height="5.5" fill="#FFFFFF"/><circle cx="3.8" cy="2.8" r="1.1" fill="#072357"/><circle cx="11.2" cy="8.2" r="1.1" fill="#DA121A"/>',
    br: '<rect width="15" height="11" fill="#16A34A"/><polygon points="7.5,1.2 13.6,5.5 7.5,9.8 1.4,5.5" fill="#FACC15"/><circle cx="7.5" cy="5.5" r="2.1" fill="#1D4ED8"/>',
    ar: '<rect width="15" height="3.7" fill="#74ACDF"/><rect y="3.7" width="15" height="3.6" fill="#FFFFFF"/><rect y="7.3" width="15" height="3.7" fill="#74ACDF"/><circle cx="7.5" cy="5.5" r="1.15" fill="#F6B40E"/>',
    au: '<rect width="15" height="11" fill="#012169"/><rect width="6.5" height="5.5" fill="#1D4ED8"/><rect x="2.5" width="1.5" height="5.5" fill="#FFFFFF"/><rect y="2" width="6.5" height="1.5" fill="#FFFFFF"/><rect x="2.85" width="0.8" height="5.5" fill="#DC2626"/><rect y="2.35" width="6.5" height="0.8" fill="#DC2626"/><circle cx="3.2" cy="8.2" r="1.05" fill="#FFFFFF"/><circle cx="11.2" cy="3" r="0.7" fill="#FFFFFF"/><circle cx="12.5" cy="5.6" r="0.7" fill="#FFFFFF"/><circle cx="10.8" cy="8.2" r="0.7" fill="#FFFFFF"/>',
    nz: '<rect width="15" height="11" fill="#00247D"/><rect width="6.5" height="5.5" fill="#1D4ED8"/><rect x="2.5" width="1.5" height="5.5" fill="#FFFFFF"/><rect y="2" width="6.5" height="1.5" fill="#FFFFFF"/><rect x="2.85" width="0.8" height="5.5" fill="#DC2626"/><rect y="2.35" width="6.5" height="0.8" fill="#DC2626"/><circle cx="11.2" cy="2.6" r="0.75" fill="#EF4444"/><circle cx="12.8" cy="5.2" r="0.75" fill="#EF4444"/><circle cx="9.8" cy="5.4" r="0.75" fill="#EF4444"/><circle cx="11.2" cy="8.2" r="0.85" fill="#EF4444"/>',
    pg: '<polygon points="0,0 15,11 0,11" fill="#111827"/><polygon points="0,0 15,0 15,11" fill="#CE1126"/><circle cx="11.2" cy="3.6" r="1.4" fill="#FCD116"/><circle cx="3.2" cy="7.5" r="0.65" fill="#FFFFFF"/><circle cx="4.8" cy="8.9" r="0.65" fill="#FFFFFF"/><circle cx="2.2" cy="9.2" r="0.65" fill="#FFFFFF"/>',
    fj: '<rect width="15" height="11" fill="#68BFE5"/><rect width="6.5" height="5.5" fill="#1D4ED8"/><rect x="2.5" width="1.5" height="5.5" fill="#FFFFFF"/><rect y="2" width="6.5" height="1.5" fill="#FFFFFF"/><rect x="2.85" width="0.8" height="5.5" fill="#DC2626"/><rect y="2.35" width="6.5" height="0.8" fill="#DC2626"/><rect x="10" y="3.5" width="2.8" height="4" rx="0.5" fill="#FFFFFF"/>',
    pw: '<rect width="15" height="11" fill="#0099FF"/><circle cx="6.2" cy="5.5" r="2.7" fill="#FFDE00"/>',
    aq: '<rect width="15" height="11" fill="#0284C7"/><polygon points="7.5,2.2 10.6,3.4 11.7,5.8 10.1,8.5 6.8,8.8 4.1,7.5 3.8,4.6 5.4,2.8" fill="#F8FAFC"/>'
  };

  function getFlagSvg(code) {
    const body = FLAG_SVGS[code] || FLAG_SVGS.aq;
    return `<svg class="globe-pin-flag" viewBox="0 0 15 11" width="15" height="11" aria-hidden="true">${body}</svg>`;
  }

  function injectStyles() {
    if (typeof document === 'undefined' || document.getElementById('pkbm-globe-labels-style')) return;
    const style = document.createElement('style');
    style.id = 'pkbm-globe-labels-style';
    style.textContent = `
      .globe-pin-labels {
        position: absolute; inset: 0; pointer-events: none; overflow: hidden; z-index: 6;
      }
      .globe-pin-tag {
        position: absolute; top: 0; left: 0;
        display: inline-flex; align-items: center; gap: 5px;
        padding: 3px 8px; border-radius: 999px;
        background: rgba(15, 23, 42, 0.88); backdrop-filter: blur(6px);
        border: 1.5px solid rgba(125, 211, 252, 0.52);
        color: #F8FAFC; font-size: 0.71rem; font-weight: 800; line-height: 1.15;
        white-space: nowrap; cursor: pointer; pointer-events: auto; user-select: none;
        box-shadow: 0 4px 12px rgba(2, 6, 23, 0.55);
        will-change: transform, opacity;
        transition: background 0.18s, border-color 0.18s, box-shadow 0.18s;
      }
      .globe-pin-tag.tier-small {
        padding: 2px 7px; font-size: 0.66rem;
        border-color: rgba(110, 231, 183, 0.58);
      }
      .globe-pin-tag:hover, .globe-pin-tag.hovered, .globe-pin-tag.active {
        background: rgba(2, 132, 199, 0.96); border-color: #BAE6FD;
        box-shadow: 0 0 14px rgba(56, 189, 248, 0.72); z-index: 9;
      }
      .globe-pin-tag .pin-sub {
        color: #94A3B8; font-weight: 700; font-size: 0.62rem;
      }
      .globe-pin-tag:hover .pin-sub, .globe-pin-tag.hovered .pin-sub, .globe-pin-tag.active .pin-sub {
        color: #E0F2FE;
      }
      .globe-pin-flag {
        width: 15px; height: 11px; border-radius: 2px; flex-shrink: 0;
        box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.22);
      }
      .country-jump-row {
        display: flex; align-items: center; justify-content: center; gap: 8px;
        flex-wrap: wrap; margin-top: 7px; padding-top: 7px;
        border-top: 1px solid rgba(148, 163, 184, 0.22);
      }
      .country-jump-label {
        font-size: 0.73rem; font-weight: 800; color: #7DD3FC; white-space: nowrap;
      }
      .country-jump-select {
        background: rgba(15, 23, 42, 0.95); color: #F8FAFC;
        border: 1px solid rgba(56, 189, 248, 0.45); border-radius: 10px;
        padding: 5px 10px; font-size: 0.74rem; font-weight: 800;
        cursor: pointer; outline: none; max-width: 100%;
      }
      .country-jump-select:focus {
        border-color: #38BDF8; box-shadow: 0 0 0 2px rgba(56, 189, 248, 0.28);
      }
      @media (max-width: 680px) {
        .globe-pin-tag { font-size: 0.64rem; padding: 2px 6px; }
        .globe-pin-tag.tier-small { font-size: 0.6rem; padding: 2px 5px; }
        .globe-pin-tag .pin-sub { display: none; }
      }
    `;
    document.head.appendChild(style);
  }

  function populateCountrySelect(selectEl, mode = 'geo') {
    if (!selectEl) return;
    const groups = [
      { id: 'asia',      label: '🌏 Asia (15 Negara & Negara Kecil)' },
      { id: 'eropa',     label: '🏰 Eropa (12 Negara & Negara Kecil)' },
      { id: 'afrika',    label: '🦁 Afrika (7 Negara & Pulau)' },
      { id: 'amerika',   label: '🗽 Amerika (7 Negara)' },
      { id: 'australia', label: '🦘 Australia & Oseania (5 Negara Pulau)' },
      { id: 'antartika', label: '🐧 Kutub Selatan (Zona Riset)' }
    ];
    selectEl.innerHTML = '';

    const placeholder = document.createElement('option');
    placeholder.value = '';
    placeholder.textContent = `Pilih dari ${COUNTRIES.length} negara (termasuk negara kecil)...`;
    selectEl.appendChild(placeholder);

    groups.forEach((g) => {
      const og = document.createElement('optgroup');
      og.label = g.label;
      COUNTRIES.filter(c => c.continentId === g.id).forEach((c) => {
        const opt = document.createElement('option');
        opt.value = c.id;
        const smallTag = c.isSmall ? ' [Kecil]' : '';
        const extra = mode === 'climate' ? ` (${c.climateLabel})` : smallTag;
        opt.textContent = `${c.name}${extra}`;
        og.appendChild(opt);
      });
      selectEl.appendChild(og);
    });
  }

  function mountAtlas(config) {
    injectStyles();
    const {
      targetGroup,
      globeRadius = 2.85,
      labelsContainer,
      mode = 'geo',
      initialPinId = 'id',
      onSelectCountry
    } = config;

    const pinsGroup = new THREE.Group();
    targetGroup.add(pinsGroup);

    const clickableMeshes = [];
    const halos = [];
    const items = [];
    let activePinId = initialPinId;
    let hoveredPinId = null;

    if (labelsContainer) labelsContainer.innerHTML = '';

    const TIER_SPEC = {
      1: { radius: 0.13,  stalk: 0.30, labelOffset: 0.50, haloIn: 0.11, haloOut: 0.20 },
      2: { radius: 0.088, stalk: 0.21, labelOffset: 0.37, haloIn: 0.07, haloOut: 0.135 },
      3: { radius: 0.058, stalk: 0.15, labelOffset: 0.28, haloIn: 0.05, haloOut: 0.095 }
    };

    COUNTRIES.forEach((data) => {
      const spec = TIER_SPEC[data.tier] || TIER_SPEC[2];
      const surfacePt = global.PKBM_EARTH.latLonToVec3(data.lat, data.lon, globeRadius);
      const normal = surfacePt.clone().normalize();
      const pinPos = surfacePt.clone().addScaledVector(normal, spec.stalk);
      const labelPos = surfacePt.clone().addScaledVector(normal, spec.labelOffset);

      const factText = mode === 'climate' ? data.factClimate : data.factGeo;
      const subText = mode === 'climate' ? data.climateZone.toUpperCase() : data.continentLabel;

      const pin = new THREE.Mesh(
        new THREE.SphereGeometry(spec.radius, data.tier === 1 ? 18 : 14, data.tier === 1 ? 18 : 14),
        new THREE.MeshStandardMaterial({
          color: data.color,
          emissive: data.color,
          emissiveIntensity: data.tier === 1 ? 0.65 : 0.72,
          roughness: 0.22,
          metalness: 0.15
        })
      );
      pin.position.copy(pinPos);
      pin.userData = { pinId: data.id, continentId: data.continentId, country: data, fact: factText };
      pinsGroup.add(pin);
      clickableMeshes.push(pin);

      const stalk = new THREE.Mesh(
        new THREE.CylinderGeometry(spec.radius * 0.16, spec.radius * 0.22, spec.stalk, 8),
        new THREE.MeshStandardMaterial({ color: 0xF8FAFC, metalness: 0.4, roughness: 0.3 })
      );
      stalk.position.copy(surfacePt).addScaledVector(normal, spec.stalk * 0.5);
      stalk.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), normal);
      pinsGroup.add(stalk);

      if (data.tier === 1 || data.isSmall) {
        const ring = new THREE.Mesh(
          new THREE.RingGeometry(spec.haloIn, spec.haloOut, 20),
          new THREE.MeshBasicMaterial({
            color: data.color, side: THREE.DoubleSide, transparent: true,
            opacity: data.tier === 1 ? 0.72 : 0.55
          })
        );
        ring.position.copy(surfacePt).addScaledVector(normal, 0.022);
        ring.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), normal);
        pinsGroup.add(ring);
        halos.push(ring);
      }

      if (labelsContainer) {
        const tag = document.createElement('button');
        tag.type = 'button';
        tag.className = 'globe-pin-tag'
          + (data.isSmall || data.tier === 3 ? ' tier-small' : '')
          + (data.id === activePinId ? ' active' : '');
        tag.dataset.pinId = data.id;
        tag.innerHTML = `${getFlagSvg(data.flag)}<span class="pin-name">${data.name}</span><span class="pin-sub">• ${subText}</span>`;
        tag.onclick = (ev) => {
          ev.stopPropagation();
          if (onSelectCountry) onSelectCountry(data);
        };
        labelsContainer.appendChild(tag);

        const charW = (data.isSmall || data.tier === 3) ? 6.1 : 6.7;
        const estWidth = Math.round(28 + data.name.length * charW + (subText ? subText.length * 5.0 + 9 : 0));
        const estWidthCompact = Math.round(24 + data.name.length * 5.8);
        items.push({
          id: data.id,
          tier: data.tier,
          isSmall: data.isSmall,
          country: data,
          localSurface: surfacePt,
          localLabel: labelPos,
          el: tag,
          estWidth,
          estWidthCompact,
          estHeight: (data.isSmall || data.tier === 3) ? 20 : 23,
          lastX: null,
          lastY: null,
          lastOp: null
        });
      } else {
        items.push({
          id: data.id,
          tier: data.tier,
          isSmall: data.isSmall,
          country: data,
          localSurface: surfacePt,
          localLabel: labelPos,
          el: null
        });
      }
    });

    const tmpSurface = new THREE.Vector3();
    const tmpLabel = new THREE.Vector3();
    const tmpCenter = new THREE.Vector3();
    const tmpNormal = new THREE.Vector3();
    const tmpToCam = new THREE.Vector3();
    const tmpProj = new THREE.Vector3();
    let cachedAutoInsets = null;

    function computeAutoInsets(viewportEl) {
      if (!viewportEl) return null;
      const topEl = viewportEl.querySelector('.hud-top');
      const botEl = viewportEl.querySelector('.hud-bottom');
      const topH = topEl ? topEl.offsetHeight : 0;
      const botH = botEl ? botEl.offsetHeight : 0;
      if (!topH && !botH) return null;
      cachedAutoInsets = {
        top: Math.max(50, topH + 8),
        bottom: Math.max(110, botH + 14)
      };
      return cachedAutoInsets;
    }

    if (typeof global.addEventListener === 'function') {
      global.addEventListener('resize', () => { cachedAutoInsets = null; });
    }

    function getSurfaceWorldPos(pinId, outVec) {
      pinsGroup.updateWorldMatrix(true, false);
      const found = items.find(it => it.id === pinId);
      if (!found) return null;
      return (outVec || new THREE.Vector3()).copy(found.localSurface).applyMatrix4(pinsGroup.matrixWorld);
    }

    function setActive(pinId) {
      activePinId = pinId;
      items.forEach((it) => {
        if (it.el) it.el.classList.toggle('active', it.id === pinId);
      });
    }

    function setHovered(pinId) {
      if (hoveredPinId === pinId) return;
      hoveredPinId = pinId;
      items.forEach((it) => {
        if (it.el) it.el.classList.toggle('hovered', it.id === pinId);
      });
    }

    function setVisible(vis) {
      if (labelsContainer) labelsContainer.style.display = vis ? 'block' : 'none';
      cachedAutoInsets = null;
    }

    function updateHalos(t) {
      halos.forEach((halo, idx) => {
        const pulse = 1 + 0.16 * Math.sin(t * 2.8 + idx * 0.7);
        halo.scale.set(pulse, pulse, 1);
      });
    }

    function updateLabels(camera, viewportEl, customInsets) {
      if (!labelsContainer || !viewportEl || !camera || labelsContainer.style.display === 'none') return;
      const w = viewportEl.clientWidth;
      const h = viewportEl.clientHeight;
      if (!w || !h) return;

      pinsGroup.updateWorldMatrix(true, false);
      tmpCenter.set(0, 0, 0).applyMatrix4(pinsGroup.matrixWorld);
      const camPos = camera.position;
      const camDist = camPos.distanceTo(tmpCenter);

      const compact = w < 680;
      const autoInsets = customInsets || cachedAutoInsets || computeAutoInsets(viewportEl);
      const topSafe = (autoInsets && autoInsets.top) || (compact ? 72 : 54);
      const bottomSafe = (autoInsets && autoInsets.bottom) || (compact ? 170 : 142);

      const candidates = [];

      items.forEach((it) => {
        tmpSurface.copy(it.localSurface).applyMatrix4(pinsGroup.matrixWorld);
        tmpNormal.subVectors(tmpSurface, tmpCenter).normalize();
        tmpToCam.subVectors(camPos, tmpSurface).normalize();
        const facing = tmpNormal.dot(tmpToCam);

        if (facing <= 0.08) {
          applyPillStyle(it, 0, 0, 0);
          return;
        }

        const isPriority = it.id === activePinId || it.id === hoveredPinId;
        if (!isPriority) {
          if (camDist > 10.4 && it.tier === 3) {
            applyPillStyle(it, 0, 0, 0);
            return;
          }
          if (camDist > 9.6 && it.tier === 2 && facing < 0.45) {
            applyPillStyle(it, 0, 0, 0);
            return;
          }
          if (camDist > 7.8 && it.tier === 3 && facing < 0.62) {
            applyPillStyle(it, 0, 0, 0);
            return;
          }
        }

        tmpProj.copy(it.localLabel).applyMatrix4(pinsGroup.matrixWorld).project(camera);
        if (tmpProj.z >= 1) {
          applyPillStyle(it, 0, 0, 0);
          return;
        }

        const x = (tmpProj.x * 0.5 + 0.5) * w;
        const y = (-tmpProj.y * 0.5 + 0.5) * h;

        if (!isPriority && (y < topSafe || y > h - bottomSafe || x < 24 || x > w - 24)) {
          applyPillStyle(it, x, y, 0);
          return;
        }

        candidates.push({ it, x, y, facing, isPriority });
      });

      candidates.sort((a, b) => {
        if (a.isPriority !== b.isPriority) return a.isPriority ? -1 : 1;
        if (a.it.tier !== b.it.tier) return a.it.tier - b.it.tier;
        return b.facing - a.facing;
      });

      const placedBoxes = [];
      const visibleIds = new Set();

      candidates.forEach(({ it, x, y, facing, isPriority }) => {
        const bw = compact ? it.estWidthCompact : it.estWidth;
        const bh = it.estHeight;
        const box = {
          l: x - bw * 0.5 - 4,
          r: x + bw * 0.5 + 4,
          t: y - bh - 3,
          b: y + 3
        };

        const overlaps = !isPriority && placedBoxes.some((p) =>
          !(box.r < p.l || box.l > p.r || box.b < p.t || box.t > p.b)
        );

        if (overlaps) return;

        placedBoxes.push(box);
        visibleIds.add(it.id);

        let alpha = Math.min(1, Math.max(0, (facing - 0.08) / 0.24));
        if (y < topSafe || y > h - bottomSafe || x < 20 || x > w - 20) alpha *= 0.18;
        applyPillStyle(it, x, y, alpha);
      });

      candidates.forEach(({ it, x, y }) => {
        if (!visibleIds.has(it.id)) applyPillStyle(it, x, y, 0);
      });
    }

    function applyPillStyle(it, x, y, alpha) {
      if (!it.el) return;
      const rx = Math.round(x * 10) / 10;
      const ry = Math.round(y * 10) / 10;
      const op = alpha <= 0.03 ? '0' : alpha.toFixed(2);
      if (op !== '0' && (it.lastX !== rx || it.lastY !== ry)) {
        it.el.style.transform = `translate3d(${rx}px, ${ry}px, 0) translate(-50%, -100%)`;
        it.lastX = rx;
        it.lastY = ry;
      }
      if (it.lastOp !== op) {
        it.el.style.opacity = op;
        it.el.style.pointerEvents = alpha > 0.35 ? 'auto' : 'none';
        it.lastOp = op;
      }
    }

    return {
      pinsGroup,
      clickableMeshes,
      getSurfaceWorldPos,
      setActive,
      setHovered,
      setVisible,
      updateHalos,
      updateLabels
    };
  }

  global.PKBM_GLOBE_ATLAS = {
    CONTINENTS,
    CLIMATE_ZONES,
    COUNTRIES,
    getFlagSvg,
    populateCountrySelect,
    mountAtlas
  };
})(window);
