ElectroCommerce - Backend
=========================

Backend de un e-commerce de electrodomésticos desarrollado con NestJS, TypeORM y PostgreSQL (Neon).

------------------------------------------------------------
Estructura del proyecto
------------------------------------------------------------

/backend
├── src/
│   ├── modules/
│   │   ├── auth/
│   │   │   ├── auth.module.ts
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.service.ts
│   │   │   ├── dto/
│   │   │   └── entities/
│   │   ├── users/
│   │   ├── products/
│   │   ├── orders/
│   │   ├── cart/
│   │   └── chat/
│   ├── config/
│   │   └── database.config.ts  # configuración TypeORM (opcional)
│   └── app.module.ts           # módulo raíz
├── .env                        # variables de entorno
├── package.json
└── tsconfig.json

------------------------------------------------------------
Tecnologías utilizadas
------------------------------------------------------------

- NestJS 11 (framework principal)
- TypeORM 0.3.x (ORM para PostgreSQL)
- PostgreSQL (Neon)
- class-validator / class-transformer (validación de DTOs)
- dotenv (variables de entorno)
- bcrypt, JWT, Passport (auth)
- helmet, cors (seguridad)
- Jest + supertest (tests)
- Prettier + ESLint (formateo y linting)

------------------------------------------------------------
Instalación de dependencias
------------------------------------------------------------

# Dependencias principales
pnpm add @nestjs/typeorm typeorm pg
pnpm add class-validator class-transformer dotenv

# Dependencias de desarrollo
pnpm add -D @nestjs/cli jest @types/jest ts-jest ts-node @nestjs/testing

> No se incluyen dependencias que ya vienen con `nest new`.

------------------------------------------------------------
Configuración de la base de datos (Neon)
------------------------------------------------------------

Archivo `.env` en la raíz:

DATABASE_URL=postgresql://<usuario>:<password>@<host>/<db>?sslmode=require&channel_binding=require

Archivo `src/app.module.ts`:

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './modules/users/users.module';
import { ProductsModule } from './modules/products/products.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL,
      autoLoadEntities: true,
      synchronize: true, // solo desarrollo
    }),
    UsersModule,
    ProductsModule,
    // otros módulos
  ],
})
export class AppModule {}

- autoLoadEntities: true → carga automáticamente todas las entities de los módulos
- synchronize: true → crea/actualiza tablas automáticamente (solo desarrollo)

------------------------------------------------------------
Módulos creados
------------------------------------------------------------

**Módulos generados (estructura completa):**
- auth → autenticación y autorización (JWT + bcrypt + Passport)
- users → gestión de usuarios ✅ **CONECTADO Y FUNCIONAL**
- products → gestión de productos
- orders → gestión de pedidos
- cart → carrito de compras
- chat → chat en tiempo real
- payments → gestión de pagos

**Estado actual:**
- ✅ **Solo UsersModule está conectado en app.module.ts**
- ✅ **Entidad User completamente implementada**
- ❌ **Otros módulos están creados pero NO conectados**
- ❌ **Servicios con código placeholder (no implementados)**

Cada módulo incluye:

controller.ts
service.ts
dto/        # DTOs para validación de entrada y salida
entities/   # Entities para TypeORM
spec.ts     # tests unitarios generados por NestJS CLI

------------------------------------------------------------
Scripts disponibles
------------------------------------------------------------

"scripts": {
  "build": "nest build",
  "format": "prettier --write \"src/**/*.ts\" \"test/**/*.ts\"",
  "start": "nest start",
  "start:dev": "nest start --watch",
  "start:debug": "nest start --debug --watch",
  "start:prod": "node dist/main",
  "lint": "eslint \"{src,apps,libs,test}/**/*.ts\" --fix",
  "test": "jest",
  "test:watch": "jest --watch",
  "test:cov": "jest --coverage",
  "test:debug": "node --inspect-brk -r tsconfig-paths/register -r ts-node/register node_modules/.bin/jest --runInBand",
  "test:e2e": "jest --config ./test/jest-e2e.json"
}

- start:dev → levantar la app en modo watch
- test → correr los tests unitarios
- format / lint → formatear y corregir código

------------------------------------------------------------
Estado actual del proyecto
------------------------------------------------------------

- [x] Proyecto creado con `nest new`
- [x] Dependencias necesarias instaladas
- [x] Módulos generados (auth, users, products, orders, cart, chat, payments) con DTOs, entities y tests
- [x] Configuración de conexión a Neon (PostgreSQL) lista
- [x] Variables de entorno definidas en .env
- [x] **Entidad User completamente implementada** (campos básicos + dirección + roles)
- [x] **Sistema de roles implementado** (user/admin por defecto)
- [x] **Registro escalonado** (básico + perfil opcional)
- [x] **Seguridad implementada** (password protegido, campos opcionales)
- [x] **Solo UsersModule conectado en app.module.ts**
- [ ] **Otros módulos NO conectados** (auth, products, orders, cart, chat, payments)
- [ ] **Servicios con código placeholder** (no implementados realmente)
- [ ] DTOs con validaciones (en progreso)
- [ ] Servicios con lógica real de TypeORM (pendiente)
- [ ] Sistema de autenticación JWT (pendiente)
- [ ] Endpoints funcionales (pendiente)

------------------------------------------------------------
Entidad User Implementada
------------------------------------------------------------

La entidad User está completamente implementada siguiendo las mejores prácticas del mercado:

**Campos Obligatorios (Registro):**
- email (único, 150 caracteres)
- password (protegido con select: false)
- firstName (100 caracteres)
- lastName (100 caracteres)

**Campos Opcionales (Perfil):**
- phone (20 caracteres)
- address (100 caracteres)
- city (100 caracteres)
- postalCode (10 caracteres)
- country (100 caracteres)

**Sistema de Control:**
- isActive (boolean, default: true)
- role (string, default: 'user') - soporta 'user' y 'admin'
- createdAt (timestamp automático)
- updatedAt (timestamp automático)

**Características:**
- ✅ Registro escalonado (como Amazon/MercadoLibre)
- ✅ Dirección opcional en registro, obligatoria en checkout
- ✅ Sistema de roles implementado
- ✅ Seguridad (password protegido)
- ✅ Validaciones de longitud apropiadas

------------------------------------------------------------
Notas
------------------------------------------------------------

- synchronize: true es útil para desarrollo, no usar en producción. Para producción se recomienda usar migraciones (TypeORM CLI o DataSource.runMigrations())
- La entidad User sigue el patrón de registro escalonado usado por las principales plataformas de e-commerce
