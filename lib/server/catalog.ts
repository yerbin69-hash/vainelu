import "server-only";
import { products, type CatalogProduct } from "../domain";

const panel = "https://vainelu-catalogo.onrender.com";
const fallbackPhoto = "/images/hero.webp";
const featuredPhotos: Record<string, string> = {
  "demo-fresas-vainilla": "/images/fresas-vainilla.webp",
  "demo-chocolate": "/images/chocolate.webp",
};
type PanelCake = {
  id: string;
  name: string;
  description: string;
  category_id: string;
  photo_path?: string;
  sold_out?: boolean;
  variants: {
    id: string;
    label: string;
    servings: number;
    price_minor: number;
    available: boolean;
  }[];
};

export const sharedCatalog = () =>
  process.env.VAINELU_SHARED_CATALOG === "1" ||
  process.env.RENDER_SERVICE_NAME === "vainelu";

export async function loadCatalog(): Promise<CatalogProduct[]> {
  if (!sharedCatalog()) {
    return products.map((product) => ({
      ...product,
      photo: `/images/${product.slug}.webp`,
    }));
  }
  const response = await fetch(`${panel}/api/catalog`, {
    cache: "no-store",
    signal: AbortSignal.timeout(6000),
  });
  if (!response.ok)
    throw Error("El catálogo no está disponible en este momento.");
  const { products: cakes }: { products: PanelCake[] } = await response.json();
  return cakes.map((cake) => ({
    id: cake.id,
    name: cake.name,
    description: cake.description,
    category_ids:
      cake.category_id === "personalizadas"
        ? ["personalizadas"]
        : [
            "clasicas",
            ...(cake.category_id === "pistacho" ? [] : ["cumpleanos"]),
          ],
    published_in_demo: true,
    photo:
      cake.photo_path &&
      /^\/media\/[a-f0-9]{64}\.(jpg|png)$/.test(cake.photo_path)
        ? panel + cake.photo_path
        : (featuredPhotos[cake.id] ?? fallbackPhoto),
    variants: cake.variants.map((variant) => ({
      id: variant.id,
      label: variant.label,
      servings: variant.servings,
      price_cents: variant.price_minor,
      available: !cake.sold_out && variant.available,
    })),
  }));
}
