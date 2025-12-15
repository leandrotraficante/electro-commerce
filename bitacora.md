📅 Día 0 — Setup inicial del proyecto

🚀 Avances

Creación del proyecto base con NestJS usando: nest new backend.

Configuración inicial del entorno de desarrollo (estructura de carpetas, Git y GitHub).

Instalación de dependencias clave:
    NestJS core & CLI (@nestjs/common, @nestjs/core, @nestjs/cli).
    TypeORM + PostgreSQL (@nestjs/typeorm, pg).

Validación y transformación de datos (class-validator, class-transformer).

Autenticación y seguridad (@nestjs/jwt, passport, bcrypt, helmet, cors).

Testing y linting (jest, eslint, prettier).

Configuración de scripts en package.json para build, dev, test, y lint.


🧠 Aprendizajes

Comprensión de cómo NestJS organiza la arquitectura modular.

Diferencia entre dependencias principales y devDependencies.

Importancia de mantener el entorno de desarrollo limpio y reproducible desde cero.


⚙️ Desafíos

Entender las convenciones de NestJS al crear módulos, controladores y servicios.

Configurar correctamente ESLint y Prettier para mantener un formato consistente.


💡 Tips

Usar npm run start:dev para desarrollo con watch mode.

Crear commits pequeños y descriptivos desde el inicio (ayuda muchísimo más adelante).

Mantener .env fuera del repositorio (seguridad).

----------------------------------------------------------------------------------------------------------

📅 Día 1 — Modelado de Usuario (Entity + DTO + Validaciones)

🚀 Avances

Creación del módulo users con su entidad User y DTO CreateUserDto.

Definición de atributos clave del usuario: email, password, firstName, lastName, phone, dni, address, city, postalCode, country, isActive, role, timestamps.

Implementación de decoradores de TypeORM (@Entity, @Column, @CreateDateColumn, @UpdateDateColumn, @DeleteDateColumn).

Creación de validaciones avanzadas en el DTO usando class-validator: @IsEmail, @Length, @Matches, @IsOptional.

Validaciones realistas para password, phone, dni.

Definición de Role como enum externo para mayor escalabilidad.

Discusión sobre normalización de datos (por ejemplo, estandarizar teléfonos en el service).

Creación de UpdateUserDto usando PartialType(CreateUserDto) para poder actualizar campos de forma opcional manteniendo las validaciones existentes.

Preparación del UsersService con métodos básicos findAll, findOne, update, softDelete, remove y búsqueda por email, isActive y role.

Estrategia de soft delete + isActive para desactivar usuarios sin eliminar físicamente los registros.

Comentarios explicativos detallados en DTO, Entity y Service para servir como guía futura.


🧠 Aprendizajes

Diferencia clara entre Entity (nivel de base de datos) y DTO (nivel de entrada/salida de datos).

Cómo separar responsabilidades: la validación va en el DTO, no en la Entity.

Entendimiento de cómo trabajan los decoradores de TypeORM y class-validator.

Cómo usar PartialType para crear un DTO de actualización reutilizando las reglas de CreateUserDto.

Buenas prácticas de documentación: agregar comentarios explicativos sin sobrecargar el código.

Estrategias reales de manejo de usuarios inactivos (soft delete) utilizadas en empresas grandes.


⚙️ Desafíos

Definir validaciones que sean realistas pero flexibles, por ejemplo para formatos de teléfono internacionales.

Mantener coherencia entre las restricciones de Entity (DB) y DTO (entrada de usuario).

Decidir qué validaciones de negocio quedan en el service y cuáles en el DTO.

Comprender cómo combinar softDelete y isActive para no perder historial de usuarios.


💡 Tips

No mezclar validaciones de negocio con validaciones de esquema: DTO = validación de formato, Service = validación de lógica.

Guardar el teléfono en formato estandarizado (por ejemplo, +541155555555) tras limpiar espacios y símbolos.

Usar comentarios breves y significativos, no redundantes.

PartialType es muy útil para crear DTOs de actualización sin repetir código.


📘 Notas personales

