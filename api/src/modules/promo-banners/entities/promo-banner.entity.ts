import { Column, Entity, Index } from 'typeorm';
import { AbstractEntity } from '../../../database/abstract.entity';

@Entity('promo_banners')
@Index(['id'], { unique: true })
export class PromoBanner extends AbstractEntity<PromoBanner> {
	@Column({ type: 'varchar', length: 255 })
	title: string;

	@Column({ type: 'text', nullable: true })
	description: string;

	@Column({ type: 'varchar', length: 500, nullable: true })
	imageUrl: string;

	@Column({ type: 'varchar', length: 100 })
	buttonText: string;

	@Column({ type: 'varchar', length: 500 })
	buttonUrl: string;

	@Column({ type: 'varchar', length: 50, default: 'primary' })
	buttonVariant: string;

	@Column({ type: 'boolean', default: true })
	isActive: boolean;

	@Column({ type: 'int', default: 0 })
	sortOrder: number;

	@Column({ type: 'varchar', length: 50, default: 'ai-tutor' })
	placement: string; // Where the banner appears: 'ai-tutor', 'homepage', etc.
}
