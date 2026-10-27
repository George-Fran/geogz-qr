export type QRType =
  | 'url'
  | 'text'
  | 'wifi'
  | 'vcard'
  | 'whatsapp'
  | 'email'
  | 'sms'
  | 'geo'
  | 'social'
  | 'crypto'
  | 'image';

export type DotType = 'square' | 'dots' | 'rounded' | 'classy' | 'classy-rounded' | 'extra-rounded';
export type CornerSquareType = 'square' | 'dot' | 'extra-rounded';
export type CornerDotType = 'square' | 'dot';
export type ErrorCorrectionLevel = 'L' | 'M' | 'Q' | 'H';
export type ExportExtension = 'png' | 'svg' | 'jpeg' | 'webp';

export interface GradientConfig {
  enabled: boolean;
  type: 'linear' | 'radial';
  color1: string;
  color2: string;
  rotation: number;
}

export interface QRStyleConfig {
  width: number;
  height: number;
  margin: number;
  ecLevel: ErrorCorrectionLevel;
  
  // Dots pattern
  dotType: DotType;
  fgColor: string;
  useFgGradient: boolean;
  fgGradient: GradientConfig;
  
  // Background
  bgColor: string;
  bgTransparent: boolean;

  // Eyes (Corners)
  cornersSquareType: CornerSquareType;
  cornersSquareColor: string;
  useCustomCornersSquareColor: boolean;

  cornersDotType: CornerDotType;
  cornersDotColor: string;
  useCustomCornersDotColor: boolean;

  // Logo
  logoUrl: string;
  logoSize: number; // 0.1 to 0.4
  logoMargin: number;
  hideBgDotsBehindLogo: boolean;
}

export interface WifiData {
  ssid: string;
  password: string;
  encryption: 'WPA' | 'WEP' | 'nopass';
  hidden: boolean;
}

export interface VCardData {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  company: string;
  title: string;
  website: string;
  address: string;
}

export interface WhatsappData {
  phone: string;
  message: string;
}

export interface EmailData {
  email: string;
  subject: string;
  body: string;
}

export interface SmsData {
  phone: string;
  message: string;
}

export interface GeoData {
  latitude: string;
  longitude: string;
}

export interface SocialData {
  platform: 'instagram' | 'linkedin' | 'x' | 'youtube' | 'tiktok' | 'facebook';
  username: string;
}

export interface CryptoData {
  coin: 'BTC' | 'ETH' | 'USDT' | 'SOL';
  address: string;
  amount: string;
}

export interface BulkItem {
  id: string;
  label: string;
  value: string;
  status: 'pending' | 'ready' | 'error';
  dataUrl?: string;
  error?: string;
}

export interface QRPreset {
  id: string;
  name: string;
  config: QRStyleConfig;
  createdAt: number;
}

export interface HistoryItem {
  id: string;
  title: string;
  type: QRType;
  value: string;
  config: QRStyleConfig;
  createdAt: number;
}
