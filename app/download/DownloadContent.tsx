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

// Utility to clean filename for display
const cleanFileName = (name: string) => {
    // Remove extension for the title
    const nameWithoutExt = name.substring(0, name.lastIndexOf('.')) || name;
    const ext = name.split('.').pop();
    // Replace underscores/hyphens with spaces and capitalize
    const cleanName = nameWithoutExt
        .replace(/[_-]/g, ' ')
        .replace(/\b\w/g, c => c.toUpperCase());

    return { name: cleanName, ext: ext ? `.${ext}` : '' };
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

    // Limpiar nombre para mostrar
    const { name: displayName, ext: displayExt } = cleanFileName(decodedName);

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
                {/* Animated Highway Background */}
                <div className="highway-background">
                    <div className="highway-sky" />
                    <div className="stars" />
                    <div className="sun-glow" />
                    <div className="clouds">
                        <div className="cloud cloud-1" />
                        <div className="cloud cloud-2" />
                        <div className="cloud cloud-3" />
                        <div className="cloud cloud-4" />
                        <div className="cloud cloud-5" />
                        <div className="cloud cloud-6" />
                    </div>
                    <div className="highway-glow" />
                    <div className="mountains">
                        <div className="mountain mountain-3" />
                        <div className="mountain mountain-2" />
                        <div className="mountain" />
                    </div>
                    <div className="trees">
                        <div className="tree tree-1" />
                        <div className="tree tree-2" />
                        <div className="tree tree-3" />
                        <div className="tree tree-4" />
                        <div className="tree tree-5" />
                        <div className="tree tree-6" />
                    </div>
                    <div className="road-container">
                        <div className="road">
                            <div className="road-lines" />
                            <div className="road-lines road-line-left" />
                            <div className="road-lines road-line-right" />
                        </div>
                    </div>
                </div>
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
                {/* Animated Highway Background */}
                <div className="highway-background">
                    <div className="highway-sky" />
                    <div className="stars" />
                    <div className="sun-glow" />
                    <div className="clouds">
                        <div className="cloud cloud-1" />
                        <div className="cloud cloud-2" />
                        <div className="cloud cloud-3" />
                        <div className="cloud cloud-4" />
                        <div className="cloud cloud-5" />
                        <div className="cloud cloud-6" />
                    </div>
                    <div className="highway-glow" />
                    <div className="mountains">
                        <div className="mountain mountain-3" />
                        <div className="mountain mountain-2" />
                        <div className="mountain" />
                    </div>
                    <div className="trees">
                        <div className="tree tree-1" />
                        <div className="tree tree-2" />
                        <div className="tree tree-3" />
                        <div className="tree tree-4" />
                        <div className="tree tree-5" />
                        <div className="tree tree-6" />
                    </div>
                    <div className="road-container">
                        <div className="road">
                            <div className="road-lines" />
                            <div className="road-lines road-line-left" />
                            <div className="road-lines road-line-right" />
                        </div>
                    </div>
                </div>

                <div className="w-full max-w-[440px] relative z-10 px-4">
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
            {/* Animated Highway Background */}
            <div className="highway-background">
                <div className="highway-sky" />
                <div className="stars" />
                <div className="sun-glow" />
                <div className="clouds">
                    <div className="cloud cloud-1" />
                    <div className="cloud cloud-2" />
                    <div className="cloud cloud-3" />
                    <div className="cloud cloud-4" />
                    <div className="cloud cloud-5" />
                    <div className="cloud cloud-6" />
                </div>
                <div className="highway-glow" />
                <div className="mountains">
                    <div className="mountain mountain-3" />
                    <div className="mountain mountain-2" />
                    <div className="mountain" />
                </div>
                <div className="trees">
                    <div className="tree tree-1" />
                    <div className="tree tree-2" />
                    <div className="tree tree-3" />
                    <div className="tree tree-4" />
                    <div className="tree tree-5" />
                    <div className="tree tree-6" />
                </div>
                <div className="road-container">
                    <div className="road">
                        <div className="road-lines" />
                        <div className="road-lines road-line-left" />
                        <div className="road-lines road-line-right" />
                    </div>
                </div>
            </div>

            <div className="w-full max-w-[440px] relative z-10 px-4">
                {/* Logo Header */}
                <div className="text-center mb-10">
                    <div className="inline-block relative group mb-2">
                        <div className="absolute inset-0 bg-[#0A9345]/50 blur-3xl rounded-full opacity-60 group-hover:opacity-80 transition-opacity" />
                        <div className="w-20 h-20 mx-auto relative drop-shadow-[0_0_15px_rgba(10,147,69,0.5)] transform hover:scale-105 transition-transform duration-500">
                            <Image
                                src="/logo.png"
                                alt="SSGL"
                                fill
                                className="object-contain"
                            />
                        </div>
                    </div>
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                            SSGL <span className="text-[#0FBE5A]">OurTransfer</span>
                        </h1>
                        <p className="text-white/60 text-sm mt-1">Sistema de transferencia segura</p>
                    </div>
                </div>

                {/* Card Principal */}
                <div className="relative group">
                    <div className="absolute -inset-1 bg-gradient-to-r from-[#0A9345]/40 via-[#0FBE5A]/20 to-[#0A9345]/40 rounded-3xl blur-xl opacity-40 group-hover:opacity-60 transition-opacity" />

                    <div className="login-glass-card p-0 overflow-hidden shadow-[0_40px_80px_-20px_rgba(0,0,0,0.6)]">
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
                        <div className="p-8 space-y-8">
                            {/* File Info */}
                            <div className="text-center">
                                <h2 className="text-2xl font-bold text-white mb-2 leading-tight">
                                    {displayName}<span className="text-white/40">{displayExt}</span>
                                </h2>
                                <div className="inline-flex items-center justify-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10">
                                    <div className="w-1.5 h-1.5 rounded-full bg-[#0FBE5A] animate-pulse" />
                                    <span className="text-xs font-medium text-white/70">Listo para descargar</span>
                                </div>
                            </div>

                            {/* Actions Group */}
                            <div className="space-y-4">
                                {/* Download Button */}
                                <button
                                    onClick={handleDownload}
                                    disabled={downloading}
                                    className="glass-button w-full h-14 flex items-center justify-center gap-3 text-base font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:brightness-110 active:scale-[0.98] transition-all shadow-xl shadow-[#0A9345]/20 group"
                                >
                                    {downloading ? (
                                        <>
                                            <Loader2 size={24} className="animate-spin" />
                                            Descargando...
                                        </>
                                    ) : (
                                        <>
                                            <div className="bg-white/20 p-1.5 rounded-lg group-hover:scale-110 transition-transform">
                                                <Download size={20} className="text-[#063d1a]" />
                                            </div>
                                            Descargar
                                        </>
                                    )}
                                </button>

                                {/* Open in new tab - High Visibility Modern Button */}
                                <a
                                    href={decodedUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{ textDecoration: 'none' }}
                                    className="w-full h-14 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold transition-all flex items-center justify-center gap-2 border border-white/20 hover:border-white/30 group backdrop-blur-md shadow-lg"
                                >
                                    <ExternalLink size={20} className="text-[#0FBE5A] group-hover:scale-110 transition-transform" />
                                    Vista previa
                                </a>
                            </div>

                            {/* Security Info */}
                            <div className="pt-6 border-t border-white/10">
                                <div className="flex items-center justify-center gap-6 text-[10px] font-medium text-white/40 uppercase tracking-widest">
                                    <span className="flex items-center gap-2 hover:text-[#0FBE5A] transition-colors">
                                        <Shield size={12} />
                                        Seguro
                                    </span>
                                    <span className="w-1 h-1 rounded-full bg-white/20" />
                                    <span className="flex items-center gap-2 hover:text-[#0FBE5A] transition-colors">
                                        <Clock size={12} />
                                        24 Horas
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
