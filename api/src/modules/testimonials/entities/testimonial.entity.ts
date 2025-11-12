import { AbstractEntity } from '@/database/abstract.entity';
import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity('testimonials')
@Index(['id'], { unique: true })
export class Testimonial extends AbstractEntity<Testimonial> {
	@PrimaryGeneratedColumn('uuid', { name: 'testimonial_id' })
	testimonialId: string;

	@Column({ type: 'varchar', length: 255 })
	customerName: string;

	@Column({ type: 'varchar', length: 255, nullable: true })
	customerTitle?: string;

	@Column({ type: 'varchar', length: 255, nullable: true })
	customerCompany?: string;

	@Column({ type: 'varchar', length: 255, nullable: true })
	customerEmail?: string;

	@Column({ type: 'varchar', length: 500, nullable: true })
	customerImage?: string;

	@Column({ type: 'text' })
	content: string;

	@Column({ type: 'int', default: 5 })
	rating: number;

	@Column({ type: 'boolean', default: true })
	isActive: boolean;

	@Column({ type: 'boolean', default: false })
	isFeatured: boolean;

	@Column({ type: 'int', default: 0 })
	sortOrder: number;

	@Column({ type: 'varchar', length: 50, default: 'general' })
	category: string; // general, product, service, etc.

	@Column({ type: 'date', nullable: true })
	testimonialDate?: Date;

	@Column({ type: 'text', nullable: true })
	videoUrl?: string;

	@Column({ type: 'varchar', length: 500, nullable: true })
	sourceUrl?: string; // where the testimonial came from

	@CreateDateColumn()
	createdAt: Date;

	@UpdateDateColumn()
	updatedAt: Date;
}