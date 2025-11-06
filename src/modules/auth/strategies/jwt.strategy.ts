import { Injectable, UnauthorizedException } from '@nestjs/common'; // Injectable para inyectar la estrategia. UnauthorizedException para errores de autenticación
import { PassportStrategy } from '@nestjs/passport'; // Base para estrategias de Passport
import { ExtractJwt, Strategy } from 'passport-jwt'; // ExtractJwt para extraer token del header. Strategy es la estrategia JWT de Passport
import { UsersService } from '../../users/users.service'; // Servicio de usuarios para obtener datos del usuario
import { User } from '../../users/entities/user.entity'; // Entidad User para tipado

@Injectable() // Marca la clase como inyectable por NestJS
export default class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly usersService: UsersService) {
    super({
      // Extrae el token del header Authorization: Bearer <token>
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      // Secreto para verificar la firma del token (debe coincidir con el usado en JwtModule)
      secretOrKey: process.env.JWT_SECRET || 'your-secret-key',
      // Opcional: ignorar expiración (útil para testing, en producción debe ser false)
      ignoreExpiration: false,
    });
  }

  // Método validate() - Se ejecuta automáticamente cuando Passport valida un token JWT
  // Recibe el payload decodificado del token (lo que pusiste en generateToken)
  // Debe retornar el usuario que se adjuntará al request (req.user)
  async validate(payload: any): Promise<User> {
    // TODO: El payload debería contener el id del usuario (ej: payload.sub o payload.id)
    //   - Extraer ID: const userId = payload.sub || payload.id
    // TODO: Buscar usuario por ID usando usersService.findOne(userId)
    //   - Si no existe, NotFoundException ya se lanza en usersService.findOne()
    // TODO: Verificar que el usuario esté activo (isActive: true)
    //   - Si está inactivo, lanzar: throw new UnauthorizedException('Usuario inactivo')
    // TODO: Retornar el usuario (sin password)
    // Nota: El usuario retornado se adjunta automáticamente a req.user en las rutas protegidas
    throw new UnauthorizedException('Estrategia JWT no implementada aún');
  }
}
