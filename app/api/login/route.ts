import { Pool } from 'pg';
import bcrypt from 'bcryptjs';

// Configuración de conexión (Pool es mejor para manejar múltiples usuarios)
const pool = new Pool({
    host: process.env.POSTGRES_HOST,
    user: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    database: process.env.POSTGRES_DB,
    port: parseInt(process.env.POSTGRES_PORT || '5432'),
    ssl: {
        rejectUnauthorized: false // Necesario para Azure Flexible Server
    }
});

export async function POST(request: Request) {
    try {
        const { username, password } = await request.json();

        // Conexión al cliente
        const client = await pool.connect();

        try {
            // Consulta SQL adaptada a Postgres ($1 es el parámetro)
            const queryText = 'SELECT username, password, nombre, apellido_paterno FROM personas WHERE username = $1';
            const result = await client.query(queryText, [username]);

            if (result.rows.length === 0) {
                return Response.json({ error: "Usuario no encontrado." }, { status: 401 });
            }

            const user = result.rows[0];

            // Verificar contraseña (bcrypt)
            // OJO: Si en tu DB las guardas en texto plano (no recomendado), usa: user.password === password
            const isValid = await bcrypt.compare(password, user.password);

            if (!isValid) {
                return Response.json({ error: "Credenciales incorrectas." }, { status: 401 });
            }

            return Response.json({
                username: user.username,
                nombre: user.nombre,
                apellido: user.apellido_paterno
            });

        } finally {
            // ¡Muy importante! Liberar el cliente al pool
            client.release();
        }

    } catch (error) {
        console.error("Login error:", error);
        return Response.json({ error: "Error de conexión con la base de datos." }, { status: 500 });
    }
}