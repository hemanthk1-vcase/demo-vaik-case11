import React from "react";

// Microsoft four-square logo (brand colors)
export function MicrosoftIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 23 23" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <rect x="1" y="1" width="10" height="10" fill="#F25022" />
      <rect x="12" y="1" width="10" height="10" fill="#7FBA00" />
      <rect x="1" y="12" width="10" height="10" fill="#00A4EF" />
      <rect x="12" y="12" width="10" height="10" fill="#FFB900" />
    </svg>
  );
}

// Facebook "f" logo
export function FacebookIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M24 12.073C24 5.404 18.627 0 12 0S0 5.404 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z" />
    </svg>
  );
}

// Apple logo
export function AppleIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M17.05 12.04c-.03-2.66 2.17-3.94 2.27-4-1.24-1.81-3.17-2.06-3.85-2.08-1.63-.17-3.2.96-4.03.96-.84 0-2.12-.94-3.49-.91-1.79.03-3.45 1.04-4.37 2.65-1.87 3.24-.48 8.03 1.33 10.66.89 1.29 1.95 2.73 3.33 2.68 1.34-.06 1.85-.86 3.47-.86 1.61 0 2.08.86 3.5.83 1.45-.03 2.36-1.31 3.24-2.61 1.03-1.5 1.45-2.96 1.47-3.04-.03-.01-2.82-1.08-2.85-4.28zM14.43 4.4c.74-.9 1.24-2.14 1.1-3.39-1.07.04-2.36.71-3.13 1.61-.69.79-1.29 2.06-1.13 3.28 1.19.09 2.42-.6 3.16-1.5z" />
    </svg>
  );
}