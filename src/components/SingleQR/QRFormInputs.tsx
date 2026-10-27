import React from 'react';
import {
  QRType,
  WifiData,
  VCardData,
  WhatsappData,
  EmailData,
  SmsData,
  GeoData,
  SocialData,
  CryptoData,
} from '../../types/qr';
import { convertCloudShareLink, compressImageForQR } from '../../utils/qrUtils';
import {
  Link,
  Wifi,
  Contact,
  MessageCircle,
  Mail,
  MessageSquare,
  MapPin,
  Share2,
  Coins,
  FileText,
  Image as ImageIcon,
  Upload,
} from 'lucide-react';

interface QRFormInputsProps {
  qrType: QRType;
  setQrType: (type: QRType) => void;
  rawText: string;
  setRawText: (v: string) => void;
  wifi: WifiData;
  setWifi: React.Dispatch<React.SetStateAction<WifiData>>;
  vcard: VCardData;
  setVcard: React.Dispatch<React.SetStateAction<VCardData>>;
  whatsapp: WhatsappData;
  setWhatsapp: React.Dispatch<React.SetStateAction<WhatsappData>>;
  email: EmailData;
  setEmail: React.Dispatch<React.SetStateAction<EmailData>>;
  sms: SmsData;
  setSms: React.Dispatch<React.SetStateAction<SmsData>>;
  geo: GeoData;
  setGeo: React.Dispatch<React.SetStateAction<GeoData>>;
  social: SocialData;
  setSocial: React.Dispatch<React.SetStateAction<SocialData>>;
  crypto: CryptoData;
  setCrypto: React.Dispatch<React.SetStateAction<CryptoData>>;
}

const TYPE_BUTTONS: { type: QRType; label: string; icon: React.ReactNode }[] = [
  { type: 'url', label: 'Enlace Web / URL', icon: <Link className="w-4 h-4" /> },
  { type: 'image', label: 'Imagen / Archivo', icon: <ImageIcon className="w-4 h-4" /> },
  { type: 'wifi', label: 'Red Wi-Fi', icon: <Wifi className="w-4 h-4" /> },
  { type: 'vcard', label: 'Contacto / vCard', icon: <Contact className="w-4 h-4" /> },
  { type: 'whatsapp', label: 'WhatsApp Directo', icon: <MessageCircle className="w-4 h-4" /> },
  { type: 'email', label: 'Correo Electrónico', icon: <Mail className="w-4 h-4" /> },
  { type: 'sms', label: 'Mensaje SMS', icon: <MessageSquare className="w-4 h-4" /> },
  { type: 'geo', label: 'Ubicación GPS', icon: <MapPin className="w-4 h-4" /> },
  { type: 'social', label: 'Redes Sociales', icon: <Share2 className="w-4 h-4" /> },
  { type: 'crypto', label: 'Criptomoneda', icon: <Coins className="w-4 h-4" /> },
  { type: 'text', label: 'Texto Libre', icon: <FileText className="w-4 h-4" /> },
];

