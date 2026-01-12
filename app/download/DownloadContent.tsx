'use client';

import { useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import {
    Download, FileText, FileImage, FileVideo, FileAudio,
    File, Clock, Shield, AlertTriangle, CheckCircle2,
    ExternalLink, Loader2, Home, Sparkles
} from 'lucide-react';
import { useToast } from '@/components/Toast';

// Tipos de archivo
const getFileType = (filename: string): 'image' | 'video' | 'audio' | 'document' | 'other' => {
    const ext = filename.split('.').pop()?.toLowerCase() || '';

    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg'].includes(ext)) return 'image';
    if (['mp4', 'webm', 'mov', 'avi', 'mkv'].includes(ext)) return 'video';
    if (['mp3', 'wav', 'ogg', 'flac', 'aac'].includes(ext)) return 'audio';
    if (['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt'].includes(ext)) return 'document';
    return 'other';
};

const getFileIcon = (type: string) => {
    switch (type) {
        case 'image': return FileImage;
        case 'video': return FileVideo;
        case 'audio': return FileAudio;
        case 'document': return FileText;
        default: return File;
    }
};

// Partículas
const Particles = () => {
    const particles = Array.from({ length: 20 }, (_, i) => ({
        id: i,
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        delay: `${Math.random() * 5}s`,
        duration: 4 + Math.random() * 4,
        size: 3 + Math.random() * 5,
        opacity: 0.1 + Math.random() * 0.2,
    }));

    return (
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
            <div className="absolute top-1/4 -left-1/4 w-96 h-96 bg-[#0A9345]/20 rounded-full blur-[120px] animate-pulse" />
            <div className="absolute bottom-1/4 -right-1/4 w-96 h-96 bg-[#0FBE5A]/15 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }} />
            {particles.map(p => (
                <div
                    key={p.id}
                    className="absolute rounded-full bg-[#0A9345]"
                    style={{
                        left: p.left,
                        top: p.top,
                        width: p.size,
                        height: p.size,
                        opacity: p.opacity,
                        animation: `float ${p.duration}s ease-in-out infinite`,
                        animationDelay: p.delay,
                    }}
                />
            ))}
        </div>
    );
};

export default function DownloadContent() {
    const searchParams = useSearchParams();
    const toast = useToast();
    const [isValid, setIsValid] = useState(true);
    const [isLoading, setIsLoading] = useState(true);
    const [downloading, setDownloading] = useState(false);
    const [imageError, setImageError] = useState(false);

    const fileUrl = searchParams.get('url') || '';
    const fileName = searchParams.get('name') || 'archivo';

    // No decodificar de nuevo, searchParams.get() ya nos da el valor original
    // y si decodificamos el SAS token (%2B -> +) se rompe la firma
    const decodedUrl = fileUrl;
    const decodedName = fileName;

    const fileType = getFileType(decodedName);
    const FileIcon = getFileIcon(fileType);
    const isImage = fileType === 'image' && !imageError;
    const isVideo = fileType === 'video';
    const isAudio = fileType === 'audio';

    useEffect(() => {
        if (!fileUrl || !decodedUrl.includes('blob.core.windows.net')) {
            setIsValid(false);
        }
        setIsLoading(false);
    }, [fileUrl, decodedUrl]);

    const handleDownload = async () => {
        setDownloading(true);
        try {
            // Usar proxy API para evitar CORS
            const proxyUrl = `/api/download?url=${encodeURIComponent(decodedUrl)}&filename=${encodeURIComponent(decodedName)}`;
            const response = await fetch(proxyUrl);

            if (!response.ok) {
                const error = await response.json().catch(() => ({ error: 'Error desconocido' }));
                throw new Error(error.error || 'Archivo no disponible');
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = decodedName;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);

            toast.success('¡Descarga iniciada!', decodedName);
        } catch (error: any) {
            toast.error('Error de descarga', error.message || 'El archivo puede haber expirado');
        } finally {
            setDownloading(false);
        }
    };

    if (isLoading) {
        return (
            <main className="min-h-screen flex items-center justify-center p-4">
                <Particles />
                <div className="text-center relative z-10">
                    <div className="w-16 h-16 border-4 border-[#0A9345] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-400">Cargando archivo...</p>
                </div>
            </main>
        );
    }

    if (!isValid) {
        return (
            <main className="min-h-screen flex items-center justify-center p-4 sm:p-6 relative overflow-hidden">
                <Particles />

                <div className="w-full max-w-md relative z-10">
                    <div className="relative group">
                        <div className="absolute -inset-1 bg-gradient-to-r from-red-500/30 to-orange-500/30 rounded-3xl blur-xl opacity-50" />

                        <div className="relative backdrop-blur-2xl bg-gradient-to-b from-white/10 to-white/5 rounded-3xl border border-white/10 p-8 sm:p-10 text-center">
                            <div className="w-20 h-20 bg-gradient-to-br from-red-500/30 to-red-600/20 rounded-full flex items-center justify-center mx-auto mb-6">
                                <AlertTriangle size={40} className="text-red-400" />
                            </div>
                            <h1 className="text-2xl font-bold text-white mb-3">Enlace no válido</h1>
                            <p className="text-gray-400 mb-8 text-sm sm:text-base">
                                Este enlace ha expirado o no es válido. Los archivos se eliminan automáticamente después de 24 horas.
                            </p>
                            <a
                                href="/"
                                className="inline-flex items-center gap-2 bg-gradient-to-r from-[#0A9345] to-[#0FBE5A] text-white font-semibold px-6 py-3 rounded-xl transition-all hover:shadow-lg hover:shadow-[#0A9345]/30 hover:scale-105"
                            >
                                <Home size={18} />
                                Ir al inicio
                            </a>
                        </div>
                    </div>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen p-4 sm:p-6 lg:p-8 relative flex items-center justify-center overflow-hidden">
            <Particles />

            <div className="w-full max-w-2xl relative z-10">
                {/* Logo Header */}
                <div className="text-center mb-6 sm:mb-8">
                    <div className="inline-block relative">
                        <div className="absolute inset-0 bg-[#0A9345]/30 blur-2xl rounded-full" />
                        <div className="w-14 h-14 sm:w-16 sm:h-16 mx-auto relative">
                            <Image
                                src="/logo.png"
                                alt="SSGL"
                                fill
                                className="object-contain"
                            />
                        </div>
                    </div>
                    <h1 className="text-xl sm:text-2xl font-bold text-white mt-4">
                        SSGL <span className="bg-gradient-to-r from-[#0FBE5A] to-[#0A9345] bg-clip-text text-transparent">Transfer</span>
                    </h1>
                </div>

                {/* Card Principal */}
                <div className="relative group">
                    <div className="absolute -inset-1 bg-gradient-to-r from-[#0A9345]/40 via-[#0FBE5A]/20 to-[#0A9345]/40 rounded-3xl blur-xl opacity-40 group-hover:opacity-60 transition-opacity" />

                    <div className="relative backdrop-blur-2xl bg-gradient-to-b from-white/10 to-white/5 rounded-3xl border border-white/10 overflow-hidden shadow-2xl">
                        {/* Preview Section */}
                        {isImage && (
                            <div className="relative bg-black/40 p-4 sm:p-6 flex items-center justify-center min-h-[200px] sm:min-h-[300px] max-h-[500px]">
                                <img
                                    src={decodedUrl}
                                    alt={decodedName}
                                    className="max-w-full max-h-[450px] object-contain rounded-xl shadow-2xl"
                                    onError={() => setImageError(true)}
                                />
                            </div>
                        )}

                        {isVideo && (
                            <div className="relative bg-black/50 p-4 sm:p-6">
                                <video
                                    src={decodedUrl}
                                    controls
                                    className="w-full max-h-[400px] rounded-xl"
                                >
                                    Tu navegador no soporta video.
                                </video>
                            </div>
                        )}

                        {isAudio && (
                            <div className="bg-gradient-to-br from-[#0A9345]/20 to-[#0FBE5A]/10 p-8 sm:p-12 text-center">
                                <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-[#0A9345] to-[#0FBE5A] rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-[#0A9345]/50">
                                    <FileAudio size={40} className="text-white" />
                                </div>
                                <audio src={decodedUrl} controls className="w-full max-w-md mx-auto">
                                    Tu navegador no soporta audio.
                                </audio>
                            </div>
                        )}

                        {(!isImage && !isVideo && !isAudio) && (
                            <div className="bg-gradient-to-br from-white/5 to-transparent p-10 sm:p-16 text-center">
                                <div className="relative inline-block">
                                    <div className="absolute inset-0 bg-[#0A9345] blur-2xl opacity-40 rounded-full" />
                                    <div className="relative w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-[#0A9345] to-[#0FBE5A] rounded-2xl flex items-center justify-center mx-auto shadow-xl shadow-[#0A9345]/50 animate-float">
                                        <FileIcon size={40} className="text-white" />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Info Section */}
                        <div className="p-6 sm:p-8">
                            {/* File Info */}
                            <div className="text-center mb-6">
                                <h2 className="text-lg sm:text-xl font-bold text-white mb-2 break-all px-4">
                                    {decodedName}
                                </h2>
                                <div className="flex items-center justify-center gap-2 text-sm text-gray-400">
                                    <CheckCircle2 size={16} className="text-[#0FBE5A]" />
                                    <span>Archivo disponible para descarga</span>
                                </div>
                            </div>

                            {/* Download Button */}
                            <button
                                onClick={handleDownload}
                                disabled={downloading}
                                className="w-full relative overflow-hidden bg-gradient-to-r from-[#0A9345] to-[#0FBE5A] text-white font-bold py-4 sm:py-5 rounded-2xl transition-all duration-300 disabled:opacity-60 enabled:hover:shadow-lg enabled:hover:shadow-[#0A9345]/40 enabled:hover:scale-[1.02] group mb-4"
                            >
                                <span className="relative z-10 flex items-center justify-center gap-3 text-base sm:text-lg">
                                    {downloading ? (
                                        <>
                                            <Loader2 size={24} className="animate-spin" />
                                            Descargando...
                                        </>
                                    ) : (
                                        <>
                                            <Download size={24} />
                                            Descargar Archivo
                                            <Sparkles size={18} className="opacity-70" />
                                        </>
                                    )}
                                </span>
                                <div className="absolute inset-0 bg-gradient-to-r from-[#0FBE5A] to-[#0A9345] opacity-0 group-hover:opacity-100 transition-opacity" />
                            </button>

                            {/* Open in new tab */}
                            <a
                                href={decodedUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full flex items-center justify-center gap-2 text-gray-400 hover:text-white transition-colors py-3 rounded-xl hover:bg-white/5"
                            >
                                <ExternalLink size={16} />
                                Abrir en nueva pestaña
                            </a>

                            {/* Security Info */}
                            <div className="mt-6 pt-6 border-t border-white/10">
                                <div className="flex items-center justify-center gap-6 text-xs text-gray-500">
                                    <span className="flex items-center gap-1.5">
                                        <Shield size={14} className="text-[#0A9345]" />
                                        Transferencia segura
                                    </span>
                                    <span className="flex items-center gap-1.5">
                                        <Clock size={14} className="text-[#0A9345]" />
                                        Auto-elimina en 24h
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <footer className="mt-8 text-center text-gray-500 text-xs">
                    <p>© 2025 SSGL - Servicios Generales Limitada</p>
                </footer>
            </div>
        </main>
    );
}
