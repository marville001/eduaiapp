import { AbstractEntity } from '@/database/abstract.entity';
import { Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { FooterColumn } from './footer-column.entity';

@Entity('footer_items')
@Index(['id'], { unique: true })
export class FooterItem extends AbstractEntity<FooterItem> {
	@PrimaryGeneratedColumn('uuid', { name: 'item_id' })
	itemId: string;

	@Column({ type: 'varchar', length: 255 })
	title: string;

	@Column({ type: 'varchar', length: 255 })
	slug: string;

	@Column({ type: 'varchar', length: 500, nullable: true })
	url?: string;

	@Column({ type: 'boolean', default: true })
	isActive: boolean;

	@Column({ type: 'int', default: 0 })
	sortOrder: number;

	@Column({ type: 'varchar', length: 50, default: '_self' })
	target: string; // _self, _blank, etc.

	@Column({ type: 'varchar', length: 100, nullable: true })
	icon?: string;

	@Column({ type: 'text', nullable: true })
	description?: string;

	// Foreign key to footer column
	@Column({ type: 'int' })
	columnId: number;

	@ManyToOne(() => FooterColumn, footerColumn => footerColumn.items, { onDelete: 'CASCADE' })
	@JoinColumn({ name: 'columnId', referencedColumnName: 'id' })
	column: FooterColumn;

	@CreateDateColumn()
	createdAt: Date;

	@UpdateDateColumn()
	updatedAt: Date;
}