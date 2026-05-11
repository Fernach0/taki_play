import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSongDto } from './dto/create-song.dto';
import { UpdateSongDto } from './dto/update-song.dto';
import { FilterSongsDto } from './dto/filter-songs.dto';

const PUBLIC_SONG_SELECT = {
  id: true,
  title: true,
  artist: true,
  album: true,
  genre: true,
  language: true,
  duration: true,
  demoUrl: true,
  coverUrl: true,
  lyrics: true,
  isActive: true,
};

@Injectable()
export class SongsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(filters: FilterSongsDto) {
    const { search, language, genre, artist, includeInactive } = filters;

    return this.prisma.song.findMany({
      where: {
        ...(includeInactive ? {} : { isActive: true }),
        AND: [
          search
            ? {
                OR: [
                  { title: { contains: search, mode: 'insensitive' } },
                  { artist: { contains: search, mode: 'insensitive' } },
                ],
              }
            : {},
          language ? { language } : {},
          genre ? { genre: { contains: genre, mode: 'insensitive' } } : {},
          artist ? { artist: { contains: artist, mode: 'insensitive' } } : {},
        ],
      },
      select: PUBLIC_SONG_SELECT,
      orderBy: { title: 'asc' },
    });
  }

  async findOne(id: string) {
    const song = await this.prisma.song.findUnique({
      where: { id },
      select: PUBLIC_SONG_SELECT,
    });

    if (!song) {
      throw new NotFoundException('Canción no encontrada');
    }

    return song;
  }

  async create(createSongDto: CreateSongDto) {
    return this.prisma.song.create({ data: createSongDto });
  }

  async update(id: string, updateSongDto: UpdateSongDto) {
    await this.findOneForAdmin(id);

    return this.prisma.song.update({
      where: { id },
      data: updateSongDto,
    });
  }

  async remove(id: string) {
    await this.findOneForAdmin(id);

    await this.prisma.song.update({
      where: { id },
      data: { isActive: false },
    });

    return { message: 'Canción desactivada exitosamente', id };
  }

  async updateCoverUrl(id: string, coverUrl: string | null) {
    await this.findOneForAdmin(id);
    return this.prisma.song.update({
      where: { id },
      data: { coverUrl },
    });
  }

  async findOneForAdmin(id: string) {
    const song = await this.prisma.song.findUnique({ where: { id } });
    if (!song) {
      throw new NotFoundException('Canción no encontrada');
    }
    return song;
  }
}
