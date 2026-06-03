export function prefersReducedMotion(): boolean {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function scrollBehavior(): ScrollBehavior {
  return prefersReducedMotion() ? "auto" : "smooth";
}

export function revealImmediately(elements: Array<Element | null | undefined>) {
  elements.filter(Boolean).forEach((element) => {
    const el = element as HTMLElement;
    el.style.opacity = "1";
    el.style.transform = "none";
  });
}
