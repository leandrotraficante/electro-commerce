import { Injectable, UnauthorizedException } from '@nestjs/common'; // Injectable para inyectar la estrategia. UnauthorizedException para errores de autenticación
import { PassportStrategy } from '@nestjs/passport'; // Base para estrategias de Passport
import { ExtractJwt, Strategy } from 'passport-jwt'; // ExtractJwt para extraer token del header. Strategy es la estrategia JWT de Passport
import { UsersService } from '../../users/users.service'; // Servicio de usuarios para obtener datos del usuario
import { User } from '../../users/entities/user.entity'; // Entidad User para tipado
import { JwtPayload } from 'src/common/types/jwt-payload.interface';

@Injectable() // Marca la clase como inyectable por NestJS
export class JwtStrategy extends PassportStrategy(Strategy) {
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
  // Recibe el payload decodificado del token (lo que puse en generateToken)
  // Debe retornar el usuario que se adjuntará al request (req.user)
  async validate(payload: JwtPayload): Promise<User> {
    const userId = payload.sub;
    const user = await this.usersService.findOne(userId);

    if (!user.isActive) {
      throw new UnauthorizedException('Usuario inactivo');
    }

    return user; // Nest adjunta esto como req.user
  }
}
