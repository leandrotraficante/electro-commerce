import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common'; // Injectable para inyectar el servicio. Excepciones para manejo de errores de autenticación
import { JwtService } from '@nestjs/jwt'; // Servicio de JWT para generar y validar tokens
import { UsersService } from '../users/users.service'; // Servicio de usuarios para acceder a datos de usuarios
import { comparePassword } from 'src/common/helpers/hash'; // Helper para comparar contraseñas hasheadas
import { User } from '../users/entities/user.entity'; // Entidad User para tipado
import { CreateUserDto } from '../users/dto/create-user.dto'; // DTO para creación de usuario
import { LoginDto } from './dto/login.dto'; // DTO para login (solo email y password)
import { UserResponseDto, toUserResponseDto } from '../users/dto/user-response.dto'; // DTO de respuesta y helper para excluir password
import { JwtPayload } from 'src/common/types/jwt-payload.interface';

@Injectable() // Marca la clase como inyectable por NestJS
export class AuthService {
  constructor(
    private readonly usersService: UsersService, // Inyecta el servicio de usuarios
    private readonly jwtService: JwtService, // Inyecta el servicio de JWT
  ) { }

  // Registro de nuevo usuario
  // Valida que el email no exista y crea un nuevo usuario con contraseña hasheada
  async register(createUserDto: CreateUserDto): Promise<{ user: UserResponseDto; accessToken: string }> {
    // Crear usuario usando usersService.create() - ya valida duplicados, hashea password y guarda en DB
    // usersService.create() lanza ConflictException si el usuario ya existe (email, phone o dni duplicados)
    const savedUser = await this.usersService.create(createUserDto);

    // Generar token JWT DESPUÉS de guardar el usuario (necesitamos el id que se genera al guardar)
    const token = await this.generateToken(savedUser);

    // Excluir password del usuario antes de retornarlo (seguridad)
    const userResponse = toUserResponseDto(savedUser);

    // Retornar usuario sin password y token
    return { user: userResponse, accessToken: token };
  }

  // Login de usuario existente
  // Valida credenciales (email y password) y retorna token JWT
  async login(loginDto: LoginDto): Promise<{ user: UserResponseDto; accessToken: string }> {
    // Los datos de entrada (email y password) ya están validados automáticamente por ValidationPipe usando LoginDto

    // Buscar usuario por email incluyendo password (necesario para comparar)
    // findByEmailWithPassword retorna null si no existe el usuario (método interno de UsersService)
    const user = await this.usersService.findByEmailWithPassword(loginDto.email);

    // Si el usuario no existe, lanzar excepción de credenciales inválidas (por seguridad, no revelar si el email existe)
    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // Verificar que el usuario esté activo
    if (!user.isActive) {
      throw new UnauthorizedException('Usuario inactivo');
    }

    // Comparar contraseña ingresada con la contraseña hasheada
    const isValidPassword = await comparePassword(loginDto.password, user.password);

    // Si la contraseña no coincide, lanzar excepción de credenciales inválidas
    if (!isValidPassword) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // Generar token JWT con los datos del usuario
    const token = await this.generateToken(user);

    // Retornar usuario sin password y token
    return { user: toUserResponseDto(user), accessToken: token };
  }

  // Logout (opcional)
  // En JWT stateless, esto simplemente retorna éxito ya que el cliente elimina el token
  // Si necesitas invalidar tokens, deberías implementar una blacklist (Redis o DB)
  async logout(): Promise<{ message: string }> {
    // En JWT stateless, el logout es responsabilidad del cliente (eliminar el token)
    // Si necesitas invalidar tokens del servidor, implementa una blacklist
    return { message: 'Sesión cerrada exitosamente' };
  }

  // Generar token JWT
  // Crea un token JWT con el payload del usuario (id, email, role)
  async generateToken(user: User): Promise<string> {
    // Crear payload con datos del usuario (id, email, role)
    // sub (subject) es el estándar JWT para el ID del usuario
    const payload: JwtPayload = {
      sub: user.id, // ID del usuario
      email: user.email, // Email del usuario
      role: user.role, // Rol del usuario
    };

    // Generar token usando jwtService.sign() con el payload
    // El tiempo de expiración ya está configurado en JwtModule (24h)
    const token = this.jwtService.sign(payload);

    // Retornar el token generado
    return token;
  }

  // Refresh token (opcional)
  // Genera un nuevo token para el usuario autenticado, evitando ids arbitrarios
  async refreshToken(authenticatedUser: User): Promise<{ accessToken: string }> {
    // Revalida el usuario consultando por su propio ID (sub extraído del JWT)
    const user = await this.usersService.findOne(authenticatedUser.id);

    // Verificar que el usuario esté activo
    if (!user.isActive) {
      throw new UnauthorizedException('Usuario inactivo');
    }

    // Generar nuevo token usando generateToken()
    const token = await this.generateToken(user);

    // Retornar el nuevo token
    return { accessToken: token };
  }


}
