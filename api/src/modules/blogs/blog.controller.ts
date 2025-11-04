import { Roles } from '@/common/decorators/roles.decorator';
import { UserRole } from '@/common/enums/user-role.enum';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { CreateBlogDto } from './dto/create-blog.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';
import { BlogService } from './blog.service';

@Controller('blogs')
@UseGuards(JwtAuthGuard, RolesGuard)
export class BlogController {
  constructor(private readonly blogService: BlogService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  create(@Body() createBlogDto: CreateBlogDto) {
    return this.blogService.create(createBlogDto);
  }

  @Get()
  findAll(@Query('published') published?: string) {
    if (published === 'true') {
      return this.blogService.findPublished();
    }
    if (published === 'scheduled') {
      return this.blogService.findScheduled();
    }
    return this.blogService.findAll();
  }

  @Get('slug/:slug')
  findBySlug(@Param('slug') slug: string) {
    return this.blogService.findBySlug(slug);
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.blogService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  update(@Param('id') id: number, @Body() updateBlogDto: UpdateBlogDto) {
    return this.blogService.update(id, updateBlogDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  remove(@Param('id') id: number) {
    return this.blogService.remove(id);
  }

  @Patch(':id/views')
  incrementViews(@Param('id') id: number) {
    return this.blogService.incrementViews(id);
  }

  @Patch(':id/likes')
  incrementLikes(@Param('id') id: number) {
    return this.blogService.incrementLikes(id);
  }

  @Post('publish-scheduled')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  publishScheduledBlogs() {
    return this.blogService.publishScheduledBlogs();
  }
}