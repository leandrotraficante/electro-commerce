import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
import { User } from "src/modules/users/entities/user.entity";
import { Category } from "src/modules/categories/entities/category.entity";
import { BaseEntity } from "src/common/entities/base.entity";

@Entity()
export class Product extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ length: 100, nullable: false })
    name: string;

    @Column({ length: 500, nullable: false })
    description: string;

    @Column({ unique: true, length: 30, nullable: false })
    sku: string;

    @Column({ type: 'decimal', precision: 10, scale: 2, nullable: false })
    price: number;

    @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
    discount: number; // Opcional, default 0

    @Column({ nullable: false, default: 1 })
    stock: number;

    @Column({ default: true })
    isActive: boolean;

    @ManyToOne(() => Category, (category) => category.products, {
        eager: true,
        nullable: false,
    })
    category: Category;

    @ManyToOne(() => User, (user) => user.products, {
        eager: true,
        nullable: false,
    })
    createdBy: User;
}
