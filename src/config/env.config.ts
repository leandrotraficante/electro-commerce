import { registerAs } from '@nestjs/config'; // Importa helper de Nest para registrar un bloque de configuración con nombre

export const envConfig = registerAs( // Crea un namespace de configuración, accesible luego como configService.get('env.*')
  'env',                              // Nombre del namespace; queda disponibles las claves como env.PORT, env.jwt.secret, etc.
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

    const jwtSecret = process.env.JWT_SECRET; // Toma el secreto de JWT desde el entorno
    if (!jwtSecret) { // Si no existe, es un error crítico
      throw new Error('JWT_SECRET no está definido.'); // Forza a configurar el secreto antes de iniciar la app
    }

    const jwtExpiresInRaw = process.env.JWT_EXPIRES_IN; // Captura la expiración del token como string (segundos)
    const jwtExpiresIn = jwtExpiresInRaw
      ? Number(jwtExpiresInRaw)                           // Si viene, lo convierte a número
      : 24 * 60 * 60;                                     // Si no viene, usa 24 horas como fallback

    if (!Number.isFinite(jwtExpiresIn) || jwtExpiresIn <= 0) { // Valida que el tiempo sea un número positivo
      throw new Error('JWT_EXPIRES_IN debe ser un número mayor a 0 (en segundos).'); // Evita expiraciones inválidas
    }

    return {
      port,                      // Expone el puerto ya validado para toda la app
      database: {                // Agrupa configuración relacionada a la base de datos
        url: databaseUrl,        // Guarda el string de conexión a la base de datos
      },
      jwt: {                     // Agrupa todo lo necesario para JWT
        secret: jwtSecret,       // Envía el secreto validado, listo para inyectar en JwtModule
        expiresIn: jwtExpiresIn, // Envía la expiración (en segundos) validada
      },
    };
  },
);