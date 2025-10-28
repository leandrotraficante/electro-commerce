import { SetMetadata } from '@nestjs/common'; // SetMetadata nos permite adjuntar metadatos a un método o clase
import { RolesEnum } from '../enums/enums';

// Creamos un decorator llamado @Roles() que se puede usar en controllers o métodos
// para indicar qué roles tienen permiso de acceder.
// Ejemplo de uso en un controller:
// @Roles(RolesEnum.ADMIN) 
// @Get()
// findAll() { ... }
export const Roles = (...roles: RolesEnum[]) => SetMetadata('roles', roles); // se define el decorador de roles para validar los roles de los usuarios
// 'roles' es la clave que luego el RoleGuard usará para verificar permisos
