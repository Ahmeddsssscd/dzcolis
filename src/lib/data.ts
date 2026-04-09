export const ALGERIAN_CITIES = [
  "Alger",
  "Oran",
  "Constantine",
  "Annaba",
  "Sétif",
  "Blida",
  "Batna",
  "Djelfa",
  "Tlemcen",
  "Béjaïa",
  "Biskra",
  "Tiaret",
  "Médéa",
  "Tizi Ouzou",
  "Skikda",
  "Chlef",
  "Mostaganem",
  "El Oued",
  "Ghardaïa",
  "Jijel",
  "Béchar",
  "Ouargla",
  "Bouira",
  "Bordj Bou Arréridj",
  "M'sila",
  "Mascara",
  "Saïda",
  "Relizane",
  "Laghouat",
  "Sidi Bel Abbès",
];

export interface Listing {
  id: string;
  type: "shipment" | "trip";
  title: string;
  from: string;
  to: string;
  date: string;
  price: number;
  weight?: string;
  dimensions?: string;
  description: string;
  user: {
    name: string;
    rating: number;
    reviews: number;
    avatar: string;
  };
  image?: string;
  category?: string;
}

export const SAMPLE_LISTINGS: Listing[] = [
  {
    id: "1",
    type: "shipment",
    title: "Machine à laver Samsung 8kg",
    from: "Alger",
    to: "Oran",
    date: "2026-04-05",
    price: 3500,
    weight: "65 kg",
    dimensions: "60x60x85 cm",
    description: "Machine à laver en bon état, bien emballée. Besoin de livraison soignée.",
    category: "Électroménager",
    user: { name: "Karim B.", rating: 4.8, reviews: 23, avatar: "KB" },
  },
  {
    id: "2",
    type: "trip",
    title: "Trajet Alger → Constantine - Place disponible",
    from: "Alger",
    to: "Constantine",
    date: "2026-04-03",
    price: 1500,
    weight: "jusqu'à 30 kg",
    description: "Je fais le trajet samedi matin en fourgon. Place disponible pour colis moyens.",
    user: { name: "Youcef M.", rating: 4.9, reviews: 47, avatar: "YM" },
  },
  {
    id: "3",
    type: "shipment",
    title: "Canapé 3 places cuir",
    from: "Sétif",
    to: "Alger",
    date: "2026-04-07",
    price: 5000,
    weight: "45 kg",
    dimensions: "200x90x85 cm",
    description: "Canapé acheté sur Ouedkniss, vendeur à Sétif. Besoin de transport.",
    category: "Meubles",
    user: { name: "Amina T.", rating: 4.7, reviews: 12, avatar: "AT" },
  },
  {
    id: "4",
    type: "trip",
    title: "Trajet Oran → Tlemcen - Camionnette",
    from: "Oran",
    to: "Tlemcen",
    date: "2026-04-04",
    price: 2000,
    weight: "jusqu'à 100 kg",
    description: "Camionnette avec grand espace. Peut transporter meubles ou électroménager.",
    user: { name: "Mohamed A.", rating: 5.0, reviews: 89, avatar: "MA" },
  },
  {
    id: "5",
    type: "shipment",
    title: "Réfrigérateur LG No Frost",
    from: "Annaba",
    to: "Constantine",
    date: "2026-04-06",
    price: 4000,
    weight: "70 kg",
    dimensions: "70x65x180 cm",
    description: "Réfrigérateur neuf à livrer. Emballage d'origine.",
    category: "Électroménager",
    user: { name: "Sara K.", rating: 4.6, reviews: 8, avatar: "SK" },
  },
  {
    id: "6",
    type: "trip",
    title: "Alger → Béjaïa - Véhicule utilitaire",
    from: "Alger",
    to: "Béjaïa",
    date: "2026-04-05",
    price: 2500,
    weight: "jusqu'à 200 kg",
    description: "Grand véhicule utilitaire. Idéal pour déménagement partiel.",
    user: { name: "Rachid L.", rating: 4.9, reviews: 156, avatar: "RL" },
  },
  {
    id: "7",
    type: "shipment",
    title: "Colis de vêtements (3 cartons)",
    from: "Blida",
    to: "Batna",
    date: "2026-04-08",
    price: 1200,
    weight: "15 kg",
    dimensions: "3x 40x40x40 cm",
    description: "3 cartons de vêtements bien emballés. Pas fragile.",
    category: "Cartons",
    user: { name: "Leila H.", rating: 4.5, reviews: 5, avatar: "LH" },
  },
  {
    id: "8",
    type: "trip",
    title: "Constantine → Annaba - Fourgon",
    from: "Constantine",
    to: "Annaba",
    date: "2026-04-03",
    price: 1800,
    weight: "jusqu'à 150 kg",
    description: "Fourgon Mercedes Sprinter. Trajet régulier chaque semaine.",
    user: { name: "Fares D.", rating: 4.8, reviews: 203, avatar: "FD" },
  },
];

export const CATEGORIES = [
  "Tous",
  "Électroménager",
  "Meubles",
  "Cartons",
  "Électronique",
  "Véhicules",
  "Matériaux",
  "Autre",
];
