import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { SubjectRepository } from './subject.repository';
import { CreateSubjectDto } from './dto/create-subject.dto';
import { UpdateSubjectDto } from './dto/update-subject.dto';
import { Subject } from './entities/subject.entity';

@Injectable()
export class SubjectService {
  constructor(
    private readonly subjectRepository: SubjectRepository,
  ) { }

  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  async create(createSubjectDto: CreateSubjectDto): Promise<Subject> {

    const slug = this.generateSlug(createSubjectDto.name);

    const existing = await this.subjectRepository.findBySlug(slug,);

    if (existing) {
      throw new ConflictException(
        `Subject with name "${createSubjectDto.name}" already exists.`
      );
    }

    const subject = this.subjectRepository.create({
      ...createSubjectDto,
      slug
    });

    return this.subjectRepository.save(subject);
  }

  async findAll(parentId?: number): Promise<Subject[]> {
    const whereClause = parentId ? { parentSubjectId: parentId } : {};
    return this.subjectRepository.find({
      where: whereClause,
      order: { createdAt: 'ASC' },
      relations: ['parentSubject']
    });
  }

  async findOne(id: number): Promise<Subject> {
    const subject = await this.subjectRepository.findByIdWithRelations(id);

    if (!subject) {
      throw new NotFoundException(`Subject with ID ${id} not found`);
    }

    return subject;
  }

  async findBySlug(slug: string): Promise<Subject> {
    const subject = await this.subjectRepository.findBySlugWithRelations(slug);

    if (!subject) {
      throw new NotFoundException(`Subject with slug "${slug}" not found`);
    }

    return subject;
  }

  async update(id: number, updateSubjectDto: UpdateSubjectDto): Promise<Subject> {
    const subject = await this.subjectRepository.findOne({ where: { id } });

    if (!subject) {
      throw new NotFoundException(`Subject with ID ${id} not found`);
    }

    Object.assign(subject, updateSubjectDto);

    return this.subjectRepository.save(subject);
  }

  async remove(id: number): Promise<void> {
    const subject = await this.subjectRepository.findOne({ where: { id } });

    if (!subject) {
      throw new NotFoundException(`Subject with ID ${id} not found`);
    }

    await this.subjectRepository.remove(subject);
  }
}
