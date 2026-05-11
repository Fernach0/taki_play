import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Req,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'node:path';
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { SongsService } from './songs.service';
import { CreateSongDto } from './dto/create-song.dto';
import { UpdateSongDto } from './dto/update-song.dto';
import { FilterSongsDto } from './dto/filter-songs.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('songs')
export class SongsController {
  constructor(private readonly songsService: SongsService) {}

  // Rutas públicas (sin JWT)
  @Get()
  findAll(@Query() filters: FilterSongsDto) {
    return this.songsService.findAll(filters);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.songsService.findOne(id);
  }

  // Rutas protegidas (DJ)
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
  @Post(':id/cover')
  @UseInterceptors(
    FileInterceptor('cover', {
      storage: diskStorage({
        destination: (_req, _file, cb) => {
          const dest = join(process.cwd(), 'public', 'covers');
          mkdirSync(dest, { recursive: true });
          cb(null, dest);
        },
        filename: (req, file, cb) => {
          const ext = extname(file.originalname);
          cb(null, `${req.params.id}${ext}`);
        },
      }),
      fileFilter: (_req, file, cb) => {
        if (!file.mimetype.match(/image\/(jpg|jpeg|png|gif|webp)/)) {
          return cb(new BadRequestException('Solo se permiten imágenes (jpg, png, gif, webp)'), false);
        }
        cb(null, true);
      },
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  )
  uploadCover(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
    @Req() req: any,
  ) {
    if (!file) throw new BadRequestException('No se recibió ningún archivo');
    const host = req.get('host');
    const protocol = req.headers['x-forwarded-proto'] ?? req.protocol;
    const coverUrl = `${protocol}://${host}/covers/${file.filename}`;
    return this.songsService.updateCoverUrl(id, coverUrl);
  }
}
