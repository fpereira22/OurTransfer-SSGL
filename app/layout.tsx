import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ToastProvider } from '@/components/Toast'

const inter = Inter({
    subsets: ['latin'],
    weight: ['300', '400', '500', '600', '700', '800']
})

export const metadata: Metadata = {
    title: 'SSGL OurTransfer - Transferencia Segura de Archivos',
    description: 'Sistema de transferencia temporal y segura de archivos de SSGL - Servicios Generales Limitada',
    keywords: ['transferencia', 'archivos', 'seguro', 'SSGL', 'temporal'],
    authors: [{ name: 'SSGL' }],
    icons: {
        icon: '/logo.png',
        apple: '/logo.png',
    },
}

export const viewport: Viewport = {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="es">
            <body className={inter.className}>
                <ToastProvider>
                    {children}
                </ToastProvider>
            </body>
        </html>
    )
}
