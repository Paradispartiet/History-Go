// Minimal inline SVG-ikoner pr kategori
function getIconSVG(category) {
  const c = (category||"").toLowerCase();
  const common = 'viewBox="0 0 24 24" fill="currentColor"';
  if (c.includes("kultur")) return `<svg ${common}><path d="M12 3l7 4v4c0 5-3 7-7 10-4-3-7-5-7-10V7l7-4z"/></svg>`;
  if (c.includes("sport"))  return `<svg ${common}><path d="M7 11a5 5 0 1010 0 5 5 0 00-10 0zm-4 9l5-5"/></svg>`;
  if (c.includes("natur"))  return `<svg ${common}><path d="M12 2C6 8 6 14 12 22c6-8 6-14 0-20zM12 8v10"/></svg>`;
  if (c.includes("urban"))  return `<svg ${common}><path d="M3 21h18v-2H3v2zm2-3h5V4H5v14zm7 0h7V10h-7v8z"/></svg>`;
  if (c.includes("vitenskap")) return `<svg ${common}><path d="M12 3l3 6h6l-4.5 4 2 7L12 16l-6.5 4 2-7L3 9h6l3-6z"/></svg>`;
  /* Historie */
  return `<svg ${common}><path d="M4 6h16v2H4V6zm0 4h10v2H4v-2zm0 4h16v2H4v-2z"/></svg>`;
}
function catToRingClass(category){
  const c = (category||"").toLowerCase();
  if (c.includes("kultur")) return "ring-kult";
  if (c.includes("sport"))  return "ring-sport";
  if (c.includes("natur"))  return "ring-natur";
  if (c.includes("urban"))  return "ring-urban";
  if (c.includes("vitenskap")) return "ring-viten";
  return "ring-hist";
}
