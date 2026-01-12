import { StorageSharedKeyCredential, generateBlobSASQueryParameters, BlobSASPermissions } from "@azure/storage-blob";

const accountName = process.env.AZURE_STORAGE_ACCOUNT_NAME;
const accountKey = process.env.AZURE_STORAGE_KEY;
const containerName = "temporales"; // El contenedor que creamos

export async function POST(request) {
    try {
        const { filename } = await request.json();

        if (!accountName || !accountKey) {
            return Response.json({ error: "Error de configuración en servidor" }, { status: 500 });
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
        }, sharedKeyCredential).toString();

        // Codificar el nombre del blob en la URL para manejar espacios y caracteres especiales
        const baseUrl = `https://${accountName}.blob.core.windows.net/${containerName}/${encodeURIComponent(blobName)}`;

        return Response.json({
            uploadUrl: `${baseUrl}?${uploadSas}`,
            publicLink: `${baseUrl}?${readSas}`
        });

    } catch (error) {
        console.error(error);
        return Response.json({ error: error.message }, { status: 500 });
    }
}