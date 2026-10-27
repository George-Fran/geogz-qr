import { QRStyleConfig } from '../types/qr';

export interface ReadabilityReport {
  score: number; // 0 to 100
  status: 'excellent' | 'warning' | 'error';
  title: string;
  contrastRatio: number;
  messages: { type: 'success' | 'warning' | 'error' | 'info'; text: string }[];
}

// Convert hex color to RGB
function hexToRgb(hex: string): { r: number; g: number; b: number } {
  let clean = hex.replace('#', '');
  if (clean.length === 3) {
    clean = clean.split('').map((c) => c + c).join('');
  }
  const num = parseInt(clean, 16);
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  };
}

// Calculate relative luminance according to WCAG 2.1 formula
function getLuminance(hex: string): number {
  const { r, g, b } = hexToRgb(hex);
  const a = [r, g, b].map((v) => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
}

// Calculate WCAG contrast ratio between two hex colors
export function calculateContrastRatio(color1: string, color2: string): number {
  try {
    const lum1 = getLuminance(color1);
    const lum2 = getLuminance(color2);
    const brightest = Math.max(lum1, lum2);
    const darkest = Math.min(lum1, lum2);
    return (brightest + 0.05) / (darkest + 0.05);
  } catch {
    return 4.5;
  }
}

export function analyzeReadability(
  config: QRStyleConfig,
  payload: string
): ReadabilityReport {
  const messages: { type: 'success' | 'warning' | 'error' | 'info'; text: string }[] = [];
  let score = 100;

  // Determine colors to test
  const fgColorToTest = config.useFgGradient ? config.fgGradient.color1 : config.fgColor;
  const bgColorToTest = config.bgTransparent ? '#ffffff' : config.bgColor;

  const contrastRatio = calculateContrastRatio(fgColorToTest, bgColorToTest);

  // 1. Contrast Evaluation
  if (contrastRatio >= 4.5) {
    messages.push({
      type: 'success',
      text: `Contraste elevado (${contrastRatio.toFixed(1)}:1). Los escáneres detectarán fácilmente el código.`,
    });
  } else if (contrastRatio >= 3.0) {
    score -= 25;
    messages.push({
      type: 'warning',
      text: `Contraste moderado (${contrastRatio.toFixed(1)}:1). Se recomienda oscurecer el QR o aclarar el fondo.`,
    });
  } else {
    score -= 55;
    messages.push({
      type: 'error',
      text: `Contraste crítico (${contrastRatio.toFixed(1)}:1). El color del código y el fondo son muy similares y pueden fallar al escanear.`,
    });
  }

  // 2. Logo Size vs Error Correction Level
  if (config.logoUrl) {
    if (config.logoSize > 0.25 && (config.ecLevel === 'L' || config.ecLevel === 'M')) {
      score -= 30;
      messages.push({
        type: 'error',
        text: `Atención: El logo ocupa un ${Math.round(config.logoSize * 100)}% del QR. Sube el nivel de Corrección de Errores a Q o H para asegurar la lectura.`,
      });
    } else if (config.logoSize > 0.3) {
      score -= 10;
      messages.push({
        type: 'warning',
        text: `Logotipo grande (${Math.round(config.logoSize * 100)}%). Verifica con la cámara de tu teléfono antes de imprimir en masa.`,
      });
    } else {
      messages.push({
        type: 'success',
        text: `Proporción del logo óptima (${Math.round(config.logoSize * 100)}%) con nivel de corrección ${config.ecLevel}.`,
      });
    }
  }

  // 3. Quiet Zone Margin Check
  if (config.margin < 6) {
    score -= 10;
    messages.push({
      type: 'warning',
      text: `Margen estrecho (${config.margin}px). Mantén al menos 8px de margen exterior si lo vas a imprimir sobre superficies con textura.`,
    });
  }

  // 4. Payload Length & Data Density
  if (payload.length > 200) {
    messages.push({
      type: 'info',
      text: `Contenido extenso (${payload.length} caracteres). La matriz del QR es densa; se sugiere exportar a 1000px o más.`,
    });
  }

  // Final score & status classification
  score = Math.max(0, Math.min(100, score));

  let status: 'excellent' | 'warning' | 'error' = 'excellent';
  let title = '100% Legible · Contraste Óptimo';

  if (score >= 85) {
    status = 'excellent';
    title = `${score}% Legible · Excelente Escaneo`;
  } else if (score >= 50) {
    status = 'warning';
    title = `${score}% Legible · Contraste Moderado`;
  } else {
    status = 'error';
    title = `${score}% Legible · Riesgo de Lectura`;
  }

  return {
    score,
    status,
    title,
    contrastRatio,
    messages,
  };
}
