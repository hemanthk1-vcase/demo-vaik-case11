export const APP_BASE_URL = "https://app.vakilcase.com";

export function appUrl(path = "") {
  return `${APP_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

export function isAppDomain() {
  if (typeof window === "undefined") return false;
  return window.location.hostname === "app.vakilcase.com";
}

const MARKETING_HOSTS = ["www.vakilcase.com", "vakilcase.com"];

export function isMarketingDomain() {
  if (typeof window === "undefined") return false;
  return MARKETING_HOSTS.includes(window.location.hostname);
}

const PUBLIC_PATHS = [
  "/",
  "/features",
  "/pricing",
  "/for-lawyers",
  "/for-clients",
  "/about",
  "/demo",
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
];

export function isPublicPath(pathname) {
  return PUBLIC_PATHS.includes(pathname) || pathname.startsWith("/public/forms/");
}