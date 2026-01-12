'use client';

import React, { useState, FormEvent, ChangeEvent, DragEvent, useRef } from 'react';
import {
    UploadCloud, CheckCircle, Copy, LogOut, FileUp, Loader2, X,
    Shield, Clock, Link2, Sparkles, Check, Zap, Globe, Lock
} from 'lucide-react';
import Image from 'next/image';
import { useToast } from '@/components/Toast';

// --- TIPOS ---
interface User {
    username: string;
    nombre: string;
    apellido?: string;
}

interface SasResponse {
    uploadUrl: string;
    publicLink: string;
}

// --- COMPONENTE DE PARTÍCULAS MEJORADO ---
const Particles = () => {
    const particles = Array.from({ length: 30 }, (_, i) => ({
        id: i,
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        delay: `${Math.random() * 8}s`,
        duration: 4 + Math.random() * 6,
        size: 3 + Math.random() * 6,
        opacity: 0.1 + Math.random() * 0.3,
    }));

    return (
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
            {/* Gradient Orbs */}
            <div className="absolute top-1/4 -left-1/4 w-96 h-96 bg-[#0A9345]/20 rounded-full blur-[120px] animate-pulse" />
            <div className="absolute bottom-1/4 -right-1/4 w-96 h-96 bg-[#0FBE5A]/15 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }} />
            <div className="absolute top-3/4 left-1/2 w-64 h-64 bg-emerald-500/10 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '2s' }} />

            {/* Floating Particles */}
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

            {/* Grid Pattern */}
            <div
                className="absolute inset-0 opacity-[0.02]"
                style={{
                    backgroundImage: `
                        linear-gradient(rgba(10, 147, 69, 0.5) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(10, 147, 69, 0.5) 1px, transparent 1px)
                    `,
                    backgroundSize: '60px 60px',
                }}
            />
        </div>
    );
};

