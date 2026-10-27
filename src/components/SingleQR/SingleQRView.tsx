import React, { useState, useMemo } from 'react';
import {
  CryptoData,
  EmailData,
  GeoData,
  QRStyleConfig,
  QRType,
  SmsData,
  SocialData,
  VCardData,
  WhatsappData,
  WifiData,
} from '../../types/qr';
import {
  DEFAULT_STYLE_CONFIG,
  formatCryptoPayload,
  formatEmailPayload,
  formatGeoPayload,
  formatSmsPayload,
  formatSocialPayload,
  formatVCardPayload,
  formatWhatsappPayload,
  formatWifiPayload,
} from '../../utils/qrUtils';
import { QRFormInputs } from './QRFormInputs';
import { QRStylingPanel } from './QRStylingPanel';
import { QRPreview } from './QRPreview';
import { ErrorBoundary } from '../ErrorBoundary';
import { SlidersHorizontal, Sparkles, RefreshCw } from 'lucide-react';

interface SingleQRViewProps {
  config: QRStyleConfig;
  setConfig: React.Dispatch<React.SetStateAction<QRStyleConfig>>;
  showToast: (type: 'success' | 'error' | 'info', text: string) => void;
  onSavePreset: (config: QRStyleConfig) => void;
  onSaveHistory: (title: string, type: QRType, value: string, config: QRStyleConfig) => void;
}

export const SingleQRView: React.FC<SingleQRViewProps> = ({
  config,
  setConfig,
  showToast,
  onSavePreset,
  onSaveHistory,
}) => {
  const [qrType, setQrType] = useState<QRType>('url');
  const [rawText, setRawText] = useState('https://qrstudio.app');
  
  const [wifi, setWifi] = useState<WifiData>({
    ssid: 'MiRedWiFi',
    password: 'Password123',
    encryption: 'WPA',
    hidden: false,
  });

  const [vcard, setVcard] = useState<VCardData>({
    firstName: 'Alejandro',
    lastName: 'García',
    phone: '+52 55 1234 5678',
    email: 'alejandro@estudio.com',
    company: 'Diseño & Tecnología',
    title: 'Consultor Senior',
    website: 'https://estudio.com',
    address: 'Av. Reforma 100, CDMX',
  });

  const [whatsapp, setWhatsapp] = useState<WhatsappData>({
    phone: '+525512345678',
    message: '¡Hola! Quisiera solicitar más información.',
  });

  const [email, setEmail] = useState<EmailData>({
    email: 'contacto@estudio.com',
    subject: 'Consulta Comercial',
    body: 'Hola, estoy interesado en sus servicios...',
  });

  const [sms, setSms] = useState<SmsData>({
    phone: '+525512345678',
    message: 'CONFIRMAR ASISTENCIA',
  });

  const [geo, setGeo] = useState<GeoData>({
    latitude: '19.432608',
    longitude: '-99.133209',
  });

  const [social, setSocial] = useState<SocialData>({
    platform: 'instagram',
    username: 'estudiodigital',
  });

  const [crypto, setCrypto] = useState<CryptoData>({
    coin: 'BTC',
    address: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
    amount: '0.01',
  });

  // Calculate payload based on active QR type
  const payload = useMemo(() => {
    switch (qrType) {
      case 'url':
      case 'text':
        return rawText;
      case 'wifi':
        return formatWifiPayload(wifi);
      case 'vcard':
        return formatVCardPayload(vcard);
      case 'whatsapp':
        return formatWhatsappPayload(whatsapp);
      case 'email':
        return formatEmailPayload(email);
      case 'sms':
        return formatSmsPayload(sms);
      case 'geo':
        return formatGeoPayload(geo);
      case 'social':
        return formatSocialPayload(social);
      case 'crypto':
        return formatCryptoPayload(crypto);
      default:
        return rawText;
    }
  }, [qrType, rawText, wifi, vcard, whatsapp, email, sms, geo, social, crypto]);

  const handleReset = () => {
    setConfig(DEFAULT_STYLE_CONFIG);
    showToast('info', 'Estilos restablecidos a valores por defecto');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Kicker header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Diseñador y Generador de Códigos QR
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Crea códigos QR personalizados en alta resolución con tu marca, colores, formas y logotipos.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-400 hover:text-white bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl transition-all"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Restablecer Estilo</span>
          </button>
        </div>
      </div>

      {/* Main 2-column studio layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column (Inputs & Styling Tabs) - 7 cols */}
        <div className="lg:col-span-7 space-y-8">
          {/* Content Inputs Section */}
          <section className="bg-slate-900/30 border border-slate-800/80 rounded-2xl p-5 sm:p-6 space-y-6">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-500" />
              <span>1. Configurar Contenido</span>
            </h2>

            <QRFormInputs
              qrType={qrType}
              setQrType={setQrType}
              rawText={rawText}
              setRawText={setRawText}
              wifi={wifi}
              setWifi={setWifi}
              vcard={vcard}
              setVcard={setVcard}
              whatsapp={whatsapp}
              setWhatsapp={setWhatsapp}
              email={email}
              setEmail={setEmail}
              sms={sms}
              setSms={setSms}
              geo={geo}
              setGeo={setGeo}
              social={social}
              setSocial={setSocial}
              crypto={crypto}
              setCrypto={setCrypto}
            />
          </section>

          {/* Personalization & Styling Section */}
          <section className="bg-slate-900/30 border border-slate-800/80 rounded-2xl p-5 sm:p-6 space-y-6">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-500" />
              <span>2. Personalizar Diseño y Marca</span>
            </h2>

            <QRStylingPanel config={config} setConfig={setConfig} />
          </section>
        </div>

        {/* Right Column (Live Preview & Export Options) - 5 cols */}
        <div className="lg:col-span-5">
          <ErrorBoundary fallbackMessage="El archivo o imagen seleccionada es demasiado grande para codificarse en la matriz del QR. Pega un enlace web (ej. Google Drive, Imgur, Dropbox).">
            <QRPreview
              payload={payload}
              config={config}
              setConfig={setConfig}
              onSavePreset={() => onSavePreset(config)}
              onSaveHistory={(actionTitle) =>
                onSaveHistory(actionTitle, qrType, payload, config)
              }
              showToast={showToast}
            />
          </ErrorBoundary>
        </div>
      </div>
    </div>
  );
};
