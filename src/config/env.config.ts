import { registerAs } from '@nestjs/config'; // Importa helper de Nest para registrar un bloque de configuración con nombre

export const envConfig = registerAs( // Crea un namespace de configuración, accesible luego como configService.get('env.*')
  'env',                              // Nombre del namespace; queda disponibles las claves como env.PORT, env.database.url, etc.
  () => {                             // Función que se ejecuta al inicializar ConfigModule; retorna el objeto con la config final
    const portRaw = process.env.PORT; // Lee PORT como string desde las variables de entorno
    const port = portRaw ? Number(portRaw) : 8080; // Convierte PORT a número; si no viene nada, usa 8080 como default

    if (!Number.isFinite(port) || port <= 0) { // Valida que el puerto sea un número válido y positivo
      throw new Error('PORT debe ser un número mayor a 0.'); // Falla el arranque si PORT no cumple la condición
    }

    const databaseUrl = process.env.DATABASE_URL; // Obtiene el string de conexión a la base de datos
    if (!databaseUrl) { // Verifica que la variable exista
      throw new Error('DATABASE_URL no está definida.'); // Evita que la app arranque sin conexión configurada
    }

    return {
      port,                      // Expone el puerto ya validado para toda la app
      database: {                // Agrupa configuración relacionada a la base de datos
        url: databaseUrl,        // Guarda el string de conexión a la base de datos
      },
    };
  },
);