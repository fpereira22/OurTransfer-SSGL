import { StorageSharedKeyCredential, generateBlobSASQueryParameters, BlobSASPermissions } from "@azure/storage-blob";

const accountName = process.env.AZURE_STORAGE_ACCOUNT_NAME;
const accountKey = process.env.AZURE_STORAGE_KEY;
const containerName = process.env.AZURE_CONTAINER_TEMP || "temporales";

export async function POST(request) {
    try {
        const { filename } = await request.json();

        if (!accountName || !accountKey) {
            console.error("Azure credentials not configured");
            return Response.json({ error: "Error de configuración en servidor" }, { status: 500 });
        }

        if (!filename) {
            return Response.json({ error: "Nombre de archivo requerido" }, { status: 400 });
        }

        const sharedKeyCredential = new StorageSharedKeyCredential(accountName, accountKey);
        const blobName = `${Date.now()}-${filename}`; // Evitar nombres duplicados

        // 1. Permiso para SUBIR (Write) - Expira en 10 mins
        const uploadSas = generateBlobSASQueryParameters({
            containerName,
            blobName,
            permissions: BlobSASPermissions.parse("cw"), // Create, Write
            startsOn: new Date(new Date().valueOf() - 5 * 60 * 1000), // -5 min para evitar error de reloj
            expiresOn: new Date(new Date().valueOf() + 10 * 60 * 1000),
        }, sharedKeyCredential).toString();

        // 2. Permiso para DESCARGAR (Read) - Expira en 24 HORAS EXACTAS
        const readSas = generateBlobSASQueryParameters({
            containerName,
            blobName,
            permissions: BlobSASPermissions.parse("r"), // Read
            startsOn: new Date(new Date().valueOf() - 5 * 60 * 1000),
            expiresOn: new Date(new Date().valueOf() + 24 * 60 * 60 * 1000),
            contentDisposition: `attachment; filename="${filename}"`
        }, sharedKeyCredential).toString();

        const baseUrl = `https://${accountName}.blob.core.windows.net/${containerName}/${blobName}`;

        return Response.json({
            uploadUrl: `${baseUrl}?${uploadSas}`,
            publicLink: `${baseUrl}?${readSas}`
        });

    } catch (error) {
        console.error("Generate SAS Error:", error);
        return Response.json({ error: error.message || "Error al generar permisos" }, { status: 500 });
    }
}
