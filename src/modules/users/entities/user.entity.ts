import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, OneToMany } from 'typeorm';
import { RolesEnum } from 'src/common/enums/enums';
import { Product } from 'src/modules/products/entities/product.entity';
import { BaseAuditEntity } from 'src/common/entities/base.audit.entity';

@Entity() //  Marca la clase como una entidad (tabla en la base de datos)
export class User extends BaseAuditEntity {
  @PrimaryGeneratedColumn() //  Columna auto incremental (PRIMARY KEY)
  id: number;

  @Column({ unique: true, length: 150, nullable: false }) //  Columna normal con restricciones (única, longitud máxima, obligatoria)
  email: string; // email del usuario y user de ingreso a la aplicación

  @Column({ select: false, nullable: false }) //  'select: false' evita que se devuelva en consultas
  password: string;

  @Column({ length: 100, nullable: false })
  firstName: string; // nombre del usuario

  @Column({ length: 100, nullable: false })
  lastName: string; // apellido del usuario

  @Column({ unique: true, length: 20, nullable: false })
  phone: string; // Teléfono con formato internacional, ej: "+54 9 11 1234 5678"

  @Column({ type: 'bigint', unique: true, nullable: false })
  dni: number; // Documento de identidad, 7-12 dígitos obligatorio y único

  @Column({ type: 'date', nullable: true })
  birthDate: Date; // fecha de nacimiento del usuario

  @Column({ nullable: true, length: 100 }) //  Campo opcional
  address?: string; // dirección

  @Column({ nullable: true, length: 100 }) //  Campo opcional
  city?: string; // ciudad

  @Column({ nullable: true, length: 10 }) //  Campo opcional
  postalCode?: string; // código postal

  @Column({ nullable: true, length: 100 }) //  Campo opcional
  country?: string; // país

  @Column({ default: true }) //  Valor por defecto: true
  isActive: boolean; // indica si el usuario está activo o no

  @Column({ type: 'enum', enum: RolesEnum, default: RolesEnum.USER, nullable: false }) //  Enum: solo acepta los valores definidos en RolesEnum
  role: RolesEnum; // rol del usuario (admin, user, etc.)

  @OneToMany(() => Product, (product) => product.createdBy)
  products: Product[];
}