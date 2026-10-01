export type PropertyStatus = "active" | "inactive" | "sold";

export type PropertyImage = {
  id: string;
  storagePath: string;
  url: string;
  altText: string;
  position: number;
  width: number | null;
  height: number | null;
};

export type Property = {
  id: string;
  code: string;
  slug: string;
  title: string;
  description: string;
  price: number;
  city: string;
  neighborhood: string;
  address: string | null;
  bedrooms: number;
  bathrooms: number;
  parkingSpaces: number;
  areaM2: number;
  status: PropertyStatus;
  images: PropertyImage[];
  /** Ex.: "Nascente", "Norte". Opcional — nem todo anúncio informa. */
  sunPosition?: string | null;
  /** Taxa mensal de condomínio, em reais. */
  condoFee?: number | null;
  /** Faixa de andares do prédio, ex.: "do 4º ao 6º andar", em vez do andar exato. */
  floorRange?: string | null;
};
