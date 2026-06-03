import { Link } from "react-router-dom";
import { routeMetadata, usePageMetadata } from "@/lib/seo";

export default function NotFoundPage() {
  usePageMetadata(routeMetadata.notFound);

  return (
    <main
      className="min-h-screen flex items-center justify-center px-6"
      style={{ backgroundColor: "#F5F0E8", color: "#2D2D2D" }}
    >
      <div className="max-w-xl text-center">
        <p className="font-sans text-xs uppercase tracking-[0.2em]" style={{ color: "#7B3B4F" }}>
          404
        </p>
        <h1 className="font-serif mt-4" style={{ fontSize: "clamp(40px, 8vw, 72px)", fontWeight: 600 }}>
          Page Not Found
        </h1>
        <p className="font-sans mt-5" style={{ color: "#5A5450", lineHeight: 1.7 }}>
          This page is not part of The Gaston Collective anymore, or it never existed.
        </p>
        <Link
          to="/"
          className="inline-flex mt-8 font-sans text-xs uppercase tracking-[0.2em] px-8 py-3 border transition-colors duration-300 hover:bg-[#7B3B4F] hover:text-[#F5F0E8]"
          style={{ color: "#7B3B4F", borderColor: "#7B3B4F", textDecoration: "none" }}
        >
          Return Home
        </Link>
      </div>
    </main>
  );
}
