import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common'; // Injectable habilita Inyeccion de Dependencias; 
// NotFound/Unauthorized son excepciones HTTP que usamos en validate()
import { ConfigService } from '@nestjs/config'; // ConfigService permite leer valores validados desde ConfigModule
import { PassportStrategy } from '@nestjs/passport'; // Clase base que convierte esta clase en una estrategia Passport
import { ExtractJwt, Strategy } from 'passport-jwt'; // Strategy implementa JWT para Passport; ExtractJwt obtiene el token del header
import { UsersService } from '../../users/users.service'; // Servicio encargado de consultar usuarios en la base
import { User } from '../../users/entities/user.entity'; // Entidad User usada para tipar el retorno
import { JwtPayload } from 'src/common/types/jwt-payload.interface'; // Interface con la forma del payload que firmamos

@Injectable() // Permite que NestJS cree e inyecte esta estrategia donde se necesite
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly usersService: UsersService, // Inyecta UsersService para recuperar el usuario del token
    private readonly configService: ConfigService, // Inyecta ConfigService para leer la configuración centralizada
  ) {
    const secret = configService.get<string>('jwt.secret'); // Obtiene el secreto JWT validado por ConfigModule

    if (!secret) { // Si por alguna razón el secreto no existe, detenemos la app inmediatamente
      throw new Error('JWT_SECRET no está configurado.'); // Mensaje claro para detectar la falta de configuración
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), // Define que el token se toma del header Authorization: Bearer
      secretOrKey: secret, // Configura el secreto que Passport usará para validar la firma del token
      ignoreExpiration: false, // Obliga a Passport a respetar la expiración embebida en el token
    });
  }

  // validate(): se ejecuta después de que Passport verifica la firma y la expiración del token
  // Recibe el payload que firmamos al generar el JWT y debe retornar el usuario que se adjuntará al request
  async validate(payload: JwtPayload): Promise<User> {
    const userId = payload.sub; // sub (subject) es el ID del usuario según la convención JWT
    let user: User | null = null; // Prepara una variable para almacenar el usuario si existe

    try {
      user = await this.usersService.findOne(userId); // Busca al usuario en la base de datos
    } catch (error) {
      if (error instanceof NotFoundException) { // Si no existe, normalizamos a null para responder 401
        user = null;
      } else {
        throw error; // Cualquier otro error se propaga para que NestJS lo maneje
      }
    }

    if (!user || !user.isActive) { // Si el usuario no existe o está inactivo, bloqueamos el acceso
      throw new UnauthorizedException('Usuario inactivo'); // Responde 401 y evita filtrar información sensible
    }

    return user; // El usuario retornado se adjunta a req.user y queda disponible en los controladores
  }
}