Hoy entendí la diferencia entre validar estructura de datos (DTO) y persistencia (Entity).
Aprendí que las empresas grandes priorizan validaciones sólidas pero flexibles, especialmente en campos sensibles como contraseñas y teléfonos.
También empecé a construir una base sólida para futuros proyectos, reutilizando estructuras y buenas prácticas.
La estrategia de soft delete + isActive es un patrón real que evita pérdida de datos y facilita auditoría interna.


## Entity (DB) --> Se encarga de estructurar la tabla y definir restricciones a nivel base de datos.

Validaciones típicas aquí:
  nullable: false → obligatorio en la DB.
  unique: true → valor único en la tabla.
  length → limita el tamaño de la columna.
  default → valor por defecto si no se envía nada.
  type → limita el tipo de datos (string, number, enum, boolean, date, etc.).

No se hacen validaciones complejas aquí (como formato de email, longitud mínima de contraseña, regex, etc.), porque la DB no valida esos detalles.

| Capa       | Validaciones típicas                                                                   |
| ---------- | -------------------------------------------------------------------------------------- |
| **Entity** | Obligatorio, único, tipo de dato, longitud, default                                    |
| **DTO**    | Formato, longitud mínima/máxima, patrón, enum, optional, email válido, password segura |

## 💡 Tip: Siempre combinar ambas:
  Entity → protege la integridad en la DB.
  DTO → protege la integridad de la API y da mensajes de error claros al usuario.

----------------------------------------------------------------------------------------------------------

📅 Día 2 — Controllers, Guards, Decorators y Exception Filters

🚀 Avances

Implementación completa del UsersController con métodos CRUD (create, findAll, findOne, update, softDelete) usando UsersService.

Eliminación de try/catch repetitivo en cada método gracias al AllExceptionsFilter, logrando manejo centralizado de errores.

Integración de RolesGuard y Roles decorator para controlar acceso a endpoints según el rol del usuario (ADMIN, USER).

Aplicación de @Roles(RolesEnum.ADMIN) y @UseGuards(RolesGuard) a nivel de clase para que todo el controller requiera rol ADMIN.

Uso de ParseIntPipe para convertir parámetros id a número automáticamente.

Ajuste de métodos para softDelete en lugar de borrado físico.

🧠 Aprendizajes

Comprensión de cómo funcionan Exception Filters en NestJS para centralizar el manejo de errores y eliminar código repetitivo.

Entendimiento de Guards: cómo funcionan, cómo verificar roles y cómo integrarlos con Reflector y decoradores personalizados (@Roles).

Uso de enums para roles (RolesEnum) y cómo conectar la metadata del decorador con el guard.

Importancia de separar responsabilidades: 
DTO valida estructura, 
Service maneja lógica de negocio y duplicados, 
Controller expone rutas y aplica Guards/Filters.

Buenas prácticas de NestJS para mantener controladores limpios y legibles.

⚙️ Desafíos

Definir correctamente el alcance de los roles: decidir qué endpoints pueden ser accesibles por USER y cuáles solo por ADMIN.

Evitar repetición de lógica en responses (statusCode, message, data) y pensar en un helper para estandarizar.

Entender la interacción entre Guards, Decorators y Exception Filters dentro del flujo de NestJS.

💡 Tips

Poner @UseGuards a nivel de clase si todos los métodos comparten la misma política de roles.

Exception filters permiten eliminar todos los try/catch del controller y aún así manejar errores de manera uniforme.

Siempre usar ParseIntPipe para IDs provenientes de params para prevenir errores de tipo.

Decoradores personalizados (@Roles) + Guard permiten centralizar la lógica de permisos y mantener endpoints limpios.

📘 Notas personales

Hoy consolidé cómo manejar errores, roles y permisos de manera centralizada en NestJS. Aprendí que con Guards y Exception Filters, los controladores pueden ser mucho más limpios y mantenibles.

Próximo paso: completar los tests de UsersController y UsersService, incluyendo validaciones de roles, manejo de errores y soft delete.

----------------------------------------------------------------------------------------------------------

📅 Día 3 — Configuración de Jest y Testing de UsersService

🚀 Avances

Configuración de Jest para resolver imports con paths absolutos (src/...) mediante moduleNameMapper.

Ajuste de configuración para tests unitarios (package.json) y tests e2e (jest-e2e.json).

Implementación de helper de hash (hashPassword) usando bcrypt para encriptar contraseñas.

