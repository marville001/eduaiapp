import { AbstractEntity } from '@/database/abstract.entity';
import { Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity('subjects')
@Index(['id'], { unique: true })
export class Subject extends AbstractEntity<Subject> {
  @PrimaryGeneratedColumn('uuid', { name: 'subject_id' })
  subjectId: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 255 })
  slug: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'int', nullable: true })
  parentSubjectId?: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Subject, (subject) => subject.parentSubject)
  subSubjects: Subject[];

  @ManyToOne(() => Subject, (subject) => subject.subSubjects)
  @JoinColumn({ name: 'parent_subject_id', referencedColumnName: 'id' })
  parentSubject?: Subject;
}
