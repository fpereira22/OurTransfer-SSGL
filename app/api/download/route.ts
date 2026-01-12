import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const url = searchParams.get('url');
    const filename = searchParams.get('filename');

    if (!url) {
        return NextResponse.json({ error: 'URL requerida' }, { status: 400 });
    }

    try {
        const decodedUrl = decodeURIComponent(url);

        // Verificar que sea una URL válida de Azure
        if (!decodedUrl.includes('blob.core.windows.net')) {
            return NextResponse.json({ error: 'URL no válida' }, { status: 400 });
        }

        // Fetch del archivo desde Azure
        const response = await fetch(decodedUrl);

        if (!response.ok) {
            return NextResponse.json(
                { error: 'Archivo no disponible o expirado' },
                { status: response.status }
            );
        }

        // Obtener el blob
        const blob = await response.blob();

        // Headers para descarga
        const headers = new Headers();
        headers.set('Content-Type', response.headers.get('Content-Type') || 'application/octet-stream');
        headers.set('Content-Disposition', `attachment; filename="${filename || 'archivo'}"`);
        headers.set('Content-Length', blob.size.toString());

        return new NextResponse(blob, {
            status: 200,
            headers
        });
    } catch (error) {
        console.error('Download proxy error:', error);
        return NextResponse.json(
            { error: 'Error al procesar la descarga' },
            { status: 500 }
        );
    }
}