Integración de hashPassword en UsersService.create() para hashear contraseñas antes de guardarlas en la DB.

Corrección de mutación de DTOs: uso de spread operator para evitar modificar el objeto original.

Creación de tests unitarios para UsersService (create, duplicados, hash de contraseñas).

🧠 Aprendizajes

Jest no resuelve paths de TypeScript por defecto; se requiere configurar moduleNameMapper para mapear imports src/ a la ruta correcta según el rootDir.

El moduleNameMapper varía según la configuración: tests unitarios (rootDir: "src") vs tests e2e (rootDir: "../").

Mutación de objetos en JavaScript: cambiar createUserDto.password afecta referencias posteriores y rompe tests. Usar spread operator para copiar.

Jest en modo watch ejecuta tests relacionados con archivos modificados; usar filtros (p, t, f) para controlar qué tests correr.

La separación entre helpers (hash.ts) y servicios facilita testing y reutilización de lógica.

⚙️ Desafíos

Configurar Jest para que funcione tanto en tests unitarios como e2e con diferentes rootDirs.

Identificar por qué un test fallaba: la mutación del DTO hacía que la comparación devolviera el mismo valor.

Entender la diferencia entre mocks en tests: si el mock retorna el mismo objeto mutado, el test no detecta cambios.

💡 Tips

Siempre agregar moduleNameMapper cuando se usan paths absolutos en imports (src/...).

Usar spread operator al crear nuevos objetos a partir de DTOs para evitar mutaciones inesperadas.

Correr tests en watch mode (pnpm test:watch) durante desarrollo para feedback inmediato.

Presionar 'p' en Jest watch para filtrar por archivo de test específico.

Los helpers deben ser funciones puras (sin side effects) para facilitar testing.

📘 Notas personales

Hoy aprendí lo importante que es configurar correctamente el entorno de testing desde el inicio. Los errores de paths y mutaciones pueden ser muy frustrantes si no se entienden bien. Ahora tengo una base sólida de testing configurada para seguir avanzando.

Próximo paso: completar tests de UsersController y continuar con implementación de autenticación (auth module).

----------------------------------------------------------------------------------------------------------

📅 Día 4 — Mejoras en Testing y Arquitectura de Tests

🚀 Avances

Reorganización completa del archivo de tests según buenas prácticas de NestJS:
- Estructura con describe anidado (UsersService → create() → tests individuales)
- Factory functions para crear DTOs de prueba centralizados y reutilizables
- Mocking correcto de funciones importadas (jest.mock a nivel módulo) vs dependencias inyectadas (mockRepository)
- Comentarios didácticos y útiles como notas de alumno

Mejoras en el método update() del service:
- Implementación con FindOptionsWhere<User>[] para tipado correcto y evitar never[] en TypeScript
- Construcción dinámica del array where solo con campos presentes en el DTO (evita búsquedas con undefined)
- Manejo correcto de actualizaciones parciales (PATCH)
- Uso de Object.assign() para actualizar solo campos presentes
- Separación de responsabilidades: update() no maneja password (se hará en métodos separados: changePassword() y resetPassword())
- Comparación con ejemplos del mercado: validación de todos los campos únicos dinámicamente (superior a muchos ejemplos)

Completación de tests para create():
- Test de caso exitoso (happy path)
- Test de error de negocio (duplicado - ConflictException)
- Test de verificación de comportamiento (hash de password)
- Test de edge case (error de DB al guardar)

Aclaración de conceptos fundamentales:
- Migraciones vs synchronize: diferencias y cuándo usar cada uno
- expect vs await expect().rejects.toThrow(): cuándo usar cada uno
- PATCH no valida automáticamente: TypeScript/JavaScript no hacen validación de negocio, debemos programarla
- FindOptionsWhere<User>[]: tipo de TypeORM para condiciones where, evita problemas de tipado con arrays vacíos

🧠 Aprendizajes

Arquitectura de testing en NestJS:
- Estructura: describe('Servicio') → describe('método()') → it('debería hacer algo')
- Patrón AAA (Arrange-Act-Assert) en cada test
- beforeEach para setup, afterEach para cleanup (opcional)

