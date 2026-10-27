import React, { useState, useRef, useEffect } from 'react';
import jsQR from 'jsqr';
import {
  Scan,
  Camera,
  Upload,
  Copy,
  ExternalLink,
  Check,
  RefreshCw,
  AlertCircle,
  QrCode,
} from 'lucide-react';

interface QRScannerViewProps {
  showToast: (type: 'success' | 'error' | 'info', text: string) => void;
  onLoadIntoGenerator: (text: string) => void;
}

export const QRScannerView: React.FC<QRScannerViewProps> = ({
  showToast,
  onLoadIntoGenerator,
}) => {
  const [scanMode, setScanMode] = useState<'upload' | 'camera'>('upload');
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Stop camera stream when leaving mode
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const stopCamera = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
  };

  const startCamera = async () => {
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true');
        await videoRef.current.play();
        setCameraActive(true);
        requestAnimationFrame(tickCamera);
      }
    } catch (err: any) {
      console.error(err);
      setCameraError('No se pudo acceder a la cámara. Verifica los permisos de tu navegador.');
      showToast('error', 'Error al solicitar acceso a la cámara');
    }
  };

  const tickCamera = () => {
    if (!videoRef.current || videoRef.current.readyState !== videoRef.current.HAVE_ENOUGH_DATA) {
      animationFrameRef.current = requestAnimationFrame(tickCamera);
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.height = video.videoHeight;
    canvas.width = video.videoWidth;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const code = jsQR(imageData.data, imageData.width, imageData.height, {
      inversionAttempts: 'dontInvert',
    });

    if (code && code.data) {
      setScanResult(code.data);
      showToast('success', '¡Código QR detectado con éxito!');
      stopCamera();
      return;
    }

    animationFrameRef.current = requestAnimationFrame(tickCamera);
  };

  // Image Upload Scanner
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = img.width;
        canvas.height = img.height;
        ctx?.drawImage(img, 0, 0);

        const imageData = ctx?.getImageData(0, 0, canvas.width, canvas.height);
        if (imageData) {
          const code = jsQR(imageData.data, imageData.width, imageData.height);
          if (code && code.data) {
            setScanResult(code.data);
            showToast('success', '¡Código QR leído desde la imagen!');
          } else {
            showToast('error', 'No se pudo detectar ningún código QR en la imagen seleccionada.');
          }
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleCopyResult = () => {
    if (!scanResult) return;
    navigator.clipboard.writeText(scanResult);
    setCopied(true);
    showToast('success', 'Contenido copiado al portapapeles');
    setTimeout(() => setCopied(false), 2000);
  };

  const isUrl = scanResult && (scanResult.startsWith('http://') || scanResult.startsWith('https://'));

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Header */}
      <div className="pb-6 border-b border-slate-800">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-3">
          <Scan className="w-8 h-8 text-blue-500" />
          <span>Escanear y Leer Códigos QR</span>
        </h1>
        <p className="mt-1 text-sm text-slate-400">
          Usa la cámara de tu dispositivo o sube un archivo de imagen para decodificar instantáneamente cualquier código QR.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        {/* Left Side: Scanner Input Options */}
        <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-5 space-y-5">
          {/* Mode Tabs */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-slate-950/80 border border-slate-800 rounded-xl">
            <button
              onClick={() => {
                stopCamera();
                setScanMode('upload');
              }}
              className={`flex items-center justify-center gap-2 py-2 px-3 text-xs font-semibold rounded-lg transition-all ${
                scanMode === 'upload'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Upload className="w-4 h-4" />
              <span>Subir Imagen</span>
            </button>
            <button
              onClick={() => {
                setScanMode('camera');
                startCamera();
              }}
              className={`flex items-center justify-center gap-2 py-2 px-3 text-xs font-semibold rounded-lg transition-all ${
                scanMode === 'camera'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Camera className="w-4 h-4" />
              <span>Usar Cámara</span>
            </button>
          </div>

          {/* Upload Dropzone */}
          {scanMode === 'upload' && (
            <div className="space-y-4">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
              <div
                onClick={() => fileInputRef.current?.click()}
                className="py-14 px-6 border-2 border-dashed border-slate-700 hover:border-blue-500 bg-slate-950/50 hover:bg-slate-950/80 rounded-2xl flex flex-col items-center justify-center text-center cursor-pointer transition-all group"
              >
                <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 group-hover:text-blue-400 group-hover:border-blue-500/30 transition-all mb-3">
                  <Upload className="w-6 h-6" />
                </div>
                <h3 className="text-xs font-bold text-slate-200">
                  Haz clic para seleccionar o arrastra una imagen aquí
                </h3>
                <p className="text-[11px] text-slate-500 mt-1">
                  Soporta PNG, JPG, WEBP o captura de pantalla.
                </p>
              </div>
            </div>
          )}

          {/* Camera View */}
          {scanMode === 'camera' && (
            <div className="space-y-4">
              <div className="relative aspect-video rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 flex items-center justify-center">
                <video
                  ref={videoRef}
                  className={`w-full h-full object-cover ${cameraActive ? 'block' : 'hidden'}`}
                />
                <canvas ref={canvasRef} className="hidden" />

                {!cameraActive && !cameraError && (
                  <div className="text-center p-6 space-y-2">
                    <RefreshCw className="w-8 h-8 text-blue-500 animate-spin mx-auto" />
                    <p className="text-xs font-medium text-slate-400">Iniciando vista de cámara...</p>
                  </div>
                )}

                {cameraError && (
                  <div className="text-center p-6 space-y-2 text-rose-400">
                    <AlertCircle className="w-8 h-8 mx-auto" />
                    <p className="text-xs font-medium max-w-xs">{cameraError}</p>
                  </div>
                )}
              </div>

              {cameraActive && (
                <button
                  onClick={stopCamera}
                  className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold transition-all"
                >
                  Detener Cámara
                </button>
              )}
            </div>
          )}
        </div>

        {/* Right Side: Scan Results & Actions */}
        <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-5 space-y-5">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Resultado de la Lectura</span>
          </h2>

          {scanResult ? (
            <div className="space-y-5">
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4">
                <span className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2">
                  Contenido Escaneado:
                </span>
                <p className="text-xs font-mono text-white break-all leading-relaxed bg-slate-900/60 p-3 rounded-lg border border-slate-800">
                  {scanResult}
                </p>
              </div>

              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={handleCopyResult}
                    className="flex items-center justify-center gap-2 px-3 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold transition-all shadow-md shadow-blue-600/20"
                  >
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    <span>{copied ? '¡Copiado!' : 'Copiar Texto'}</span>
                  </button>

                  {isUrl && (
                    <a
                      href={scanResult}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 px-3 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold transition-all border border-slate-700"
                    >
                      <ExternalLink className="w-4 h-4 text-blue-400" />
                      <span>Abrir Enlace</span>
                    </a>
                  )}
                </div>

                <button
                  onClick={() => onLoadIntoGenerator(scanResult)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-950 border border-slate-800 hover:bg-slate-900 text-slate-300 hover:text-white rounded-xl text-xs font-semibold transition-all"
                >
                  <QrCode className="w-4 h-4 text-blue-400" />
                  <span>Cargar en el Generador para Personalizar</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-3 bg-slate-950/40 border border-dashed border-slate-800 rounded-2xl">
              <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500">
                <Scan className="w-5 h-5" />
              </div>
              <p className="text-xs text-slate-400 max-w-xs">
                Escanea un código QR usando tu cámara o sube un archivo para ver aquí su contenido.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
