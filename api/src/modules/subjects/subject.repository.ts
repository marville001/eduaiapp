import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Subject } from './entities/subject.entity';

@Injectable()
export class SubjectRepository extends Repository<Subject> {
  constructor(private dataSource: DataSource) {
    super(Subject, dataSource.createEntityManager());
  }

  async findBySlug(slug: string): Promise<Subject | null> {
    return this.findOne({
      where: { slug }
    });
  }


  async findByIdWithRelations(id: number): Promise<Subject | null> {
    return this.findOne({
      where: { id },
      relations: ['parentSubject']
    });
  }

  async findBySlugWithRelations(slug: string): Promise<Subject | null> {
    return this.findOne({
      where: { slug },
      relations: ['parentSubject']
    });
  }
}
