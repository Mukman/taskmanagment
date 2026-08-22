export const PRIORITY = {
  High: { color: "#D64550", label: "High" },
  Med: { color: "#E8A33D", label: "Med" },
  Low: { color: "#6FA88F", label: "Low" },
};

export const STATUSES = ["To Do", "In Progress", "Done"];

export const todayISO = () => new Date().toISOString().slice(0, 10);

export function daysAgoLabel(dateStr) {
  const diff = Math.round((new Date(dateStr) - new Date(todayISO())) / 86400000);
  if (diff === 0) return "Today";
  if (diff === 1) return "Tomorrow";
  if (diff === -1) return "Yesterday";
  if (diff < 0) return `${Math.abs(diff)}d overdue`;
  return `In ${diff}d`;
}
