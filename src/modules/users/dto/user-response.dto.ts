// DTO de respuesta para User - excluye campos sensibles como password
// Se usa en las respuestas del controller para no exponer información sensible

import { User } from '../entities/user.entity';

export class UserResponseDto {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  dni: number;
  address?: string;
  city?: string;
  postalCode?: string;
  country?: string;
  isActive: boolean;
  role: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

// Función helper para convertir User a UserResponseDto (excluye password)
export function toUserResponseDto(user: User): UserResponseDto {
  const { password, ...userResponse } = user; // Excluye password usando destructuring
  return userResponse as UserResponseDto;
}

