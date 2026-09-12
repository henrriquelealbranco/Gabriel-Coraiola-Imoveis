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
};
