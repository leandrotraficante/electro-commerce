import { PartialType, OmitType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';

export class UpdateUserDto extends PartialType(
  OmitType(CreateUserDto, ['password'] as const)
) { 

/* Cómo funciona internamente:

Hereda todos los campos de CreateUserDto EXCEPTO password (usando OmitType).
Convierte todos los campos en opcionales (?) con PartialType.
Mantiene las validaciones (IsEmail, Length, etc.) de CreateUserDto, pero ahora los campos opcionales no disparan errores si no se envían.
El password está excluido porque se manejará en un método separado para cambio de contraseña (mejores prácticas de seguridad).


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
