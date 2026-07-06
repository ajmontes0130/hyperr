/**
 * Returns a friendly date label for date separators.
 * "Today", "Yesterday", or "Jul 3" style.
 */
export function getDateLabel(dateStr) {
  const date = new Date(dateStr);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const input = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const diffDays = Math.round((today - input) / 86400000);
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  return date.toLocaleDateString([], { month: "short", day: "numeric" });
}

/**
 * Formats a timestamp for a message bubble.
 * For today: "3:45 PM"
 * For older dates: "Jul 3, 3:45 PM"
 */
export function formatMessageTime(dateStr) {
  const date = new Date(dateStr);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const input = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const diffDays = Math.round((today - input) / 86400000);
  const time = date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  if (diffDays === 0) return time;
  return `${date.toLocaleDateString([], { month: "short", day: "numeric" })}, ${time}`;
}

/**
 * Returns a key for grouping messages by date (YYYY-MM-DD).
 */
export function getDateKey(dateStr) {
  const date = new Date(dateStr);
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}