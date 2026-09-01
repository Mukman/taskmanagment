// Shared design tokens — import these instead of hardcoding colors/sizes
// so every screen stays visually consistent.
// Style direction: modern SaaS dashboard (Linear / Notion / Stripe) —
// light surfaces, soft shadows instead of hard borders, generous spacing,
// a single indigo accent used sparingly.

export const T = {
  bg: "#F7F8FA",
  surface: "#FFFFFF",
  border: "#E9EAEE",
  borderStrong: "#D7D9DF",

  sidebarBg: "#FBFBFC",
  sidebarBorder: "#EDEEF2",
  sidebarActive: "#EEEEFB",

  ink: "#18181B",
  inkSoft: "#6B6F76",
  inkMuted: "#9A9EA6",

  accent: "#5B57D1",
  accentSoft: "#EEEEFB",
  danger: "#DC3B3B",
  dangerSoft: "#FCECEC",
  warn: "#C57A1F",
  warnSoft: "#FBF1E3",
  good: "#1E9E63",
  goodSoft: "#E7F6EE",
  neutralSoft: "#F1F2F5",
  low: "#6E9A82",

  // Bold, saturated variants for the status stat panels (To Do / In
  // Progress / Completed / Overdue) — high contrast, white text on top.
  boldNeutral: "#71767F",
  boldAccent: "#5B57D1",
  boldGood: "#1E9E63",
  boldDanger: "#E5484D",

  radius: 10,
  radiusLg: 14,

  font: {
    xs: 11,
    sm: 12,
    base: 13,
    md: 14,
    lg: 16,
    xl: 19,
    xxl: 23,
  },

  mono: "ui-monospace, SFMono-Regular, Menlo, monospace",
  sans: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",

  shadow: "0 1px 2px rgba(24,24,27,0.04), 0 1px 6px rgba(24,24,27,0.05)",

  contentWidth: 680,
  sidebarWidth: 208,
};

export const priorityColor = { High: T.danger, Med: T.warn, Low: T.low };

export const card = {
  background: T.surface,
  border: `1px solid ${T.border}`,
  borderRadius: T.radius,
  boxShadow: T.shadow,
};

export const input = {
  width: "100%",
  border: `1px solid ${T.border}`,
  borderRadius: T.radius - 2,
  padding: "8px 10px",
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
  borderRadius: T.radius - 2,
  padding: "8px 14px",
  fontSize: T.font.base,
  fontWeight: 600,
  cursor: "pointer",
};

export const btnSecondary = {
  background: T.bg,
  color: T.inkSoft,
  border: `1px solid ${T.border}`,
  borderRadius: T.radius - 2,
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
  marginBottom: 10,
};
