import { Injectable, NotFoundException, ConflictException } from '@nestjs/common'; // Injectable marca la clase como inyectable. NotFoundException para manejar 404. ConflictException para manejar duplicados
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
    // newUser: combina CreateUserDto con password hasheado (tipo implícito, TypeORM acepta Partial<User>)
    const newUser = { ...createUserDto, password: hashedPassword };

    const user = this.userRepository.create(newUser); // Crea instancia de User pero no guarda
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
  async findByRole(role: RolesEnum): Promise<User[]> {
    return this.userRepository.find({ where: { role } }); // Busca por rol
  }

  // Actualizar usuario
  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id); // Asegura que exista

    // Construir array de condiciones where solo con campos que realmente vienen en el DTO
    // FindOptionsWhere<User>[] = tipo de TypeORM para condiciones where de la entidad User
    const whereConditions: FindOptionsWhere<User>[] = []; // Array vacío tipado explícitamente (evita never[])

    // Agregar condición de email solo si viene en el DTO
    if (updateUserDto.email) {
      whereConditions.push({ email: updateUserDto.email }); // Agrega { email: 'valor' } al array
    }

    // Agregar condición de phone solo si viene en el DTO
    if (updateUserDto.phone) {
      whereConditions.push({ phone: updateUserDto.phone }); // Agrega { phone: 'valor' } al array
    }

    // Agregar condición de dni solo si viene en el DTO
    if (updateUserDto.dni) {
      whereConditions.push({ dni: updateUserDto.dni }); // Agrega { dni: valor } al array
    }

    // Solo buscar conflictos si hay campos únicos en el DTO (evita búsqueda innecesaria)
    if (whereConditions.length > 0) {
      // Buscar usuario que tenga alguno de esos campos únicos
      const conflictingUser = await this.userRepository.findOne({
        where: whereConditions, // Array de condiciones: [{ email: '...' }, { phone: '...' }, etc.]
      });

      // Si existe conflicto y NO es el mismo usuario que estamos actualizando
      if (conflictingUser && conflictingUser.id !== id) {
        throw new ConflictException(
          'Email, teléfono o DNI ya existe en otro usuario', // mensaje de conflicto
        );
      }
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

  // Borrado físico (solo si se quiere eliminar de verdad)
  async remove(id: number): Promise<void> {
    await this.userRepository.delete(id); // Borra registro de la DB
  }
}
