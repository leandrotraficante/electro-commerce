import { Controller, Get, Post, Body, UseFilters, UseGuards, Req, } from '@nestjs/common'; // Decoradores base de NestJS para definir controladores, rutas y middlewares
import { AuthService } from './auth.service'; // Servicio de autenticación que contiene la lógica de negocio
import { AllExceptionsFilter } from 'src/common/filters/http-exception.filter'; // Filtro global de errores para capturar y formatear excepciones HTTP
import { CreateUserDto } from '../users/dto/create-user.dto'; // DTO para validar los datos del registro de usuario
import { LoginDto } from './dto/login.dto'; // DTO para validar los datos del login (email y password)
import { AuthGuard } from '@nestjs/passport'; // Guard de Passport que protege rutas usando estrategias (JWT en este caso)
import type { RequestWithUser } from 'src/common/types/req-user.interface'; // Tipo extendido de Request con el usuario adjunto por Passport
import { toUserResponseDto, UserResponseDto } from '../users/dto/user-response.dto'; // Helper que transforma la entidad User en un DTO sin exponer el password
import { ApiResponse, ApiMessageResponse } from 'src/common/types/api-response.types'; // Tipos de respuesta estandarizados para toda la API

@Controller('auth') // Define el prefijo base de las rutas: /auth
@UseFilters(AllExceptionsFilter) // Aplica el filtro global de excepciones a todas las rutas de este controlador
export class AuthController {
  constructor(private readonly authService: AuthService) { } // Inyección del servicio de autenticación


  @Post('register') // Endpoint: POST /auth/register
  async register(
    @Body() createUserDto: CreateUserDto, // Valida el cuerpo de la solicitud según el DTO CreateUserDto
  ): Promise<ApiResponse<{ user: UserResponseDto; accessToken: string }>> { // Devuelve una respuesta tipada ApiResponse con datos dinámicos
    const result = await this.authService.register(createUserDto); // Llama al servicio AuthService para crear el usuario y generar token
    return {
      statusCode: 201, // Código HTTP estándar para "Created"
      message: 'Usuario registrado exitosamente', // Mensaje descriptivo
      data: result, // Incluye el usuario (sin password) y el accessToken
    };
  }


  @Post('login') // Endpoint: POST /auth/login
  async login(@Body() loginDto: LoginDto): Promise<ApiResponse<{ user: UserResponseDto; accessToken: string }>> {
    const result = await this.authService.login(loginDto); // Valida credenciales y genera token
    return {
      statusCode: 200, // Código HTTP estándar para "OK"
      message: 'Inicio de sesión exitoso', // Mensaje descriptivo
      data: result, // Incluye el usuario autenticado y el accessToken
    };
  }

  @UseGuards(AuthGuard('jwt')) // Protege la ruta con el guard JWT (solo accesible con token válido)
  @Get('profile') // Endpoint: GET /auth/profile
  async profile(
    @Req() req: RequestWithUser, // Obtiene el objeto Request extendido con la propiedad user (inyectado por JwtStrategy)
  ): Promise<ApiResponse<UserResponseDto>> { // Se tipa explícitamente con UserResponseDto (mejor que ReturnType<typeof toUserResponseDto>)
    return {
      statusCode: 200, // Código HTTP estándar para "OK"
      message: 'Perfil obtenido correctamente', // Mensaje descriptivo
      data: toUserResponseDto(req.user), // Convierte la entidad User en un DTO sin password
    };
  }

  @UseGuards(AuthGuard('jwt')) // Protege la ruta: solo usuarios autenticados pueden hacer logout
  @Post('logout') // Endpoint: POST /auth/logout
  async logout(): Promise<ApiMessageResponse> {
    await this.authService.logout(); // Llama al método logout (en JWT stateless es simbólico)
    return {
      statusCode: 200, // Código HTTP estándar para "OK"
      message: 'Sesión cerrada exitosamente', // Mensaje descriptivo
    };
  }
}
