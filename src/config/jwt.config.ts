import { registerAs } from '@nestjs/config';

export const jwtConfig = registerAs('jwt', () => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET no está definido.');
  }

  const expiresInRaw = process.env.JWT_EXPIRES_IN ?? String(24 * 60 * 60);
  const expiresIn = Number(expiresInRaw);

  if (!Number.isFinite(expiresIn) || expiresIn <= 0) {
    throw new Error('JWT_EXPIRES_IN debe ser un número mayor a 0 (en segundos).');
  }

  return {
    secret,
    expiresIn,
  };
});
