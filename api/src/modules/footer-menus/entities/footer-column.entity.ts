import { AbstractEntity } from '@/database/abstract.entity';
import { Column, CreateDateColumn, Entity, Index, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { FooterItem } from './footer-item.entity';

@Entity('footer_columns')
@Index(['id'], { unique: true })
export class FooterColumn extends AbstractEntity<FooterColumn> {
	@PrimaryGeneratedColumn('uuid', { name: 'column_id' })
	columnId: string;

	@Column({ type: 'varchar', length: 255 })
	title: string;

	@Column({ type: 'varchar', length: 255, unique: true })
	slug: string;

	@Column({ type: 'boolean', default: true })
	isActive: boolean;

	@Column({ type: 'int', default: 0 })
	sortOrder: number;

	@Column({ type: 'text', nullable: true })
	description?: string;

	@OneToMany(() => FooterItem, (footerItem: FooterItem) => footerItem.column, { cascade: ['remove'] })
	items?: FooterItem[];

	@CreateDateColumn()
	createdAt: Date;

	@UpdateDateColumn()
	updatedAt: Date;
}