Mocking en NestJS:
- Mock de dependencias inyectadas: van en mockRepository (que se inyecta en el módulo)
- Mock de funciones importadas: van con jest.mock() a nivel módulo (antes del describe)
- getRepositoryToken(User) genera el token correcto que TypeORM usa internamente

Factory functions:
- Centralizan datos de prueba, evitan repetición
- Permiten sobrescribir campos específicos con overrides
- Si cambia el DTO, solo se actualiza en un lugar

Estructura de tests:
- Un describe por servicio, describe anidado por método
- Facilita agregar más métodos sin cambiar la estructura
- Organización clara y escalable

Conceptos clave:
- expect() para verificar valores retornados
- await expect().rejects.toThrow() para verificar excepciones
- El método real se ejecuta, pero usa dependencias mockeadas
- No es necesario testear TODO, solo casos importantes y edge cases relevantes

Mejora del método update() - Tipos y validación:
- FindOptionsWhere<User>[]: tipo de TypeORM para condiciones where, type-safe y evita never[] en TypeScript
- Construcción dinámica de whereConditions: solo incluye campos presentes, evita búsquedas con undefined
- Object.assign() vs spread operator: Object.assign() es más explícito para actualizaciones parciales
- Validación de todos los campos únicos dinámicamente: más robusto que validar solo un campo
- PATCH es solo el método HTTP: la validación de existencia, duplicados y actualización se programa manualmente

Whitelist explícita vs confiar en DTO:
- Whitelist hardcodeada: más explícita y segura, pero requiere mantenimiento manual
- Confiar en DTO: menos código, pero si el DTO tiene campos sensibles, pueden actualizarse
- Mejor práctica: híbrida - whitelist explícita para campos sensibles, DTO para el resto

⚙️ Desafíos

Entender la diferencia entre mockear dependencias inyectadas vs funciones importadas (fue confuso inicialmente).

Comprender por qué getRepositoryToken(User) en vez de UserRepository (TypeORM no expone una clase UserRepository, usa tokens internos).

Decidir qué casos testear: no todos los edge cases son necesarios, priorizar los importantes.

Estructurar tests de forma profesional: encontrar el balance entre organización y complejidad.

Problema de TypeScript con arrays vacíos: inicializar `const arr = []` infiere `never[]`, requiere tipado explícito con FindOptionsWhere<User>[].

Decidir si usar whitelist explícita: balance entre seguridad (whitelist) y mantenibilidad (confiar en DTO). Depende del contexto y nivel de seguridad requerido.

Comprender que PATCH no valida automáticamente: inicialmente pensé que TypeScript/JavaScript hacían validación automática, pero toda la lógica de negocio se programa manualmente.

💡 Tips

Factory functions: crea una función que retorna un objeto base, permite overrides. Si cambia el DTO, solo actualizas la factory.

Mocking a nivel módulo: usa jest.mock() para funciones importadas (hashPassword), no para dependencias inyectadas (repository).

Estructura describe anidado: describe('Servicio') → describe('método()') → it('test'). Facilita agregar más métodos.

Edge cases: no todos son necesarios. Prioriza: happy path, errores de negocio, y edge cases críticos (DB, validaciones).

Separación de métodos: update() general no debe cambiar password. Usar métodos separados: changePassword() (autenticado) y resetPassword() (olvidó contraseña).

FindOptionsWhere<User>[]: usar este tipo de TypeORM para arrays de condiciones where. Evita problemas de tipado (never[]) y es type-safe.

Construcción dinámica de whereConditions: solo agregar condiciones para campos presentes en el DTO. Evita búsquedas ineficientes con undefined.

Object.assign() vs spread: Object.assign(user, updateUserDto) es más explícito para actualizaciones parciales. Spread operator también funciona pero es menos claro.

Whitelist hardcodeada: decidir según contexto. Si hay campos sensibles (email, password, role) que NO deben actualizarse, usar whitelist explícita. Si confías en el DTO, puede no ser necesario.

Comparación con mercado: mi código es superior a muchos ejemplos porque valida TODOS los campos únicos dinámicamente, no solo uno. Muchos ejemplos solo validan email o phone, no todos.

📘 Notas personales