// --- COMPONENTE PRINCIPAL ---
export default function Home() {
    const toast = useToast();
    const [user, setUser] = useState<User | null>(null);
    const [creds, setCreds] = useState({ username: '', password: '' });
    const [file, setFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [statusMsg, setStatusMsg] = useState('');
    const [uploadProgress, setUploadProgress] = useState(0);
    const [generatedLink, setGeneratedLink] = useState('');
    const [isDragging, setIsDragging] = useState(false);
    const [copied, setCopied] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // --- LOGIN ---
    const handleLogin = async (e: FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch('/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(creds),
            });

            const data = await res.json();
            if (res.ok) {
                setUser(data as User);
                toast.success('¡Bienvenido!', `Hola ${data.nombre}, sesión iniciada correctamente`);
            } else {
                toast.error('Error de autenticación', data.error || 'Credenciales incorrectas');
            }
        } catch {
            toast.error('Error de conexión', 'No se pudo conectar con el servidor');
        } finally {
            setLoading(false);
        }
    };

    // --- UPLOAD ---
    const handleUpload = async () => {
        if (!file) return;
        setLoading(true);
        setStatusMsg('Preparando archivo...');
        setUploadProgress(0);

        try {
            const sasRes = await fetch('/api/generate-sas', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ filename: file.name })
            });

            if (!sasRes.ok) throw new Error('Error al generar permisos');

            const { uploadUrl, publicLink } = (await sasRes.json()) as SasResponse;

            setStatusMsg('Subiendo a la nube...');

            await new Promise((resolve, reject) => {
                const xhr = new XMLHttpRequest();
                xhr.open('PUT', uploadUrl, true);
                xhr.setRequestHeader('x-ms-blob-type', 'BlockBlob');
                xhr.setRequestHeader('Content-Type', file.type || 'application/octet-stream');

                xhr.upload.onprogress = (e) => {
                    if (e.lengthComputable) {
                        const percentComplete = Math.round((e.loaded / e.total) * 100);
                        setUploadProgress(percentComplete);
                    }
                };

                xhr.onload = () => {
                    if (xhr.status >= 200 && xhr.status < 300) {
                        resolve(xhr.response);
                    } else {
                        reject(new Error('Error en la subida'));
                    }
                };

                xhr.onerror = () => reject(new Error('Error de red al subir'));
                xhr.send(file);
            });

            const encodedUrl = encodeURIComponent(publicLink);
            const encodedName = encodeURIComponent(file.name);
            setGeneratedLink(`${window.location.origin}/download?url=${encodedUrl}&name=${encodedName}`);
            setStatusMsg('');
            setFile(null);
            setUploadProgress(0);
            toast.success('¡Archivo subido!', 'Tu enlace está listo para compartir');
        } catch (error: any) {
            toast.error('Error', error.message || 'No se pudo subir el archivo');
            setStatusMsg('');
            setUploadProgress(0);
        } finally {
            setLoading(false);
        }
    };

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) {
            setFile(e.target.files[0]);
            toast.info('Archivo seleccionado', e.target.files[0].name);
        }
    };

    const handleDragEnter = (e: DragEvent) => { e.preventDefault(); setIsDragging(true); };
    const handleDragLeave = (e: DragEvent) => { e.preventDefault(); setIsDragging(false); };
    const handleDragOver = (e: DragEvent) => { e.preventDefault(); };
    const handleDrop = (e: DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files?.[0]) {
            setFile(e.dataTransfer.files[0]);
            toast.info('Archivo seleccionado', e.dataTransfer.files[0].name);
        }
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(generatedLink);
        setCopied(true);
        toast.success('¡Copiado!', 'El enlace se copió al portapapeles');
        setTimeout(() => setCopied(false), 2000);
    };

    const formatFileSize = (bytes: number) => {
        if (bytes >= 1073741824) return (bytes / 1073741824).toFixed(2) + ' GB';
        if (bytes >= 1048576) return (bytes / 1048576).toFixed(2) + ' MB';
        if (bytes >= 1024) return (bytes / 1024).toFixed(2) + ' KB';
        return bytes + ' bytes';
    };

    // --- VISTA LOGIN ---
    if (!user) {
        return (
            <main className="min-h-screen flex items-center justify-center p-4 sm:p-6 lg:p-8 relative overflow-hidden">
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

                {/* Login Card */}
                <div className="w-full max-w-[420px] relative z-10 mx-4">
                    <div className="login-glass-card p-8 sm:p-10">
                        {/* Logo */}
                        <div className="flex justify-center mb-6">
                            <div className="relative">
                                <div className="absolute inset-0 bg-[#0A9345]/40 rounded-full blur-2xl scale-150" />
                                <Image
                                    src="/logo.png"
                                    alt="SSGL Logo"
                                    width={80}
                                    height={80}
                                    className="relative drop-shadow-[0_0_20px_rgba(10,147,69,0.6)]"
                                    priority
                                />
                            </div>
                        </div>

                        {/* Title */}
                        <h1 className="text-center text-2xl sm:text-3xl font-bold text-white mb-2">
                            SSGL <span className="text-[#0FBE5A]">OurTransfer</span>
                        </h1>
                        <p className="text-center text-white/60 text-sm mb-8">
                            Sistema de transferencia segura
                        </p>

                        {/* Form */}
                        <form onSubmit={handleLogin} className="space-y-6">
                            {/* Username */}
                            <div className="relative">
                                <input
                                    type="text"
                                    required
                                    autoComplete="off"
                                    className="glass-input"
                                    placeholder="Usuario"
                                    value={creds.username}
                                    onChange={(e) => setCreds({ ...creds, username: e.target.value })}
                                />
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                        <circle cx="12" cy="7" r="4" />
                                    </svg>
                                </div>
                            </div>

                            {/* Password */}
                            <div className="relative">
                                <input
                                    type="password"
                                    required
                                    autoComplete="off"
                                    className="glass-input"
                                    placeholder="Contraseña"
                                    value={creds.password}
                                    onChange={(e) => setCreds({ ...creds, password: e.target.value })}
                                />
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50">
                                    <Lock size={20} />
                                </div>
                            </div>

                            {/* Features row */}
                            <div className="flex justify-between items-center text-xs text-white/60 py-2">
                                <label className="flex items-center gap-2 cursor-pointer hover:text-white/80 transition-colors">
                                    <input type="checkbox" className="w-3 h-3 accent-[#0A9345]" />
                                    <span>Recordarme</span>
                                </label>
                                <div className="flex items-center gap-4">
                                    <span className="flex items-center gap-1">
                                        <Shield size={12} className="text-[#0FBE5A]" />
                                        Encriptado
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <Clock size={12} className="text-[#0FBE5A]" />
                                        24h
                                    </span>
                                </div>
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={loading}
                                className="glass-button flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <Loader2 className="animate-spin" size={20} />
                                ) : (
                                    <>
                                        Ingresar
                                        <Sparkles size={16} />
                                    </>
                                )}
                            </button>
                        </form>

                        {/* Footer */}
                        <p className="text-center text-white/40 text-xs mt-8">
                            © 2025 SSGL - Servicios Generales Limitada
                        </p>
                    </div>
                </div>
            </main>
        );
    }

    // --- VISTA PANEL ---
    return (
        <main className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
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

            <div className="w-full max-w-[420px] relative z-10 mx-4 flex flex-col items-center">
                {/* Logo & Greeting (Centered Above Card) */}
                <div className="text-center mb-8 animate-fade-in-up">
                    <div className="relative inline-block mb-4">
                        <div className="absolute inset-0 bg-[#0A9345]/40 rounded-full blur-2xl scale-125" />
                        <Image
                            src="/logo.png"
                            alt="SSGL"
                            width={72}
                            height={72}
                            className="relative drop-shadow-[0_0_20px_rgba(10,147,69,0.5)]"
                        />
                    </div>

                    <div className="flex items-center justify-center gap-3">
                        <h1 className="text-2xl font-bold text-white">
                            Hola, <span className="text-[#0FBE5A]">{user.nombre}  </span>
                        </h1>
                        {/* Integrated Logout Button */}
                        <button
                            onClick={() => {
                                setUser(null);
                                setGeneratedLink('');
                                toast.info('Sesión cerrada', 'Has cerrado sesión correctamente');
                            }}
                            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 active:bg-white/20 transition-all border border-white/5 hover:border-white/20 group"
                            title="Cerrar Sesión"
                        >
                            <LogOut size={20} className="text-[#0FBE5A] group-hover:scale-110 transition-transform" />
                        </button>
                    </div>
                </div>

                {/* Main Glass Card */}
                <div className="w-full login-glass-card p-6 sm:p-8 relative overflow-hidden shadow-[0_40px_80px_-20px_rgba(0,0,0,0.6)]">
                    {generatedLink ? (
                        /* Vista de Éxito Compacta */
                        <div className="relative text-center animate-fade-in-up">
                            <div className="inline-flex items-center justify-center p-3 rounded-full bg-[#0A9345]/10 text-[#0FBE5A] mb-4 ring-1 ring-[#0A9345]/30">
                                <CheckCircle size={32} />
                            </div>

                            <h2 className="text-xl font-bold text-white mb-1">
                                ¡Listo para compartir!
                            </h2>
                            <p className="text-white/50 text-xs mb-6 font-medium">
                                El enlace expira en 24 horas
                            </p>

                            {/* Link Box */}
                            <div className="bg-[#0d1117]/60 rounded-xl p-4 border border-white/10 mb-6 text-left relative overflow-hidden group">
                                <div className="absolute top-0 left-0 w-1 h-full bg-[#0FBE5A]" />
                                <div className="flex items-center gap-2 mb-2">
                                    <Link2 size={14} className="text-[#0FBE5A]" />
                                    <span className="text-[10px] uppercase font-bold text-white/40 tracking-wider">Enlace Seguro</span>
                                </div>

                                <div className="flex gap-2">
                                    <input
                                        readOnly
                                        value={generatedLink}
                                        className="flex-1 bg-transparent text-gray-300 text-xs font-mono outline-none truncate"
                                        onClick={(e) => e.currentTarget.select()}
                                    />
                                    <button
                                        onClick={copyToClipboard}
                                        className={`p-1.5 rounded-lg transition-colors ${copied ? 'text-[#0FBE5A] bg-[#0FBE5A]/10' : 'text-white/50 hover:text-white hover:bg-white/10'}`}
                                        title="Copiar"
                                    >
                                        {copied ? <Check size={16} /> : <Copy size={16} />}
                                    </button>
                                </div>
                            </div>

                            <button
                                onClick={() => { setGeneratedLink(''); setFile(null); }}
                                className="w-full py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white/80 hover:text-white transition-all text-sm font-medium flex items-center justify-center gap-2 border border-white/5 hover:border-white/10"
                            >
                                <UploadCloud size={16} />
                                Subir otro archivo
                            </button>
                        </div>
                    ) : (
                        /* Vista de Upload Compacta */
                        <div className="relative space-y-6">
                            <input
                                ref={fileInputRef}
                                type="file"
                                className="hidden"
                                onChange={handleFileChange}
                            />

                            <div
                                onClick={() => fileInputRef.current?.click()}
                                onDragEnter={handleDragEnter}
                                onDragLeave={handleDragLeave}
                                onDragOver={handleDragOver}
                                onDrop={handleDrop}
                                className={`
                                    relative rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-300 border border-dashed
                                    group min-h-[220px]
                                    ${isDragging
                                        ? 'border-[#0FBE5A] bg-[#0A9345]/10 scale-[1.02]'
                                        : file
                                            ? 'border-[#0A9345]/50 bg-[#0A9345]/5'
                                            : 'border-white/20 hover:border-white/40 bg-white/[0.02] hover:bg-white/[0.05]'
                                    }
                                `}
                            >
                                <div className={`
                                    w-14 h-14 rounded-full flex items-center justify-center mb-4 transition-all duration-500
                                    ${file || isDragging
                                        ? 'bg-[#0A9345] text-white shadow-lg shadow-[#0A9345]/30'
                                        : 'bg-white/5 text-white/40 group-hover:bg-white/10 group-hover:text-white'
                                    }
                                `}>
                                    <FileUp size={24} />
                                </div>

                                {file ? (
                                    <div className="w-full">
                                        <p className="text-white font-medium text-sm mb-1 truncate px-2">
                                            {file.name}
                                        </p>
                                        <p className="text-[#0FBE5A] text-xs mb-3">
                                            {formatFileSize(file.size)}
                                        </p>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setFile(null);
                                                if (fileInputRef.current) fileInputRef.current.value = '';
                                            }}
                                            className="text-[10px] text-red-400 hover:text-red-300 hover:underline"
                                        >
                                            Quitar archivo
                                        </button>
                                    </div>
                                ) : (
                                    <div>
                                        <p className="text-white font-medium text-base mb-1">
                                            Sube tu archivo
                                        </p>
                                        <p className="text-white/40 text-xs">
                                            Arrastra o haz clic
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Status Bar */}
                            {statusMsg && (
                                <div className="space-y-1.5 animate-fade-in-up">
                                    <div className="flex items-center justify-between text-[10px] font-medium text-white/70">
                                        <span className="flex items-center gap-1.5 text-[#0FBE5A]">
                                            <Loader2 size={10} className="animate-spin" />
                                            {statusMsg}
                                        </span>
                                        <span>{uploadProgress}%</span>
                                    </div>
                                    <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-[#0FBE5A] transition-all duration-300 rounded-full"
                                            style={{ width: `${uploadProgress}%` }}
                                        />
                                    </div>
                                </div>
                            )}

                            <button
                                onClick={handleUpload}
                                disabled={!file || loading}
                                className="glass-button w-full h-12 flex items-center justify-center gap-2 text-sm font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:brightness-110 active:scale-[0.98] transition-all"
                            >
                                {loading ? (
                                    <Loader2 className="animate-spin" size={18} />
                                ) : (
                                    <>
                                        Generar Link
                                        <Sparkles size={16} />
                                    </>
                                )}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
}