import {
  CryptoData,
  EmailData,
  GeoData,
  QRStyleConfig,
  SmsData,
  SocialData,
  VCardData,
  WhatsappData,
  WifiData,
} from '../types/qr';

export const DEFAULT_STYLE_CONFIG: QRStyleConfig = {
  width: 320,
  height: 320,
  margin: 12,
  ecLevel: 'M',
  
  dotType: 'rounded',
  fgColor: '#0f172a',
  useFgGradient: false,
  fgGradient: {
    enabled: false,
    type: 'linear',
    color1: '#0f172a',
    color2: '#2563eb',
    rotation: 45,
  },
  
  bgColor: '#ffffff',
  bgTransparent: false,

  cornersSquareType: 'extra-rounded',
  cornersSquareColor: '#0f172a',
  useCustomCornersSquareColor: false,

  cornersDotType: 'dot',
  cornersDotColor: '#2563eb',
  useCustomCornersDotColor: false,

  logoUrl: '',
  logoSize: 0.22,
  logoMargin: 6,
  hideBgDotsBehindLogo: true,
};

export function formatWifiPayload(data: WifiData): string {
  if (!data.ssid) return '';
  const enc = data.encryption || 'nopass';
  const pass = data.password ? data.password.replace(/([\\;:,"])/g, '\\$1') : '';
  const ssid = data.ssid.replace(/([\\;:,"])/g, '\\$1');
  const hidden = data.hidden ? 'true' : 'false';
  return `WIFI:S:${ssid};T:${enc};P:${pass};H:${hidden};;`;
}

export function formatVCardPayload(data: VCardData): string {
  if (!data.firstName && !data.lastName && !data.phone && !data.email) return '';
  const fullName = `${data.firstName} ${data.lastName}`.trim();
  const lines = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    `N:${data.lastName || ''};${data.firstName || ''};;;`,
    `FN:${fullName}`,
  ];

  if (data.company) lines.push(`ORG:${data.company}`);
  if (data.title) lines.push(`TITLE:${data.title}`);
  if (data.phone) lines.push(`TEL;TYPE=CELL:${data.phone}`);
  if (data.email) lines.push(`EMAIL:${data.email}`);
  if (data.website) {
    const web = data.website.startsWith('http') ? data.website : `https://${data.website}`;
    lines.push(`URL:${web}`);
  }
  if (data.address) lines.push(`ADR:;;${data.address};;;;`);

  lines.push('END:VCARD');
  return lines.join('\n');
}

export function formatWhatsappPayload(data: WhatsappData): string {
  if (!data.phone) return '';
  const cleanPhone = data.phone.replace(/[^0-9]/g, '');
  const msg = data.message ? `?text=${encodeURIComponent(data.message)}` : '';
  return `https://wa.me/${cleanPhone}${msg}`;
}

export function formatEmailPayload(data: EmailData): string {
  if (!data.email) return '';
  const params: string[] = [];
  if (data.subject) params.push(`subject=${encodeURIComponent(data.subject)}`);
  if (data.body) params.push(`body=${encodeURIComponent(data.body)}`);
  const query = params.length > 0 ? `?${params.join('&')}` : '';
  return `mailto:${data.email}${query}`;
}

export function formatSmsPayload(data: SmsData): string {
  if (!data.phone) return '';
  const msg = data.message ? `:${data.message}` : '';
  return `smsto:${data.phone}${msg}`;
}

export function formatGeoPayload(data: GeoData): string {
  if (!data.latitude || !data.longitude) return '';
  return `geo:${data.latitude},${data.longitude}?q=${data.latitude},${data.longitude}`;
}

export function formatSocialPayload(data: SocialData): string {
  if (!data.username) return '';
  const handle = data.username.replace(/^@/, '').trim();
  switch (data.platform) {
    case 'instagram':
      return `https://instagram.com/${handle}`;
    case 'linkedin':
      return `https://linkedin.com/in/${handle}`;
    case 'x':
      return `https://x.com/${handle}`;
    case 'youtube':
      return `https://youtube.com/@${handle}`;
    case 'tiktok':
      return `https://tiktok.com/@${handle}`;
    case 'facebook':
      return `https://facebook.com/${handle}`;
    default:
      return handle;
  }
}

export function formatCryptoPayload(data: CryptoData): string {
  if (!data.address) return '';
  let scheme = 'bitcoin';
  if (data.coin === 'ETH') scheme = 'ethereum';
  else if (data.coin === 'USDT') scheme = 'usdt';
  else if (data.coin === 'SOL') scheme = 'solana';

  const amountParam = data.amount ? `?amount=${data.amount}` : '';
  return `${scheme}:${data.address}${amountParam}`;
}

// Built-in vector SVG icon presets as Data URLs for immediate branding
export const PRESET_LOGOS = [
  {
    name: 'Sin logo',
    url: '',
    icon: 'none',
  },
  {
    name: 'WhatsApp',
    url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%2325D366"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981z"/></svg>',
    icon: 'whatsapp',
  },
  {
    name: 'Wi-Fi',
    url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="%232563eb" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h.01"/><path d="M2 8.82a15 15 0 0 1 20 0"/><path d="M5 12.85a10 10 0 0 1 14 0"/><path d="M8.5 16.88a5 5 0 0 1 7 0"/></svg>',
    icon: 'wifi',
  },
  {
    name: 'Instagram',
    url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="%23E4405F" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>',
    icon: 'instagram',
  },
  {
    name: 'LinkedIn',
    url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%230A66C2"><path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.25V10.9H6.46M7.86 6.78a1.62 1.62 0 1 0 0 3.24 1.62 1.62 0 0 0 0-3.24z"/></svg>',
    icon: 'linkedin',
  },
  {
    name: 'Web / Globo',
    url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="%232563eb" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg>',
    icon: 'globe',
  },
  {
    name: 'Estrella',
    url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23eab308"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>',
    icon: 'star',
  },
  {
    name: 'Corazón',
    url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23ef4444"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>',
    icon: 'heart',
  },
  {
    name: 'Tienda / Shop',
    url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="%2310b981" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>',
    icon: 'store',
  },
];

export function parseCSVInput(text: string): { label: string; value: string }[] {
  const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  const items: { label: string; value: string }[] = [];

  lines.forEach((line, index) => {
    // Check if comma or tab separated
    let parts = line.split(',');
    if (parts.length < 2) {
      parts = line.split('\t');
    }

    if (parts.length >= 2) {
      const label = parts[0].replace(/^["']|["']$/g, '').trim();
      const val = parts.slice(1).join(',').replace(/^["']|["']$/g, '').trim();
      if (val) {
        items.push({ label: label || `QR #${index + 1}`, value: val });
      }
    } else {
      // Single column line
      const val = line.replace(/^["']|["']$/g, '').trim();
      if (val) {
        items.push({ label: `Item ${index + 1}`, value: val });
      }
    }
  });

  return items;
}

export function convertCloudShareLink(url: string): string {
  if (!url) return '';
  const trimmed = url.trim();

  // Google Drive share link: https://drive.google.com/file/d/FILE_ID/view?usp=sharing
  const gdriveRegex = /drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/;
  const gdriveMatch = trimmed.match(gdriveRegex);
  if (gdriveMatch && gdriveMatch[1]) {
    return `https://drive.google.com/uc?export=view&id=${gdriveMatch[1]}`;
  }

  // Dropbox link: https://www.dropbox.com/s/xyz/file.png?dl=0
  if (trimmed.includes('dropbox.com')) {
    return trimmed.replace(/\?dl=0$/, '?raw=1').replace(/&dl=0$/, '&raw=1');
  }

  return trimmed;
}

export function compressImageForQR(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Error al leer la imagen'));
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = () => reject(new Error('Error al procesar la imagen'));
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxDim = 80;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxDim) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          }
        } else {
          if (height > maxDim) {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        canvas.width = Math.max(width, 10);
        canvas.height = Math.max(height, 10);

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('No se pudo procesar el lienzo'));
          return;
        }

        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        const compressed = canvas.toDataURL('image/jpeg', 0.4);
        resolve(compressed);
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
}