Hoy consolidé mis conocimientos sobre testing en NestJS. Aprendí la diferencia clave entre mockear dependencias inyectadas (repository) vs funciones importadas (hashPassword). La estructura con describe anidado hace que los tests sean mucho más organizados y escalables.

También entendí mejor cuándo testear qué: no necesito testear absolutamente todo, solo los casos importantes y edge cases relevantes. Los factory functions son una herramienta poderosa que evita repetición y facilita mantenimiento.

Mejoré significativamente la arquitectura de mis tests comparado con el Día 3: ahora tengo una estructura profesional, comentarios útiles, y mejor organización. Los tests del método create() están completos y cubren casos esenciales.

Implementé mejoras en el método update() que lo hacen superior a muchos ejemplos del mercado: validación dinámica de todos los campos únicos, uso de FindOptionsWhere para type-safety, y construcción eficiente del array where. Comparé mi código con ejemplos reales y encontré que mi implementación es más robusta porque valida múltiples campos únicos dinámicamente, no solo uno.

Aprendí que PATCH es solo el método HTTP - toda la validación de negocio (existencia, duplicados, actualización) se programa manualmente. TypeScript/JavaScript no hacen validación automática de lógica de negocio.

El debate sobre whitelist explícita vs confiar en DTO depende del contexto: si hay campos sensibles (email, password, role) que no deben actualizarse, whitelist es mejor. Si el DTO está bien definido y confías en el frontend, puede no ser necesario.

Próximo paso: continuar con tests de otros métodos (findOne, update, softDelete) y luego avanzar con implementación de autenticación.

----------------------------------------------------------------------------------------------------------

📅 Día 5 — Revisión de Código, Mejoras de Tests y Tipado TypeScript

🚀 Avances

Revisión completa del código de UsersService y tests: feedback sobre coherencia, consistencia y buenas prácticas.

Completación de tests para update():
- Test de caso exitoso con campos únicos
- Test de NotFoundException cuando el usuario no existe
- Test de ConflictException cuando hay duplicados
- Test nuevo: actualización solo con campos no únicos (verifica que no se busquen conflictos innecesariamente)

Mejoras de tipado TypeScript:
- Tipado explícito de mockRepository: definición manual con jest.Mock para cada método
- Tipado de parámetros en mockImplementation: (dto: CreateUserDto) y (user: Partial<User>)
- Tipado de existingUser y conflictUser: Partial<User> para reflejar que en tests no necesitamos todos los campos

Correcciones menores:
- Comentario incorrecto corregido: "Conflicto de id" → "Usuario no encontrado"
- Verificación de que hashPassword no se llama en update() (se hace en métodos separados)
- Consistencia en verificaciones de excepciones: solo tipo de excepción, no mensaje

🧠 Aprendizajes

Tipado explícito en tests:
- mockRepository necesita tipo manual para que TypeScript reconozca métodos de jest.Mock (mockResolvedValue, mockImplementation)
- Partial<User> es útil en tests porque no necesitas todos los campos de la entidad
- Tipar parámetros de funciones mejora autocompletado y detecta errores antes

Cobertura de tests:
- No es necesario testear cada campo único por separado si la lógica es idéntica
- Test de actualización sin campos únicos es importante porque verifica comportamiento diferente (1 llamada vs 2 llamadas a findOne)
- Verificar que hashPassword no se llama en update() es importante para separación de responsabilidades

Consistencia en testing:
- Verificar solo el tipo de excepción (ConflictException) es suficiente y más mantenible que verificar mensaje exacto
- Comentarios descriptivos ayudan pero deben ser precisos (evitar "Conflicto" cuando es "No encontrado")

⚙️ Desafíos

Entender por qué TypeScript no reconocía métodos de jest.Mock sin tipado explícito: Pick<Repository> no funciona porque toma tipos reales, no jest.Mock.

Decidir qué tests adicionales son necesarios: test de actualización sin campos únicos es útil, pero tests por cada campo único no son necesarios si la lógica es idéntica.

Balance entre tipado explícito y verbosidad: más tipos = mejor autocompletado, pero también más código.

💡 Tips

Tipado de mocks: usar tipo manual { findOne: jest.Mock; create: jest.Mock; ... } en vez de Pick<Repository> porque TypeScript necesita saber que son jest.Mock.

