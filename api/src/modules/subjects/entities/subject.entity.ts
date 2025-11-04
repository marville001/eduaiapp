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

  @Column({ type: 'text', nullable: true })
  aiPrompt?: string;

  // SEO Fields
  @Column({ type: 'varchar', length: 255, nullable: true })
  seoTitle?: string;

  @Column({ type: 'text', nullable: true })
  seoDescription?: string;

  @Column({ type: 'simple-array', nullable: true })
  seoTags?: string[];

  @Column({ type: 'varchar', length: 500, nullable: true })
  seoImage?: string;

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
