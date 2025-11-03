import { CreateDateColumn, DeleteDateColumn, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

export class AbstractEntity<T> {
	@PrimaryGeneratedColumn()
	id: number;

	@CreateDateColumn({ name: 'created_at' })
	createdAt: Date;

	@UpdateDateColumn({ name: 'updated_at' })
	updatedAt: Date;

	@DeleteDateColumn({ name: 'deleted_at', nullable: true })
	deletedAt?: Date;

	constructor(entity: Partial<T>) {
		Object.assign(this, entity);
	}
}