Partial<User> en tests: refleja que no necesitas todos los campos, solo los que usas. Es más realista que crear un User completo.

Tests de comportamiento: verificar que hashPassword no se llama en update() es tan importante como verificar que sí se llama en create().

Consistencia en verificaciones: verificar solo el tipo de excepción es más mantenible. Si cambia el mensaje, el test no se rompe.

📘 Notas personales

Hoy aprendí la importancia del tipado explícito en tests. Aunque TypeScript puede inferir tipos, en tests es mejor ser explícito para que reconozca métodos de jest.Mock y mejore la experiencia de desarrollo.

También entendí mejor qué tests son realmente necesarios: no todos los edge cases, solo los que verifican comportamientos diferentes. El test de actualización sin campos únicos es importante porque verifica que el código es eficiente (no busca conflictos cuando no hay campos únicos).

Las mejoras de tipado hacen el código más robusto y facilitan el mantenimiento futuro. El autocompletado funciona mejor y TypeScript detecta errores antes.

Próximo paso: continuar con tests de otros métodos (findOne, findByEmail, findByRole) y luego avanzar con implementación de autenticación.

----------------------------------------------------------------------------------------------------------

📅 Día 6 — Implementación del Módulo de Autenticación (Auth)

🚀 Avances

- validateUser() movido a JWT Strategy (no va en service, es responsabilidad de Passport)
- generateToken(), refreshToken(), logout() en AuthService
- Separación clara entre lógica de negocio (service) y validación de tokens (strategy)

Implementación completa de métodos de autenticación:
- register(): usa usersService.create(), genera token, retorna usuario sin password
- login(): valida credenciales, verifica usuario activo, compara password, genera token
- generateToken(): crea payload JWT (sub, email, role) y firma token
- refreshToken(): renueva token validando usuario activo
- logout(): retorna mensaje de éxito (JWT stateless, cliente elimina token)

Creación de DTOs específicos:
- LoginDto: solo email y password (validaciones automáticas con ValidationPipe)
- Uso de CreateUserDto para register (no necesita DTO separado)

Creación de método interno en UsersService:
- findByEmailWithPassword(): método privado para autenticación que incluye password (addSelect)
- No se expone en controller (solo uso interno de AuthService)
- Retorna null en vez de lanzar excepción (para manejo en auth)

Correcciones y mejoras:
- Eliminación de código duplicado (validaciones, hashing)
- Eliminación de entidad Auth innecesaria

🧠 Aprendizajes

Arquitectura de autenticación en NestJS:
- Service: lógica de negocio (login, register, generar tokens)
- Strategy: validación de tokens JWT para Passport (validate() se ejecuta automáticamente)
- Separación clara: auth no tiene entity propia, usa User entity del módulo users

ValidationPipe automático:
- No se necesita if (!email), ValidationPipe valida automáticamente con decoradores del DTO
- Si el método se ejecuta, los datos YA están validados
- Los decoradores (@IsEmail, @IsNotEmpty, etc.) hacen toda la validación

Campos con select: false:
- Password tiene select: false en la entidad (no se incluye en consultas normales)
- Para autenticación, usar createQueryBuilder con addSelect('user.password')
- Crear método específico (findByEmailWithPassword) en lugar de modificar métodos públicos

Diseño de DTOs:
- LoginDto: solo lo necesario (email, password)
- Register: puede usar CreateUserDto directamente (tiene todos los campos)
- No crear DTOs innecesarios, reutilizar cuando tenga sentido

Seguridad en mensajes de error:
- Usar mismo mensaje "Credenciales inválidas" para usuario no existe y password incorrecto
- No revelar si el email existe o no (previene enumeración de usuarios)

Refresh token:
- Renueva token sin requerir login completo
- Dos enfoques: extraer userId del token JWT (recomendado) o recibir userId como parámetro
- El método en service valida usuario activo antes de generar nuevo token

⚙️ Desafíos

Manejo de password con select: false:
- Password no viene en consultas normales (seguridad)
- Necesidad de consulta especial para autenticación
- Solución: método específico con createQueryBuilder + addSelect

Organización de métodos:
- Orden lógico: generateToken primero (método auxiliar) o al final
- Convención: métodos públicos primero (register, login), auxiliares después

