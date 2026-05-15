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
          search ? { OR: [
            { title: { contains: search, mode: 'insensitive' } },
            { artist: { contains: search, mode: 'insensitive' } },
          ] } : {},
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
    const song = await this.prisma.song.findUnique({ where: { id }, select: PUBLIC_SONG_SELECT });
    if (!song) throw new NotFoundException('Canción no encontrada');
    return song;
  }

  async create(createSongDto: CreateSongDto) {
    return this.prisma.song.create({ data: createSongDto, select: PUBLIC_SONG_SELECT });
  }

  async update(id: string, updateSongDto: UpdateSongDto) {
    await this.findOneForAdmin(id);
    return this.prisma.song.update({ where: { id }, data: updateSongDto, select: PUBLIC_SONG_SELECT });
  }

  async remove(id: string) {
    await this.findOneForAdmin(id);
    await this.prisma.song.update({ where: { id }, data: { isActive: false } });
    return { message: 'Canción desactivada exitosamente', id };
  }

  async updateCoverImage(id: string, buffer: Buffer, mimeType: string) {
    await this.findOneForAdmin(id);
    return this.prisma.song.update({
      where: { id },
      data: { coverImage: buffer, coverMimeType: mimeType },
      select: PUBLIC_SONG_SELECT,
    });
  }

  async removeCoverImage(id: string) {
    await this.findOneForAdmin(id);
    return this.prisma.song.update({
      where: { id },
      data: { coverImage: null, coverMimeType: null },
      select: PUBLIC_SONG_SELECT,
    });
  }

  async findCoverImage(id: string) {
    const song = await this.prisma.song.findUnique({
      where: { id },
      select: { coverImage: true, coverMimeType: true },
    });
    if (!song) throw new NotFoundException('Canción no encontrada');
    return song;
  }

  async updateDemoAudio(id: string, buffer: Buffer, mimeType: string) {
    await this.findOneForAdmin(id);
    return this.prisma.song.update({
      where: { id },
      data: { demoAudio: buffer, demoMimeType: mimeType },
      select: PUBLIC_SONG_SELECT,
    });
  }

  async updateFullAudio(id: string, buffer: Buffer, mimeType: string) {
    await this.findOneForAdmin(id);
    return this.prisma.song.update({
      where: { id },
      data: { fullAudio: buffer, fullMimeType: mimeType },
      select: PUBLIC_SONG_SELECT,
    });
  }

  async findAudio(id: string, type: 'demo' | 'full') {
    const select = type === 'demo'
      ? { demoAudio: true, demoMimeType: true }
      : { fullAudio: true, fullMimeType: true };
    const song = await this.prisma.song.findUnique({ where: { id }, select });
    if (!song) throw new NotFoundException('Canción no encontrada');
    return song;
  }

  async findOneForAdmin(id: string) {
    const song = await this.prisma.song.findUnique({ where: { id }, select: { id: true } });
    if (!song) throw new NotFoundException('Canción no encontrada');
    return song;
  }
}
