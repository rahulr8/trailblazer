type GradientConfig = {
  colors: readonly string[];
  start?: { x: number; y: number };
  end?: { x: number; y: number };
};

const diagonal = { start: { x: 0, y: 0 }, end: { x: 1, y: 1 } };
const horizontal = { start: { x: 0, y: 0 }, end: { x: 1, y: 0 } };

interface GradientValue {
  colors: readonly string[];
  start: { x: number; y: number };
  end: { x: number; y: number };
}

export const Gradients = {
  light: {
    primary: {
      colors: ["#2D6A4F", "#1B4332"] as const,
      ...diagonal,
    },
    accent: {
      colors: ["#52B788", "#40916C"] as const,
      ...diagonal,
    },
    ai: {
      colors: ["#7B68AE", "#5A4E8C"] as const,
      ...diagonal,
    },
    gold: {
      colors: ["#D4A373", "#C48B5C", "#A67C52"] as const,
      ...horizontal,
    },
    danger: {
      colors: ["#E63946", "#D62839"] as const,
      ...diagonal,
    },
  },
  dark: {
    primary: {
      colors: ["#74C69D", "#52B788"] as const,
      ...diagonal,
    },
    accent: {
      colors: ["#95D5B2", "#74C69D"] as const,
      ...diagonal,
    },
    ai: {
      colors: ["#A594C9", "#7B68AE"] as const,
      ...diagonal,
    },
    gold: {
      colors: ["#DDB892", "#D4A373", "#C48B5C"] as const,
      ...horizontal,
    },
    danger: {
      colors: ["#FF6B6B", "#FF5252"] as const,
      ...diagonal,
    },
  },
} as const;

export type GradientKey = keyof typeof Gradients.light;
export type GradientTokens = {
  [K in GradientKey]: GradientValue;
};