💡 Tips

No crear entities innecesarias: auth no necesita tabla propia, solo usa User.

ValidationPipe elimina validaciones manuales: si usas DTOs con decoradores, no necesitas if (!campo).

Separar responsabilidades: UsersService maneja datos, AuthService maneja autenticación.

Métodos internos vs públicos: findByEmailWithPassword es interno (no va en controller), findByEmail es público.

Mensajes de error consistentes: no revelar información sensible (si email existe o no).

Refresh token: extraer userId del token JWT es más seguro que recibirlo como parámetro.


📘 Notas personales

Hoy implementé gran parte del módulo de autenticación. Aprendí la importancia de separar responsabilidades correctamente: la validación de tokens va en la Strategy, la lógica de negocio en el Service. 
También entendí que ValidationPipe hace todo el trabajo de validación automáticamente, así que no necesito validaciones manuales.

La decisión de usar un método en UsersService vs repository directo fue importante: elegí el método porque centraliza el acceso a datos y mantiene mejor separación. El método findByEmailWithPassword es solo para uso interno, no se expone en el controller.


Próximo paso: implementar JWT Strategy completa, crear endpoints en AuthController, y configurar guards para proteger rutas.

----------------------------------------------------------------------------------------------------------

📅 Día 7 — Revisión de Auth y Users + Feedback Profesional

🚀 Avances

Revisión integral de los módulos `@auth` y `@users`, verificando imports, exports, responsabilidades y dependencias internas.

🧠 Aprendizajes

Entendimiento de por qué conviene exponer `AuthService` (y estrategias) en lugar de `JwtModule`/`PassportModule`, facilitando reuso y pruebas.

Importancia de configurar JWT via `registerAsync` + `ConfigModule` para soportar rotación de secretos y entornos múltiples.

Reconocimiento de que reutilizar `CreateUserDto` para registro es válido, pero un DTO específico de onboarding da flexibilidad a futuro.

Claridad sobre cómo los módulos deberían declararse consumidores explícitos de autenticación (importar `AuthModule`) para evitar dependencias implícitas.

⚙️ Desafíos

Planificar la migración a configuración asincrónica sin romper la funcionalidad actual ni tests existentes.

💡 Tips

Exportar servicios clave (`AuthService`, helpers) y mantener módulos compartidos pequeños mejora la escalabilidad y el testing.

Usar `ConfigService` para secretos y expiraciones evita hardcodes y facilita despliegues en múltiples entornos.

Mantener un módulo de seguridad compartido (guards, strategies, decorators) ayuda a aislar responsabilidades y a reutilizar lógica.

📘 Notas personales

Identifiqué qué ajustes necesito para llevarlo a nivel laboral: centralizar configuración, pulir exports y crear DTOs específicos cuando haga falta. Me motiva ver que las bases están sólidas y que los siguientes pasos son mejoras incrementales para llegar a estándares actuales reales.

----------------------------------------------------------------------------------------------------------

📅 Día 8 — Configuración Centralizada y Endpoints Tipados

🚀 Avances

- Configuración global de `ConfigModule` con `envConfig`, validando `PORT`, `DATABASE_URL`, `JWT_SECRET` y `JWT_EXPIRES_IN` para evitar arranques inconsistentes.
- `AuthModule` migrado a `JwtModule.registerAsync` usando `ConfigService`, asegurando lectura dinámica de secretos y expiraciones.
- `UsersController` protegido con `AuthGuard('jwt')` + `RolesGuard`, respuestas tipadas (`ApiResponse`, `ApiPaginatedResponse`) y endpoints adicionales para activos/inactivos/roles.
- `UsersService` extendido con paginación real (`findAll`), helpers específicos (`findByEmailWithPassword`) y control de campos restringidos en `update`.
- `AuthService` y `AuthController` devuelven `UserResponseDto`, consolidan `login/register/refresh/logout` y homogenizan mensajes de error.
- Generación de módulos base (`products`, `orders`, `cart`, `chat`, `payments`) listos para implementar lógica futura.

🧠 Aprendizajes

