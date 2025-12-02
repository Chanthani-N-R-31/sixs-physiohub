// Design System - Unified styling based on Login Page design
// This ensures UI consistency across the entire application

export const designTokens = {
  // Colors - Based on Login Page
  primary: {
    main: "#1a4d4d",
    light: "#2a6d6d",
    dark: "#0d3d3d",
    hover: "#1a4d4d90",
    opacity: {
      80: "#1a4d4d80",
      90: "#1a4d4d90",
      60: "#1a4d4d60",
      50: "#1a4d4d50",
    },
  },
  
  // Glass morphism effect (from login page)
  glass: {
    bg: "bg-white/10",
    backdrop: "backdrop-blur-md",
    border: "border-white/30",
    borderLight: "border-white/40",
  },
  
  // Text colors
  text: {
    primary: "text-white",
    secondary: "text-white/70",
    muted: "text-white/60",
    dark: "text-gray-900",
    darkSecondary: "text-gray-700",
  },
  
  // Background colors
  background: {
    dark: "#0a0a0a",
    card: "bg-white/10 backdrop-blur-md",
    cardHover: "bg-white/15",
  },
  
  // Shadows
  shadow: {
    sm: "shadow-md",
    md: "shadow-lg",
    lg: "shadow-xl",
    xl: "shadow-2xl",
  },
  
  // Border radius
  radius: {
    sm: "rounded-lg",
    md: "rounded-xl",
    lg: "rounded-2xl",
  },
  
  // Typography
  typography: {
    font: "font-bold",
    heading: "font-bold text-white",
    body: "font-bold text-white",
  },
};

// Button styles - Primary button matching login page
export const buttonStyles = {
  primary: "w-full py-3 bg-[#1a4d4d]/80 backdrop-blur-sm text-white rounded-lg font-bold hover:bg-[#1a4d4d]/90 transition-all shadow-lg hover:shadow-xl disabled:bg-[#1a4d4d]/60 border border-[#1a4d4d]/50",
  
  secondary: "px-4 py-2 bg-white/10 backdrop-blur-md text-white rounded-lg font-bold hover:bg-white/20 transition-all shadow-md border border-white/30",
  
  outline: "px-4 py-2 bg-transparent text-[#1a4d4d] rounded-lg font-bold hover:bg-[#1a4d4d]/10 transition-all border-2 border-[#1a4d4d]",
  
  danger: "px-4 py-2 bg-red-500/80 backdrop-blur-sm text-white rounded-lg font-bold hover:bg-red-500/90 transition-all shadow-md border border-red-500/50",
  
  ghost: "px-4 py-2 text-white/70 rounded-lg font-medium hover:bg-white/10 transition-all",
};

// Input styles - Matching login page
export const inputStyles = {
  primary: "w-full p-3 bg-white/20 backdrop-blur-md border border-white/40 rounded-lg text-white font-bold placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50 focus:bg-white/30 shadow-lg",
  
  dark: "w-full p-3 bg-gray-800/50 backdrop-blur-md border border-gray-700/50 rounded-lg text-white font-bold placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1a4d4d]/50 focus:bg-gray-800/70 shadow-lg",
};

// Card styles - Glass morphism effect
export const cardStyles = {
  glass: "bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl border border-white/30",
  
  solid: "bg-white rounded-2xl shadow-lg border border-gray-200",
  
  dark: "bg-gray-900/50 backdrop-blur-md rounded-2xl shadow-xl border border-gray-700/50",
};

// Helper function to get consistent spacing
export const spacing = {
  xs: "p-2",
  sm: "p-4",
  md: "p-6",
  lg: "p-8",
  xl: "p-10",
};

