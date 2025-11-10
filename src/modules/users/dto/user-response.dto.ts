// src/modules/users/dto/user-response.dto.ts
import { User } from '../entities/user.entity';
import { RolesEnum } from 'src/common/enums/enums';

/**
 * DTO base de respuesta para User.
 * Incluye todos los campos no sensibles (excluye password).
 */
export class UserResponseDto {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  dni?: number;
  birthDate?: Date;
  address?: string;
  city?: string;
  postalCode?: string;
  country?: string;
  isActive: boolean;
  role: RolesEnum;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

/**
 * Conversión de entidad User → DTO de respuesta privada (para el propio usuario o admin)
 * Excluye solo el password.
 */
export function toUserResponseDto(user: User): UserResponseDto {
  const { password, ...userResponse } = user;
  return userResponse as UserResponseDto;
}

/**
 * Conversión de entidad User → DTO de respuesta pública (para endpoints abiertos)
 * Excluye datos sensibles: password, phone, dni, dirección, etc.
 */
export function toUserPublicResponseDto(user: User): UserResponseDto {
  const {
    password,
    phone,
    dni,
    birthDate,
    address,
    city,
    postalCode,
    country,
    deletedAt,
    ...userResponse
  } = user;
  return userResponse as UserResponseDto;
}
