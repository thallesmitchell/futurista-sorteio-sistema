
"use client"

import { useTheme } from "@/contexts/ThemeContext"
import { Toaster as Sonner } from "sonner"

type ToasterProps = React.ComponentProps<typeof Sonner>

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

  return (
    <Sonner
      theme="light"
      className="toaster group"
      position="top-right"
      toastOptions={{
        style: {
          maxWidth: '420px',
          width: 'auto'
        },
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-muted-foreground",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
        },
      }}
      {...props}
    />
  )
}
