import { AbstractEntity } from '@/database/abstract.entity';
import { Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity('navbar_menus')
@Index(['id'], { unique: true })
export class NavbarMenu extends AbstractEntity<NavbarMenu> {
	@PrimaryGeneratedColumn('uuid', { name: 'menu_id' })
	menuId: string;

	@Column({ type: 'varchar', length: 255 })
	title: string;

	@Column({ type: 'varchar', length: 255, unique: true })
	slug: string;

	@Column({ type: 'varchar', length: 500, nullable: true })
	url?: string;

	@Column({ type: 'boolean', default: true })
	isActive: boolean;

	@Column({ type: 'int', default: 0 })
	sortOrder: number;

	// Self-referencing for nested menus
	@Column({ type: 'int', nullable: true })
	parentId?: number;

	@ManyToOne(() => NavbarMenu, navbarMenu => navbarMenu.children, { onDelete: 'CASCADE' })
	@JoinColumn({ name: 'parentId', referencedColumnName: 'id' })
	parent?: NavbarMenu;

	@OneToMany(() => NavbarMenu, navbarMenu => navbarMenu.parent)
	children?: NavbarMenu[];

	// Navigation properties
	@Column({ type: 'varchar', length: 50, default: '_self' })
	target: string; // _self, _blank, etc.

	@Column({ type: 'varchar', length: 100, nullable: true })
	icon?: string;

	@Column({ type: 'text', nullable: true })
	description?: string;

	@CreateDateColumn()
	createdAt: Date;

	@UpdateDateColumn()
	updatedAt: Date;
}