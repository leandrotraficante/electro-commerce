import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common'; // Injectable marca la clase como inyectable. NotFoundException para manejar 404. ConflictException para manejar duplicados
import { CreateUserDto } from './dto/create-user.dto'; // DTO de creación de usuario
import { UpdateUserDto } from './dto/update-user.dto'; // DTO de actualización de usuario
import { InjectRepository } from '@nestjs/typeorm'; // Inyecta repositorio TypeORM
import { Repository, FindOptionsWhere } from 'typeorm'; // Repository para acceder a la DB. FindOptionsWhere para tipar condiciones where
import { User } from './entities/user.entity'; // Entidad User
import { RolesEnum } from 'src/common/enums/enums'; // Enum de roles
import { hashPassword } from 'src/common/helpers/hash';

@Injectable() // Marca la clase como inyectable por NestJS
export class UsersService {
  constructor(
    @InjectRepository(User) // Inyecta el repository de User
    private readonly userRepository: Repository<User>, // Repositorio de la entidad User
  ) {}

  // Crear usuario (uso interno, sin hashing ni validaciones de registro)
  // para uso de ADMIN 
  // IMPORTANTE: El role siempre será USER por defecto (definido en la entidad)
  // El admin NO puede crear otros admins, solo usuarios normales
  // Solo el dueño de la app puede crear admins (endpoint separado o lógica especial)
  async create(createUserDto: CreateUserDto): Promise<User> {
    // Validar duplicados: email, phone, dni
    const existingUser = await this.userRepository.findOne({
      where: [
        { email: createUserDto.email },
        { phone: createUserDto.phone },
        { dni: createUserDto.dni },
      ],
    });
    if (existingUser) {
      throw new ConflictException(
        'Email, teléfono o DNI ya existe en otro usuario', // mensaje de conflicto
      );
    }

    const hashedPassword = await hashPassword(createUserDto.password);
    const user = this.userRepository.create({
      ...createUserDto,
      password: hashedPassword,
    }); // Crea instancia de User pero no guarda (role se asigna automáticamente como USER por default)
    return this.userRepository.save(user); // Guarda en DB y retorna entidad completa
  }

  private buildPagination(page = 1, limit = 10): { page: number; limit: number; skip: number } {
    const safePage = Number.isFinite(page) && page > 0 ? Math.trunc(page) : 1;
    const safeLimit = Number.isFinite(limit) && limit > 0 ? Math.trunc(limit) : 10;
    const skip = (safePage - 1) * safeLimit;
    return { page: safePage, limit: safeLimit, skip };
  }

  private buildPaginatedResponse(users: User[], total: number, page: number, limit: number) {
    return { users, total, page, limit };
  }

  // Obtener todos los usuarios con paginación
  async findAll(page: number = 1, limit: number = 10): Promise<{ users: User[]; total: number; page: number; limit: number }> {
    const { page: safePage, limit: safeLimit, skip } = this.buildPagination(page, limit);
    const [users, total] = await this.userRepository.findAndCount({
      skip, // Registros a saltar
      take: safeLimit, // Cantidad de registros a tomar
    });
    return this.buildPaginatedResponse(users, total, safePage, safeLimit);
  }

  // Obtener usuario por id
  async findOne(id: number): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } }); // Busca usuario por id
    if (!user) throw new NotFoundException('Usuario no encontrado'); // Lanza excepción si no existe
    return user;
  }

  // Obtener usuario por email
  async findByEmail(email: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { email } }); // Busca por email
    if (!user) throw new NotFoundException('Usuario no encontrado');
    return user;
  }

  // Obtener usuario por email incluyendo password (solo para autenticación - uso interno)
  // Usa addSelect para incluir el campo password que tiene select: false
  // Retorna null si no existe (para manejo en auth, no lanza excepción)
  async findByEmailWithPassword(email: string): Promise<User | null> {
    const user = await this.userRepository
      .createQueryBuilder('user')
      .addSelect('user.password') // Incluye el campo password que normalmente está excluido
      .where('user.email = :email', { email })
      .getOne();
    return user || null; // Retorna null en lugar de lanzar excepción (para manejo en auth)
  }

  // Obtener usuarios activos
  async findActive(page: number = 1, limit: number = 10): Promise<{ users: User[]; total: number; page: number; limit: number }> {
    const { page: safePage, limit: safeLimit, skip } = this.buildPagination(page, limit);
    const [users, total] = await this.userRepository.findAndCount({
      where: { isActive: true },
      skip,
      take: safeLimit,
    });
    return this.buildPaginatedResponse(users, total, safePage, safeLimit);
  }

  // Obtener usuarios inactivos
  async findInactive(page: number = 1, limit: number = 10): Promise<{ users: User[]; total: number; page: number; limit: number }> {
    const { page: safePage, limit: safeLimit, skip } = this.buildPagination(page, limit);
    const [users, total] = await this.userRepository.findAndCount({
      where: { isActive: false },
      skip,
      take: safeLimit,
    });
    return this.buildPaginatedResponse(users, total, safePage, safeLimit);
  }

  // Obtener usuarios por rol
  async findByRole(role: RolesEnum, page: number = 1, limit: number = 10): Promise<{ users: User[]; total: number; page: number; limit: number }> {
    const { page: safePage, limit: safeLimit, skip } = this.buildPagination(page, limit);
    const [users, total] = await this.userRepository.findAndCount({
      where: { role },
      skip,
      take: safeLimit,
    });
    return this.buildPaginatedResponse(users, total, safePage, safeLimit);
  }

  // Actualizar usuario
  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id); // Asegura que exista

    // Campos que no se permiten modificar desde este endpoint
    const forbiddenFields: Array<keyof User> = ['email', 'phone', 'dni', 'birthDate', 'password'];
    const payload = updateUserDto as Record<string, unknown>;
    const forbiddenProvided = forbiddenFields.filter((field) =>
      Object.prototype.hasOwnProperty.call(payload, field) && payload[field] !== undefined,
    );

    if (forbiddenProvided.length > 0) {
      throw new BadRequestException(
        `No está permitido actualizar los campos: ${forbiddenProvided.join(', ')}`,
      );
    }

    // Aplicar actualizaciones: copia propiedades del DTO al usuario existente
    // Object.assign() actualiza solo los campos presentes en updateUserDto, mantiene los demás
    Object.assign(user, updateUserDto);
    
    return this.userRepository.save(user); // Guarda el usuario actualizado en la DB
  }

  // Soft delete (borrado lógico, mantiene registro en DB)
  async softDelete(id: number): Promise<User> {
    const user = await this.findOne(id); // Asegura existencia
    user.isActive = false; // Marca como inactivo
    return this.userRepository.save(user); // Guarda cambios en DB
  }

  // Restaurar usuario borrado lógicamente
  async restore(id: number): Promise<User> {
    const user = await this.findOne(id); // Asegura existencia
    user.isActive = true; // Marca como activo
    return this.userRepository.save(user); // Guarda cambios en DB
  }

}
