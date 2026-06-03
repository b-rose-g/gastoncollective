import { useEffect } from "react";

const SITE_URL = "https://gastoncollective.com";
const SITE_NAME = "The Gaston Collective";

type Metadata = {
  title: string;
  description: string;
  path: string;
  image: string;
};

export const routeMetadata = {
  home: {
    title: "The Gaston Collective | Ink, Books, and Art",
    description: "A creative home for Velvet Ink tattoo artistry, Reach For The Stars, and small-batch art goods by Kimberlin Gaston.",
    path: "/",
    image: "/images/tattoo_2.jpg",
  },
  velvetInk: {
    title: "Velvet Ink | Tattoo and Piercing Studio",
    description: "Book custom fine-line tattoos, black-and-grey work, and piercing appointments with Velvet Ink.",
    path: "/velvet-ink",
    image: "/images/tattoo_2.jpg",
  },
  writtenWord: {
    title: "The Written Word | Reach For The Stars",
    description: "Explore Reach For The Stars, a mental health workbook by Kimberlin Gaston with prompts, reflection, and coloring pages.",
    path: "/written-word",
    image: "/images/book_reach_for_the_stars.png",
  },
  shop: {
    title: "The Shop | Stickers, Bookmarks, and Custom Art",
    description: "Shop small-batch stickers and request custom art commissions from The Gaston Collective.",
    path: "/shop",
    image: "/images/sticker_pdf_page_3.jpg",
  },
  admin: {
    title: "Admin | The Gaston Collective",
    description: "Secure owner dashboard for The Gaston Collective inquiries, bookings, commissions, and monitoring.",
    path: "/admin",
    image: "/images/tattoo_2.jpg",
  },
  privacy: {
    title: "Privacy Policy | The Gaston Collective",
    description: "How The Gaston Collective collects, uses, and protects inquiry, booking, commission, and website information.",
    path: "/privacy",
    image: "/images/tattoo_2.jpg",
  },
  terms: {
    title: "Terms | The Gaston Collective",
    description: "Terms for using The Gaston Collective website, booking tattoo services, requesting commissions, and making shop inquiries.",
    path: "/terms",
    image: "/images/tattoo_2.jpg",
  },
  notFound: {
    title: "Page Not Found | The Gaston Collective",
    description: "The page you requested could not be found.",
    path: "/404",
    image: "/images/tattoo_2.jpg",
  },
} satisfies Record<string, Metadata>;

function absoluteUrl(path: string): string {
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

function setMeta(selector: string, attr: "content" | "href", value: string) {
  const element = document.head.querySelector(selector);
  if (element) {
    element.setAttribute(attr, value);
  }
}

function upsertMeta(selector: string, attrs: Record<string, string>) {
  let element = document.head.querySelector(selector) as HTMLMetaElement | null;
  if (!element) {
    element = document.createElement("meta");
    document.head.appendChild(element);
  }

  Object.entries(attrs).forEach(([key, value]) => element?.setAttribute(key, value));
}

export function usePageMetadata(metadata: Metadata) {
  useEffect(() => {
    const url = absoluteUrl(metadata.path);
    const image = absoluteUrl(metadata.image);

    document.title = metadata.title;
    upsertMeta('meta[name="description"]', { name: "description", content: metadata.description });
    upsertMeta('meta[property="og:title"]', { property: "og:title", content: metadata.title });
    upsertMeta('meta[property="og:description"]', { property: "og:description", content: metadata.description });
    upsertMeta('meta[property="og:url"]', { property: "og:url", content: url });
    upsertMeta('meta[property="og:image"]', { property: "og:image", content: image });
    upsertMeta('meta[property="og:site_name"]', { property: "og:site_name", content: SITE_NAME });
    upsertMeta('meta[property="og:type"]', { property: "og:type", content: "website" });
    upsertMeta('meta[name="twitter:title"]', { name: "twitter:title", content: metadata.title });
    upsertMeta('meta[name="twitter:description"]', { name: "twitter:description", content: metadata.description });
    upsertMeta('meta[name="twitter:image"]', { name: "twitter:image", content: image });
    setMeta('link[rel="canonical"]', "href", url);
  }, [metadata]);
}
