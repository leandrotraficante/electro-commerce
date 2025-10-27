import { Injectable, NotFoundException } from '@nestjs/common'; // Injectable marca la clase como inyectable. NotFoundException para manejar 404.
import { CreateUserDto } from './dto/create-user.dto'; // DTO de creación de usuario
import { UpdateUserDto } from './dto/update-user.dto'; // DTO de actualización de usuario
import { InjectRepository } from '@nestjs/typeorm'; // Inyecta repositorio TypeORM
import { Repository } from 'typeorm'; // Repository para acceder a la DB
import { User } from './entities/user.entity'; // Entidad User
import { Role } from 'src/common/enums/enums'; // Enum de roles

@Injectable() // Marca la clase como inyectable por NestJS
export class UsersService {
  constructor(
    @InjectRepository(User) // Inyecta el repository de User
    private readonly userRepository: Repository<User>, // Repositorio de la entidad User
  ) {}

  // Crear usuario (uso interno, sin hashing ni validaciones de registro)
  // para uso de ADMIN 
  async create(createUserDto: CreateUserDto): Promise<User> {
    const user = this.userRepository.create(createUserDto); // Crea instancia de User pero no guarda
    return this.userRepository.save(user); // Guarda en DB y retorna entidad completa
  }

  // Obtener todos los usuarios
  async findAll(): Promise<User[]> {
    return this.userRepository.find(); // Devuelve todos los usuarios
  }

  // Obtener usuario por id
  async findOne(id: number): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } }); // Busca usuario por id
    if (!user) throw new NotFoundException('User not found'); // Lanza excepción si no existe
    return user;
  }

  // Obtener usuario por email
  async findByEmail(email: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { email } }); // Busca por email
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  // Obtener usuarios activos
  async findActive(): Promise<User[]> {
    return this.userRepository.find({ where: { isActive: true } }); // Solo activos
  }

  // Obtener usuarios inactivos
  async findInactive(): Promise<User[]> {
    return this.userRepository.find({ where: { isActive: false } }); // Solo inactivos
  }

  // Obtener usuarios por rol
  async findByRole(role: Role): Promise<User[]> {
    return this.userRepository.find({ where: { role } }); // Busca por rol
  }

  // Actualizar usuario
  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id); // Asegura que exista
    return this.userRepository.save({ ...user, ...updateUserDto }); // Actualiza y guarda el usuario
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

  // Borrado físico (solo si se quiere eliminar de verdad)
  async remove(id: number): Promise<void> {
    await this.userRepository.delete(id); // Borra registro de la DB
  }
}
