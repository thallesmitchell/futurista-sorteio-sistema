
"use client"

import { useTheme } from "@/contexts/ThemeContext"
import { Toaster as Sonner } from "sonner"

type ToasterProps = React.ComponentProps<typeof Sonner>

function getTextColor(backgroundColor: string): string {
  // Convert hex to RGB
  let r = 0, g = 0, b = 0;
  
  if (backgroundColor.startsWith('#')) {
    const hex = backgroundColor.substring(1);
    
    if (hex.length === 3) {
      r = parseInt(hex[0] + hex[0], 16);
      g = parseInt(hex[1] + hex[1], 16);
      b = parseInt(hex[2] + hex[2], 16);
    } else if (hex.length === 6) {
      r = parseInt(hex.substring(0, 2), 16);
      g = parseInt(hex.substring(2, 4), 16);
      b = parseInt(hex.substring(4, 6), 16);
    }
  }
  
  // Calculate luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  
  // Return white for dark backgrounds, black for light backgrounds
  return luminance > 0.5 ? '#000000' : '#FFFFFF';
}

export function Toaster({ ...props }: ToasterProps) {
  // Try to use theme context, but provide a fallback if not available
  let primaryColor = '#39FF14'; // Default color
  
  try {
    const themeContext = useTheme();
    if (themeContext && themeContext.primaryColor) {
      primaryColor = themeContext.primaryColor;
    }
  } catch (error) {
    console.log('Theme context not available, using default color');
  }
  
  const textColor = getTextColor(primaryColor);

  return (
    <Sonner
      theme="dark"
      className="toaster group"
      position="top-right"
      toastOptions={{
        style: {
          maxWidth: '320px',
          width: 'auto',
          backgroundColor: primaryColor,
          color: textColor,
          border: `1px solid ${primaryColor}`
        },
        classNames: {
          toast: "group toast",
          description: "group-[.toast]:text-sm",
          actionButton: "group-[.toast]:bg-white group-[.toast]:text-black",
          cancelButton: "group-[.toast]:bg-primary/50 group-[.toast]:text-white",
        },
      }}
      {...props}
    />
  )
}
