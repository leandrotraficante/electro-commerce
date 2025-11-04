import { Test, TestingModule } from '@nestjs/testing'; // Herramientas de testing de NestJS
import { UsersService } from './users.service'; // Servicio que vamos a testear
import { getRepositoryToken } from '@nestjs/typeorm'; // Genera el token correcto para mockear repositorios de TypeORM
import { User } from './entities/user.entity'; // Entidad User (necesaria para el token)
import { Repository } from 'typeorm'; // Tipo del Repository (para tipado)
import { ConflictException } from '@nestjs/common'; // Excepción que esperamos cuando hay duplicados
import { hashPassword } from 'src/common/helpers/hash'; // Función helper que necesitamos mockear
import { CreateUserDto } from './dto/create-user.dto'; // DTO para tipado de la factory

// Mock a nivel módulo: intercepta la función importada antes de que se use --> hashPassword es una función importada, no una dependencia inyectada
jest.mock('src/common/helpers/hash', () => ({
  hashPassword: jest.fn(),
  comparePassword: jest.fn(),
}));

// Describe principal: agrupa todos los tests del servicio
// Estructura: 
// describe('NombreDelServicio') 
//  |_ describe('nombreDelMetodo()') 
//     |_ it('debería hacer algo')

describe('UsersService', () => {
  let service: UsersService; // Instancia del servicio que vamos a testear
  let repository: Repository<User>; // Mock del repository (no se usa mucho, pero está disponible)

  // Factory function: crea DTOs de prueba de forma centralizada
  // Ventaja: si cambia el DTO, solo se actauliza aca, en vez de repetirlo por cada test (se puede sobrescribir campos con overrides)
  const createUserDtoFactory = (overrides?: Partial<CreateUserDto>): CreateUserDto => ({
    email: 'test@test.com',
    password: 'Password123',
    firstName: 'Lucas',
    lastName: 'Paz',
    phone: '541112345678',
    dni: 12345678,
    ...overrides, // Permite cambiar campos específicos: createUserDtoFactory({ email: 'otro@email.com' })
  });

  // Mock del repository: versión falsa que no toca la DB real
  // Cada método es una función mock (jest.fn()) que podemos controlar en cada test
  const mockRepository = {
    findOne: jest.fn(), // Mock de búsqueda: mockResolvedValue(null) = no encuentra nada
    create: jest.fn(),  // Mock de creación: generalmente devuelve el mismo objeto
    save: jest.fn(),    // Mock de guardado: mockResolvedValue({ id: 1, ...user }) = simula que guardó
    // son metodos mock iguales a los que actuan directamente en DB (findOne, create, save), pero ficticios, no interactuan con la DB real
  };

  // beforeEach: se ejecuta ANTES de cada test individual
  // Configuramos el módulo de testing y obtenemos las instancias
  beforeEach(async () => {
    // Crear módulo de testing: NestJS crea un contenedor de dependencias solo para tests
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService, // Service real que queremos testear
        {
          // Reemplazar el repository real con nuestro mock
          // getRepositoryToken(User) genera el token correcto que TypeORM usa internamente
          provide: getRepositoryToken(User),
          useValue: mockRepository, // Nuestro mock reemplaza al repository real
        },
      ],
    }).compile(); // Compilar el módulo (importante: es async)

    // Extraer las instancias del módulo compilado
    service = module.get<UsersService>(UsersService); // Obtener el servicio real (con el mock inyectado)
    repository = module.get<Repository<User>>(getRepositoryToken(User)); // Obtener el mock (opcional, para referencia)

    // Limpiar mocks: borra el historial de llamadas antes de cada test
    // Esto asegura que cada test empiece "limpio" sin interferencia de tests anteriores
    jest.clearAllMocks();
  });

  // Describe anidado: agrupa tests del método create()
  // Estructura: un describe por método, así puedes agregar más métodos después (findOne, update, etc.)
  describe('create()', () => {
    // Test 1: Caso exitoso - el flujo normal cuando todo funciona bien
    it('should create a new user successfully', async () => {
      // ARRANGE: Preparar datos y configurar mocks
      const hashedPassword = '$2b$10$hashedPasswordExample123'; // Password hasheado simulado

      // Configurar mock de hashPassword: cuando se llame, retorna este valor hasheado
      (hashPassword as jest.Mock).mockResolvedValue(hashedPassword);

      // Configurar mocks del repository para simular el flujo exitoso
      mockRepository.findOne.mockResolvedValue(null); // No encuentra duplicados (null = no existe)
      mockRepository.create.mockImplementation(dto => dto); // create() solo devuelve el mismo objeto
      mockRepository.save.mockImplementation(user => Promise.resolve({ id: 1, ...user })); // save() simula que guardó y agregó id

      const createUserDto = createUserDtoFactory(); // Crear DTO de prueba usando la factory

      // ACT: Ejecutar el método real que queremos testear
      const user = await service.create(createUserDto);

      // ASSERT: Verificar que el resultado sea el esperado
      expect(user).toHaveProperty('id'); // El usuario debe tener un id (fue guardado)
      expect(user.email).toBe(createUserDto.email); // El email debe ser el mismo que enviamos
      expect(user.password).not.toBe(createUserDto.password); // El password debe estar hasheado (no igual al original)
    });

    // Test 2: Error de negocio - cuando hay un duplicado (email, phone o dni ya existe)
    it('should throw ConflictException if email/phone/dni already exist', async () => {
      // ARRANGE: Simular que ya existe un usuario con esos datos
      mockRepository.findOne.mockResolvedValue({ id: 1 }); // Encuentra un usuario existente

      const createUserDto = createUserDtoFactory();

      // ACT & ASSERT: Verificar que se lance la excepción correcta
      // await expect().rejects.toThrow() es para cuando esperas que una promesa rechace (lanze error)
      await expect(service.create(createUserDto)).rejects.toThrow(ConflictException);
    });

    // Test 3: Verificar comportamiento interno - que el password se hashee correctamente
    // Este test verifica no solo el resultado, sino también el proceso (que se llame hashPassword)
    it('should hash password before saving', async () => {
      // ARRANGE: Preparar password plano y hasheado
      const plainPassword = 'Password123'; // Password original del usuario
      const hashedPassword = '$2b$10$hashedPasswordExample123'; // Password hasheado que esperamos

      // Configurar mock de hashPassword
      (hashPassword as jest.Mock).mockResolvedValue(hashedPassword);

      // Configurar mocks del repository
      mockRepository.findOne.mockResolvedValue(null); // No hay duplicados
      mockRepository.create.mockImplementation(dto => dto);
      mockRepository.save.mockResolvedValue({
        id: 1,
        ...createUserDtoFactory(), // DTO base
        password: hashedPassword, // Con el password hasheado
      });

      // Usar factory con override: cambiar solo el password del DTO
      const createUserDto = createUserDtoFactory({ password: plainPassword });

      // ACT: Ejecutar el método
      const user = await service.create(createUserDto);

      // ASSERT: Verificar que hashPassword fue llamado correctamente
      expect(hashPassword).toHaveBeenCalledWith(plainPassword); // Fue llamado con el password original
      expect(hashPassword).toHaveBeenCalledTimes(1); // Fue llamado exactamente una vez

      // ASSERT: Verificar que el password guardado es el hasheado (no el original)
      expect(user.password).toBe(hashedPassword); // El password guardado debe ser el hasheado
      expect(user.password).not.toBe(plainPassword); // No debe ser el password original

      // ASSERT: Verificar que save() recibió el password hasheado
      // expect.objectContaining() verifica que el objeto tenga al menos esa propiedad
      expect(mockRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({ password: hashedPassword })
      );
    });

    // Test 4: Edge case - error de base de datos al guardar
    // Simula cuando la DB falla (conexión perdida, timeout, etc.)
    it('should handle database save failure', async () => {
      // ARRANGE: Preparar mocks para simular error de DB al guardar
      const hashedPassword = '$2b$10$hashedPasswordExample123';
      const dbError = new Error('Database connection failed'); // Error simulado de DB

      // Configurar mocks
      (hashPassword as jest.Mock).mockResolvedValue(hashedPassword);
      mockRepository.findOne.mockResolvedValue(null); // No hay duplicados (pasa la validación)
      mockRepository.create.mockImplementation(dto => dto);
      mockRepository.save.mockRejectedValue(dbError); // DB falla al intentar guardar

      const createUserDto = createUserDtoFactory();

      // ACT & ASSERT: Verificar que el error se propaga correctamente
      // El error de DB debe propagarse (no debe ser manejado internamente)
      await expect(service.create(createUserDto)).rejects.toThrow('Database connection failed');
      
      // Verificar que se intentó guardar (llegó hasta el punto de guardar)
      expect(mockRepository.save).toHaveBeenCalled();
    });
  });
});