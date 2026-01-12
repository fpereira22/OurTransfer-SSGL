'use client';

import { Suspense } from 'react';
import DownloadContent from './DownloadContent';

export default function DownloadPage() {
    return (
        <Suspense fallback={
            <main className="min-h-screen flex items-center justify-center">
                <div className="text-white text-center">
                    <div className="w-16 h-16 border-4 border-[#0A9345] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p>Cargando...</p>
                </div>
            </main>
        }>
            <DownloadContent />
        </Suspense>
    );
}