- `ConfigModule.registerAs` permite centralizar validaciones tempranas: si falta una variable crítica, la app no arranca.
- `JwtModule.registerAsync` + `ConfigService` simplifican rotación de secretos y soportan ambientes múltiples sin duplicar configuración.
- `ValidationPipe` global elimina la necesidad de pipes por endpoint y bloquea payloads maliciosos automáticamente.
- Decoradores personalizados (`@Roles`) combinados con guards hacen que la autorización sea declarativa y legible.
- Distinguir DTOs de respuesta (`UserResponseDto`) evita exponer campos sensibles y estandariza el contrato de la API.

⚙️ Desafíos

- Ajustar tests existentes para reflejar la nueva lógica de `UsersService.update`, que ahora bloquea campos sensibles sin chequear duplicados.
- Mantener sincronizados los tipos compartidos (`ApiResponse*`) cuando se agreguen nuevos endpoints o datos extra en las respuestas.
- Planificar la implementación real de los módulos recién generados sin perder la consistencia de la arquitectura actual.

💡 Tips

- Siempre validar variables de entorno al inicio: fallar rápido es mejor que descubrirlo en producción.
- Centralizar helpers (`hashPassword`, `toUserResponseDto`) evita duplicar lógica y facilita pruebas.
- Definir respuestas tipadas (DTOs/Interfaces) brinda contratos claros entre backend y frontend.
- Combinar paginación en base de datos (`findAndCount`) con filtros específicos mejora performance y claridad.

📘 Notas personales

La base del proyecto quedó alineada con prácticas actuales: configuración centralizada, seguridad aplicada de forma global y controladores declarativos. Los contratos de respuesta están tipados y listos para escalar. Próximo foco: avanzar con la implementación real de los módulos de negocio (productos, pedidos, pagos, etc.), en busqueda de un MVP. Una vez el "core" de la app este funcionando, preocuparse por tests, integraciones de APIs e IA, servicios externos, mejoras, etc.

----------------------------------------------------------------------------------------------------------

📅 Día 9 — Refactor de Configuración y Paginación Consistente

🚀 Avances

- Renombré y limpié la entidad base (`BaseAuditEntity`) para reutilizar timestamps sin crear tablas fantasma.
- Uniformé toda la paginación del módulo `users`: el service ahora calcula `page/limit/skip`, usa `findAndCount` para activos, inactivos y roles, y los controladores consumen la misma estructura de respuesta.
- Separé configuración JWT en `jwt.config.ts`, cargada vía `ConfigModule` junto a `envConfig`, y actualicé `AuthModule` + `JwtStrategy` para leer `jwt.secret`/`jwt.expiresIn`.
- Migré TypeORM a `forRootAsync` usando `ConfigService`, eliminando lecturas directas de `process.env`.
- Añadí `ParseEnumPipe` al endpoint `GET /users/role/:role` para rechazar valores fuera de `RolesEnum`.
- Ajusté `CreateUserDto` con `@Type(() => Number)` en `dni`, evitando falsos negativos cuando llega como string.

🧠 Aprendizajes

- Las entidades base deben ser clases abstractas sin `@Entity()`, así solo aportan columnas comunes.
- Centralizar la paginación en el service evita duplicar lógica y mantiene métricas consistentes.
- `registerAs` permite tener namespaces (`env`, `jwt`) independientes y reutilizables; con `ConfigService` todo queda tipado.
- `ParseEnumPipe` es la forma más directa de validar enums provenientes de params sin lógica manual.

⚙️ Desafíos

- Mantener sincronizados todos los módulos que dependen de config al introducir `forRootAsync`.
- Coordinar cambios en DTOs (transformaciones) con los tests existentes para que sigan pasando.

💡 Tips

- AL divididr la configuración, actualizar también las lecturas (`configService.get('jwt.secret')`) inmediatamente para evitar confusiones.
- Usar helpers privados en los services (`buildPagination`) para encapsular lógica repetitiva.
- Validar números con `@Type(() => Number)` + `@IsNumber` evita errores silenciosos con payloads JSON.

📘 Notas personales

Configuraciones duplicadas, validaciones laxas y paginación manual. El backend quedó más cercano a estándares reales, con responsabilidades claras y configuración lista para múltiples entornos. Próximo objetivo: seguir completando los módulos de negocio manteniendo este nivel de consistencia.

----------------------------------------------------------------------------------------------------------
