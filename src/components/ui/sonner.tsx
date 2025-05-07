
"use client"

import { useTheme } from "@/contexts/ThemeContext"
import { Toaster as Sonner } from "sonner"

type ToasterProps = React.ComponentProps<typeof Sonner>

export function Toaster({ ...props }: ToasterProps) {
  // Tentar usar o contexto de tema, mas fornecer um fallback se não estiver disponível
  let primaryColor = '#39FF14'; // Cor padrão
  
  try {
    const themeContext = useTheme();
    if (themeContext && themeContext.primaryColor) {
      primaryColor = themeContext.primaryColor;
    }
  } catch (error) {
    console.log('Contexto de tema não disponível, usando cor padrão');
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
