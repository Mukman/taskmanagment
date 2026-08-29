// Shared design tokens — import these instead of hardcoding colors/sizes
// so every screen stays visually consistent.

export const T = {
  bg: "#F3F4F6",
  surface: "#FFFFFF",
  border: "#E1E4E9",
  borderStrong: "#CBD0D8",
  sidebar: "#101A30",
  sidebarActive: "rgba(255,255,255,0.08)",

  ink: "#161B26",
  inkSoft: "#5B6472",
  inkMuted: "#8A93A3",

  accent: "#2F5AA8",
  accentSoft: "#EAF1FB",
  danger: "#C6414D",
  dangerSoft: "#FBEAEC",
  warn: "#C57A1F",
  warnSoft: "#FBF1E3",
  good: "#2F8558",
  goodSoft: "#E6F4ED",
  neutralSoft: "#EDEFF3",
  low: "#6E9A82",

  // Bold, saturated variants for the status stat panels (To Do / In
  // Progress / Completed / Overdue) — high contrast, white text on top.
  boldNeutral: "#4B5568",
  boldAccent: "#2F6FED",
  boldGood: "#1FA971",
  boldDanger: "#EF4444",

  radius: 8,
  radiusLg: 10,

  font: {
    xs: 11,
    sm: 12,
    base: 13,
    md: 14,
    lg: 16,
    xl: 19,
    xxl: 22,
  },

  mono: "ui-monospace, SFMono-Regular, Menlo, monospace",
  sans: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",

  contentWidth: 560,
  sidebarWidth: 72,
};

export const priorityColor = { High: T.danger, Med: T.warn, Low: T.low };

export const card = {
  background: T.surface,
  border: `1px solid ${T.border}`,
  borderRadius: T.radius,
};

export const input = {
  width: "100%",
  border: `1px solid ${T.border}`,
  borderRadius: T.radius,
  padding: "7px 9px",
  fontSize: T.font.base,
  boxSizing: "border-box",
  fontFamily: "inherit",
  color: T.ink,
  background: T.surface,
};

export const btnPrimary = {
  background: T.ink,
  color: "#fff",
  border: "none",
  borderRadius: T.radius,
  padding: "8px 14px",
  fontSize: T.font.base,
  fontWeight: 600,
  cursor: "pointer",
};

export const btnSecondary = {
  background: T.bg,
  color: T.inkSoft,
  border: `1px solid ${T.border}`,
  borderRadius: T.radius,
  padding: "8px 14px",
  fontSize: T.font.base,
  fontWeight: 600,
  cursor: "pointer",
};

export const sectionLabel = {
  fontSize: T.font.xs,
  fontWeight: 700,
  textTransform: "uppercase",
  letterSpacing: "0.05em",
  color: T.inkMuted,
  marginBottom: 8,
};
