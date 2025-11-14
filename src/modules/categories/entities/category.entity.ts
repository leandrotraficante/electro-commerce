import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Product } from 'src/modules/products/entities/product.entity';
import { BaseAuditEntity } from 'src/common/entities/base.audit.entity';

@Entity()
export class Category extends BaseAuditEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ length: 100, unique: true })
    name: string;

    @Column({ length: 300, nullable: true })
    description?: string;

    @OneToMany(() => Product, (product) => product.category)
    products: Product[];
}
