import { Roles } from '@/common/decorators/roles.decorator';
import { UserRole } from '@/common/enums/user-role.enum';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { CreateSubjectDto } from './dto/create-subject.dto';
import { UpdateSubjectDto } from './dto/update-subject.dto';
import { SubjectService } from './subject.service';

@Controller('subjects')
export class SubjectController {
  constructor(private readonly subjectService: SubjectService) { }

  @Post()
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  create(@Body() createSubjectDto: CreateSubjectDto) {
    return this.subjectService.create(createSubjectDto);
  }

  @Get()
  findAll(
    @Query('parentId') parentId?: number,
    @Query('onlyActive') onlyActive?: boolean
  ) {
    return this.subjectService.findAll(parentId ?? 0, onlyActive);
  }

  @Get('hierarchical')
  findAllHierarchical(
    @Query('onlyActive') onlyActive?: boolean
  ) {
    return this.subjectService.findAllHierarchical(onlyActive);
  }

  @Get('slug/:slug')
  findBySlug(@Param('slug') slug: string,) {
    return this.subjectService.findBySlug(slug);
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.subjectService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  update(@Param('id') id: number, @Body() updateSubjectDto: UpdateSubjectDto) {
    return this.subjectService.update(id, updateSubjectDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  remove(@Param('id') id: number) {
    return this.subjectService.remove(id);
  }
}
