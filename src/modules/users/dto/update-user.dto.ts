import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';

export class UpdateUserDto extends PartialType(CreateUserDto) { 

/* Cómo funciona internamnte:

Hereda todos los campos de CreateUserDto.
Convierte todos los campos en opcionales (?).
Mantiene las validaciones (IsEmail, Length, etc.) de CreateUserDto, pero ahora los campos opcionales no disparan errores si no se envían.


Llamamos al endpoint PATCH /users/:id con un JSON:

{
  "firstName": "Juan",
  "phone": "+5491123456789"
}

NestJS toma UpdateUserDto.
Valida los campos que sí están presentes según las reglas de class-validator.
Los campos no enviados (lastName, email, etc.) no son modificados.
El servicio (UsersService) luego se encarga de actualizar en la DB solo los campos presentes, dejando el resto intactos.

*/

}