export const QRFormInputs: React.FC<QRFormInputsProps> = ({
  qrType,
  setQrType,
  rawText,
  setRawText,
  wifi,
  setWifi,
  vcard,
  setVcard,
  whatsapp,
  setWhatsapp,
  email,
  setEmail,
  sms,
  setSms,
  geo,
  setGeo,
  social,
  setSocial,
  crypto,
  setCrypto,
}) => {
  return (
    <div className="space-y-6">
      {/* Category selector */}
      <div>
        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2.5">
          Tipo de Contenido del QR
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {TYPE_BUTTONS.map((item) => (
            <button
              key={item.type}
              type="button"
              onClick={() => setQrType(item.type)}
              className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-xs font-semibold transition-all text-left ${
                qrType === item.type
                  ? 'bg-blue-600/15 border-blue-500 text-blue-300 shadow-sm'
                  : 'bg-slate-900/60 border-slate-800/80 text-slate-300 hover:bg-slate-800/80 hover:border-slate-700'
              }`}
            >
              <span className={qrType === item.type ? 'text-blue-400' : 'text-slate-400'}>
                {item.icon}
              </span>
              <span className="truncate">{item.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Dynamic input form based on type */}
      <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-4 sm:p-5 space-y-4">
        
        {/* URL Input */}
        {qrType === 'url' && (
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Dirección de Enlace (URL)
            </label>
            <input
              type="url"
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              placeholder="https://mi-negocio.com/menu"
              className="w-full px-3.5 py-2.5 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
            />
            <p className="mt-1.5 text-[11px] text-slate-500">
              Ideal para sitios web, menús digitales, promociones o enlaces a redes.
            </p>
          </div>
        )}

        {/* Image / File Link Input */}
        {qrType === 'image' && (
          <div className="space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Enlace a la Imagen o Documento en Línea
              </label>
              <input
                type="url"
                value={rawText}
                onChange={(e) => {
                  const val = e.target.value;
                  const converted = convertCloudShareLink(val);
                  setRawText(converted);
                }}
                placeholder="https://drive.google.com/file/d/... o https://i.imgur.com/..."
                className="w-full px-3.5 py-2.5 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-all font-mono"
              />
              <p className="mt-1.5 text-[11px] text-slate-400 leading-relaxed">
                💡 <span className="font-semibold text-blue-400">Conversión Automática:</span> Si pegas un enlace compartido de <strong className="text-slate-200">Google Drive</strong> o <strong className="text-slate-200">Dropbox</strong>, se optimizará automáticamente a enlace directo para que cualquier teléfono abra la imagen inmediatamente.
              </p>
            </div>

            <div className="pt-2 border-t border-slate-800/80">
              <label className="block text-xs font-semibold text-slate-300 mb-2">
                O selecciona una foto / imagen local
              </label>
              <label className="flex items-center justify-center gap-2 px-4 py-3 bg-slate-950 border border-dashed border-slate-700 hover:border-blue-500 rounded-xl text-xs font-semibold text-slate-300 hover:text-white cursor-pointer transition-all">
                <Upload className="w-4 h-4 text-blue-400" />
                <span>Seleccionar y Optimizar Imagen local</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    try {
                      const compressedDataUrl = await compressImageForQR(file);
                      setRawText(compressedDataUrl);
                    } catch (err) {
                      console.error(err);
                    }
                  }}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        )}

        {/* Text Input */}
        {qrType === 'text' && (
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Texto Plano o Notas
            </label>
            <textarea
              rows={4}
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              placeholder="Escribe aquí cualquier mensaje, código de serie, instrucción o nota..."
              className="w-full px-3.5 py-2.5 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all resize-none"
            />
          </div>
        )}

        {/* Wi-Fi Input */}
        {qrType === 'wifi' && (
          <div className="space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Nombre de la Red (SSID)
              </label>
              <input
                type="text"
                value={wifi.ssid}
                onChange={(e) => setWifi({ ...wifi, ssid: e.target.value })}
                placeholder="WiFi-Clientes_5G"
                className="w-full px-3.5 py-2.5 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Contraseña de Wi-Fi
              </label>
              <input
                type="text"
                value={wifi.password}
                onChange={(e) => setWifi({ ...wifi, password: e.target.value })}
                placeholder="ClaveSegura2026!"
                className="w-full px-3.5 py-2.5 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-all font-mono"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Cifrado / Encriptación
                </label>
                <select
                  value={wifi.encryption}
                  onChange={(e) => setWifi({ ...wifi, encryption: e.target.value as any })}
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-blue-500 transition-all"
                >
                  <option value="WPA">WPA / WPA2 / WPA3</option>
                  <option value="WEP">WEP</option>
                  <option value="nopass">Sin Contraseña (Abierta)</option>
                </select>
              </div>
              <div className="flex items-center pt-5">
                <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
                  <input
                    type="checkbox"
                    checked={wifi.hidden}
                    onChange={(e) => setWifi({ ...wifi, hidden: e.target.checked })}
                    className="w-4 h-4 rounded border-slate-700 bg-slate-950 text-blue-600 focus:ring-blue-500"
                  />
                  <span>Red Oculta</span>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* vCard Input */}
        {qrType === 'vcard' && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Nombre</label>
                <input
                  type="text"
                  value={vcard.firstName}
                  onChange={(e) => setVcard({ ...vcard, firstName: e.target.value })}
                  placeholder="Carlos"
                  className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Apellido</label>
                <input
                  type="text"
                  value={vcard.lastName}
                  onChange={(e) => setVcard({ ...vcard, lastName: e.target.value })}
                  placeholder="Mendoza"
                  className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Teléfono</label>
                <input
                  type="tel"
                  value={vcard.phone}
                  onChange={(e) => setVcard({ ...vcard, phone: e.target.value })}
                  placeholder="+52 55 1234 5678"
                  className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-blue-500 font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Correo Electrónico</label>
                <input
                  type="email"
                  value={vcard.email}
                  onChange={(e) => setVcard({ ...vcard, email: e.target.value })}
                  placeholder="carlos@empresa.com"
                  className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Empresa / Negocio</label>
                <input
                  type="text"
                  value={vcard.company}
                  onChange={(e) => setVcard({ ...vcard, company: e.target.value })}
                  placeholder="Innovación Digital S.A."
                  className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Cargo / Puesto</label>
                <input
                  type="text"
                  value={vcard.title}
                  onChange={(e) => setVcard({ ...vcard, title: e.target.value })}
                  placeholder="Director Creativo"
                  className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Sitio Web</label>
              <input
                type="url"
                value={vcard.website}
                onChange={(e) => setVcard({ ...vcard, website: e.target.value })}
                placeholder="https://carlosmendoza.com"
                className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
        )}

        {/* WhatsApp Input */}
        {qrType === 'whatsapp' && (
          <div className="space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Número con Código de País
              </label>
              <input
                type="tel"
                value={whatsapp.phone}
                onChange={(e) => setWhatsapp({ ...whatsapp, phone: e.target.value })}
                placeholder="+5491112345678"
                className="w-full px-3.5 py-2.5 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-blue-500 font-mono"
              />
              <p className="mt-1 text-[11px] text-slate-500">
                Incluye la clave internacional (ej. +52, +34, +54, +57).
              </p>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Mensaje predefinido (Opcional)
              </label>
              <textarea
                rows={3}
                value={whatsapp.message}
                onChange={(e) => setWhatsapp({ ...whatsapp, message: e.target.value })}
                placeholder="¡Hola! Quisiera solicitar más detalles sobre sus servicios."
                className="w-full px-3.5 py-2.5 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-blue-500 resize-none"
              />
            </div>
          </div>
        )}

        {/* Email Input */}
        {qrType === 'email' && (
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Destinatario</label>
              <input
                type="email"
                value={email.email}
                onChange={(e) => setEmail({ ...email, email: e.target.value })}
                placeholder="contacto@estudio.com"
                className="w-full px-3.5 py-2.5 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Asunto</label>
              <input
                type="text"
                value={email.subject}
                onChange={(e) => setEmail({ ...email, subject: e.target.value })}
                placeholder="Consulta sobre presupuestos"
                className="w-full px-3.5 py-2.5 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Cuerpo del correo</label>
              <textarea
                rows={3}
                value={email.body}
                onChange={(e) => setEmail({ ...email, body: e.target.value })}
                placeholder="Hola, me gustaría recibir más información..."
                className="w-full px-3.5 py-2.5 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-blue-500 resize-none"
              />
            </div>
          </div>
        )}

        {/* SMS Input */}
        {qrType === 'sms' && (
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Número de Teléfono</label>
              <input
                type="tel"
                value={sms.phone}
                onChange={(e) => setSms({ ...sms, phone: e.target.value })}
                placeholder="+52 55 9876 5432"
                className="w-full px-3.5 py-2.5 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-blue-500 font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Mensaje SMS</label>
              <textarea
                rows={3}
                value={sms.message}
                onChange={(e) => setSms({ ...sms, message: e.target.value })}
                placeholder="CONFIRMAR ASISTENCIA"
                className="w-full px-3.5 py-2.5 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-blue-500 resize-none"
              />
            </div>
          </div>
        )}

        {/* Geo Input */}
        {qrType === 'geo' && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Latitud</label>
                <input
                  type="text"
                  value={geo.latitude}
                  onChange={(e) => setGeo({ ...geo, latitude: e.target.value })}
                  placeholder="19.432608"
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-blue-500 font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Longitud</label>
                <input
                  type="text"
                  value={geo.longitude}
                  onChange={(e) => setGeo({ ...geo, longitude: e.target.value })}
                  placeholder="-99.133209"
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-blue-500 font-mono"
                />
              </div>
            </div>
            <p className="text-[11px] text-slate-500">
              Al escanear se abrirá automáticamente la ubicación en Maps o el navegador del teléfono.
            </p>
          </div>
        )}

        {/* Social Input */}
        {qrType === 'social' && (
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Plataforma</label>
              <select
                value={social.platform}
                onChange={(e) => setSocial({ ...social, platform: e.target.value as any })}
                className="w-full px-3.5 py-2.5 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-blue-500 capitalize"
              >
                <option value="instagram">Instagram</option>
                <option value="linkedin">LinkedIn</option>
                <option value="x">X / Twitter</option>
                <option value="youtube">YouTube</option>
                <option value="tiktok">TikTok</option>
                <option value="facebook">Facebook</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Usuario o Perfil</label>
              <input
                type="text"
                value={social.username}
                onChange={(e) => setSocial({ ...social, username: e.target.value })}
                placeholder="nombre_de_usuario"
                className="w-full px-3.5 py-2.5 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
        )}

        {/* Crypto Input */}
        {qrType === 'crypto' && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Moneda</label>
                <select
                  value={crypto.coin}
                  onChange={(e) => setCrypto({ ...crypto, coin: e.target.value as any })}
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="BTC">Bitcoin (BTC)</option>
                  <option value="ETH">Ethereum (ETH)</option>
                  <option value="USDT">Tether (USDT)</option>
                  <option value="SOL">Solana (SOL)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Monto (Opcional)</label>
                <input
                  type="text"
                  value={crypto.amount}
                  onChange={(e) => setCrypto({ ...crypto, amount: e.target.value })}
                  placeholder="0.05"
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-blue-500 font-mono"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Dirección de Billetera</label>
              <input
                type="text"
                value={crypto.address}
                onChange={(e) => setCrypto({ ...crypto, address: e.target.value })}
                placeholder="1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa"
                className="w-full px-3.5 py-2.5 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-blue-500 font-mono"
              />
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
