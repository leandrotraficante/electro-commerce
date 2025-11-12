import { PartialType, OmitType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';

export class UpdateUserDto extends PartialType(
  OmitType(CreateUserDto, ['password', 'email', 'phone', 'dni', 'birthDate'] as const)
) { 

/* Cómo funciona internamente:

Hereda todos los campos de CreateUserDto EXCEPTO password (usando OmitType).
Convierte todos los campos en opcionales (?) con PartialType.
Mantiene las validaciones (Length, etc.) de CreateUserDto sobre los campos permitidos.
Se excluyen password, email, phone, dni y birthDate: esos datos sensibles necesitan endpoints y lógica específica.


Llamamos al endpoint PATCH /users/:id con un JSON:

{
  "firstName": "Juan",
  "phone": "+5491123456789"
}

NestJS toma UpdateUserDto.
Valida los campos que sí están presentes según las reglas de class-validator.
Los campos no enviados (lastName, email, etc.) no son modificados.
El servicio (UsersService) luego se encarga de actualizar en la DB solo los campos presentes, dejando el resto intactos.

NOTA: El password NO puede ser actualizado mediante este DTO. Para cambiar contraseña, se usará un método específico en el futuro.

*/

}
