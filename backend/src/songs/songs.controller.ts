import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  Res,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { Response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { SongsService } from './songs.service';
import { CreateSongDto } from './dto/create-song.dto';
import { UpdateSongDto } from './dto/update-song.dto';
import { FilterSongsDto } from './dto/filter-songs.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('songs')
export class SongsController {
  constructor(private readonly songsService: SongsService) {}

  @Get()
  findAll(@Query() filters: FilterSongsDto) {
    return this.songsService.findAll(filters);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.songsService.findOne(id);
  }

  @Get(':id/cover')
  async getCover(@Param('id') id: string, @Res() res: Response) {
    const song = await this.songsService.findCoverImage(id);
    if (!song.coverImage) throw new NotFoundException('Esta canción no tiene imagen');
    res.setHeader('Content-Type', song.coverMimeType ?? 'image/jpeg');
    res.setHeader('Cache-Control', 'public, max-age=31536000');
    res.send(song.coverImage);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() createSongDto: CreateSongDto) {
    return this.songsService.create(createSongDto);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateSongDto: UpdateSongDto) {
    return this.songsService.update(id, updateSongDto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.songsService.remove(id);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id/cover')
  async removeCover(@Param('id') id: string) {
    return this.songsService.removeCoverImage(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/cover')
  @UseInterceptors(
    FileInterceptor('cover', {
      storage: memoryStorage(),
      fileFilter: (_req, file, cb) => {
        if (!file.mimetype.match(/image\/(jpg|jpeg|png|gif|webp)/)) {
          return cb(new BadRequestException('Solo se permiten imágenes (jpg, png, gif, webp)'), false);
        }
        cb(null, true);
      },
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  )
  async uploadCover(@Param('id') id: string, @UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException('No se recibió ningún archivo');
    return this.songsService.updateCoverImage(id, file.buffer, file.mimetype);
  }
}
