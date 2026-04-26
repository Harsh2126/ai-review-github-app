// ===== UTILS =====
// Small reusable helper functions

// Escapes HTML special characters to prevent XSS attacks
export const escHtml = (str) =>
  String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

// Formats ISO date string to readable local time
// e.g. "2024-04-26T12:00:00Z" → "4/26/2024, 12:00:00 PM"
export const formatDate = (dateStr) =>
  dateStr ? new Date(dateStr).toLocaleString() : "—";
