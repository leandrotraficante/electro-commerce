import { Test, TestingModule } from '@nestjs/testing'; // Herramientas de testing nativas de NestJS
import { UsersService } from './users.service'; // Servicio a testear
import { getRepositoryToken } from '@nestjs/typeorm'; // Para mockear repositorios de TypeORM
import { User } from './entities/user.entity'; // Entidad User
import { Repository } from 'typeorm'; // Clase Repository de TypeORM
import { ConflictException } from '@nestjs/common'; // Excepción que esperamos en caso de duplicados
import { hashPassword } from 'src/common/helpers/hash'; // Helper para hash de contraseñas

describe('UsersService - create()', () => { // describe agrupa los tests relacionados a create()
  let service: UsersService;
  let repository: Repository<User>;

  // Mock del repository: no toca la DB real, simula métodos usados en el service
  const mockRepository = {
    findOne: jest.fn(), // Simula búsqueda de usuario
    create: jest.fn(),  // Simula creación de instancia de usuario
    save: jest.fn(),    // Simula guardado en DB
  };

  beforeEach(async () => {
    // Crea un módulo de testing de NestJS
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService, // Service real a testear
        { provide: getRepositoryToken(User), useValue: mockRepository }, // Reemplaza repo real con mock
      ],
    }).compile();

    service = module.get<UsersService>(UsersService); // Obtiene instancia del service
    repository = module.get<Repository<User>>(getRepositoryToken(User)); // Obtiene mock del repo

    jest.clearAllMocks(); // Limpia los mocks antes de cada test
  });

  // -----------------------------
  // Test 1: creación exitosa
  // -----------------------------
  it('should create a new user successfully', async () => {
    mockRepository.findOne.mockResolvedValue(null); // Simula que NO hay duplicados
    mockRepository.create.mockImplementation(dto => dto); // create() devuelve el mismo DTO
    mockRepository.save.mockImplementation(user => Promise.resolve({ id: 1, ...user })); // save() devuelve usuario con id

    const createUserDto = {
      email: 'test@test.com',
      password: 'Password123',
      firstName: 'Lucas',
      lastName: 'Paz',
      phone: '541112345678',
      dni: 12345678,
    };

    const user = await service.create(createUserDto); // Ejecuta método real a testear

    expect(user).toHaveProperty('id'); // Verifica que se generó un id
    expect(user.email).toBe(createUserDto.email); // Verifica que el email se guardó correctamente
    expect(user.password).not.toBe(createUserDto.password); // Verifica que la contraseña fue hasheada
  });

  // -----------------------------
  // Test 2: conflicto por duplicado
  // -----------------------------
  it('should throw ConflictException if email/phone/dni already exist', async () => {
    mockRepository.findOne.mockResolvedValue({ id: 1 }); // Simula que ya existe un usuario duplicado

    const createUserDto = {
      email: 'test@test.com',
      password: 'Password123',
      firstName: 'Lucas',
      lastName: 'Paz',
      phone: '541112345678',
      dni: 12345678,
    };

    // Se espera que la promesa lance la excepción ConflictException
    await expect(service.create(createUserDto)).rejects.toThrow(ConflictException);
  });
});
