import { Column, Entity, Index } from 'typeorm';
import { AbstractEntity } from '../../../database/abstract.entity';

@Entity('faqs')
@Index(['id'], { unique: true })
export class Faq extends AbstractEntity<Faq> {
	@Column({ type: 'varchar', length: 500 })
	question: string;

	@Column({ type: 'text' })
	answer: string;

	@Column({ type: 'boolean', default: true })
	isActive: boolean;

	@Column({ type: 'int', default: 0 })
	sortOrder: number;
}