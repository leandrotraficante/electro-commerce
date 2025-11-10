import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common'; // CanActivate es la interfaz que debe implementar cualquier guard
// ExecutionContext es el contexto de la ejecución de la request; Injectable es el decorador que marca la clase como inyectable por NestJS
import { Reflector } from '@nestjs/core'; // Reflector permite leer metadata que definimos con SetMetadata en el decorador Roles
import { RolesEnum } from 'src/common/enums/enums'; // Importamos nuestro enum de roles

@Injectable() // Marca la clase como inyectable por NestJS
export class RolesGuard implements CanActivate { // El guard debe implementar CanActivate
  constructor(private reflector: Reflector) {} // Reflector se inyecta para acceder a la metadata de roles

  canActivate(context: ExecutionContext): boolean { // Método obligatorio de CanActivate
    // Obtener los roles requeridos definidos en el decorador Roles del endpoint
    const requiredRoles = this.reflector.getAllAndOverride<RolesEnum[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);
    // 'roles' es la key que usamos en SetMetadata
    if (!requiredRoles) {
      // Si no hay roles requeridos, dejamos pasar la request
      return true;
    }

    // Obtener el usuario actual de la request
    const request = context.switchToHttp().getRequest(); // Accede al objeto request
    const user = request.user; // Supone que ya tenemos user inyectado (por ejemplo, via JWT guard)
    if (!user) {
      return false; // Si no hay usuario, bloqueamos el acceso
    }

    // Verificar si el role del usuario coincide con alguno de los roles requeridos
    return requiredRoles.includes(user.role); // Devuelve true si tiene permiso, false si no
  }
}
