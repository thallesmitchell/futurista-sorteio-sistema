
import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useAuth } from './AuthContext';

interface ThemeContextType {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  logoUrl: string | null;
  setPrimaryColor: (color: string) => void;
  setLogoUrl: (url: string | null) => void;
  generatePalette: (baseColor: string) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Função para gerar uma paleta de cores baseada em uma cor primária
const generateColorPalette = (baseColor: string) => {
  // Converter hex para HSL para manipulação mais fácil
  const hexToHSL = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!result) return { h: 0, s: 0, l: 0 };
    
    let r = parseInt(result[1], 16) / 255;
    let g = parseInt(result[2], 16) / 255;
    let b = parseInt(result[3], 16) / 255;
    
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0, s = 0, l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      
      if (max === r) h = (g - b) / d + (g < b ? 6 : 0);
      else if (max === g) h = (b - r) / d + 2;
      else if (max === b) h = (r - g) / d + 4;
      
      h /= 6;
    }

    return { h: h * 360, s: s * 100, l: l * 100 };
  };

  // Converter HSL para Hex
  const hslToHex = (h: number, s: number, l: number) => {
    l /= 100;
    const a = s * Math.min(l, 1 - l) / 100;
    const f = (n: number) => {
      const k = (n + h / 30) % 12;
      const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
      return Math.round(255 * color).toString(16).padStart(2, '0');
    };
    return `#${f(0)}${f(8)}${f(4)}`;
  };

  // Cálculo das cores derivadas
  const { h, s, l } = hexToHSL(baseColor);
  
  // Cor secundária: mesma tonalidade, saturação reduzida
  const secondaryColor = hslToHex(h, Math.max(s - 20, 0), Math.min(l + 10, 95));
  
  // Cor de destaque: deslocamento da tonalidade
  const accentColor = hslToHex((h + 180) % 360, s, l);

  return {
    primaryColor: baseColor,
    secondaryColor,
    accentColor
  };
};

export function ThemeProvider({ children }: { children: ReactNode }) {
  const { userProfile } = useAuth();
  const [primaryColor, setPrimaryColor] = useState<string>('#39FF14'); // Verde neon como padrão
  const [secondaryColor, setSecondaryColor] = useState<string>('#1FCC0C');
  const [accentColor, setAccentColor] = useState<string>('#FF39EA');
  const [logoUrl, setLogoUrl] = useState<string | null>(null);

  // Aplicar CSS customizado para garantir a fonte correta
  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = `
      html, body, button, input, select, textarea {
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, system-ui, sans-serif !important;
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  // Atualizar tema quando o perfil do usuário carregar
  useEffect(() => {
    if (userProfile?.theme_color) {
      generatePalette(userProfile.theme_color);
    }
    if (userProfile?.logo_url) {
      setLogoUrl(userProfile.logo_url);
    }
  }, [userProfile]);

  // Gerar paleta de cores a partir de uma cor base
  const generatePalette = (baseColor: string) => {
    const palette = generateColorPalette(baseColor);
    setPrimaryColor(palette.primaryColor);
    setSecondaryColor(palette.secondaryColor);
    setAccentColor(palette.accentColor);

    // Aplicar variáveis CSS ao documento - usando !important para garantir prioridade
    document.documentElement.style.setProperty('--color-primary', palette.primaryColor, 'important');
    document.documentElement.style.setProperty('--color-secondary', palette.secondaryColor, 'important');
    document.documentElement.style.setProperty('--color-accent', palette.accentColor, 'important');
    
    // Também atualizar as variáveis de cor do Tailwind
    const hue = hexToHSL(palette.primaryColor).h;
    document.documentElement.style.setProperty('--primary', `${hue} 100% 54%`, 'important');
  };

  return (
    <ThemeContext.Provider value={{ 
      primaryColor, 
      secondaryColor, 
      accentColor, 
      logoUrl,
      setPrimaryColor: (color) => generatePalette(color),
      setLogoUrl,
      generatePalette
    }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
