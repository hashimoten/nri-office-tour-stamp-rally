export const eventTheme = {
  colors: {
    primary: "#173B6C",
    primaryDeep: "#102A4D",
    secondary: "#2878B5",
    secondaryLight: "#D9ECF8",
    accent: "#C43D4B",
    background: "#F4F7FA",
    surface: "#FFFFFF",
    surfaceMuted: "#EDF3F8",
    text: "#17202A",
    mutedText: "#536273",
    border: "#D7E1EA",
    success: "#1E6B58",
  },
  radius: {
    small: "10px",
    medium: "18px",
    large: "28px",
  },
  shadow: {
    card: "0 14px 34px rgba(23, 59, 108, 0.09)",
    elevated: "0 22px 60px rgba(16, 42, 77, 0.16)",
  },
} as const;

const cssVariables: Record<string, string> = {
  "--color-primary": eventTheme.colors.primary,
  "--color-primary-deep": eventTheme.colors.primaryDeep,
  "--color-secondary": eventTheme.colors.secondary,
  "--color-secondary-light": eventTheme.colors.secondaryLight,
  "--color-accent": eventTheme.colors.accent,
  "--color-background": eventTheme.colors.background,
  "--color-surface": eventTheme.colors.surface,
  "--color-surface-muted": eventTheme.colors.surfaceMuted,
  "--color-text": eventTheme.colors.text,
  "--color-muted-text": eventTheme.colors.mutedText,
  "--color-border": eventTheme.colors.border,
  "--color-success": eventTheme.colors.success,
  "--radius-small": eventTheme.radius.small,
  "--radius-medium": eventTheme.radius.medium,
  "--radius-large": eventTheme.radius.large,
  "--shadow-card": eventTheme.shadow.card,
  "--shadow-elevated": eventTheme.shadow.elevated,
};

export const applyEventTheme = (target: HTMLElement = document.documentElement) => {
  for (const [property, value] of Object.entries(cssVariables)) {
    target.style.setProperty(property, value);
  }
};

