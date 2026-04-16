import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed...\n');

  // ─── Admin por defecto ───────────────────────────────────
  const passwordHash = await bcrypt.hash('password123', 10);

  const admin = await prisma.admin.upsert({
    where: { email: 'dj@takiplay.com' },
    update: {},
    create: {
      name: 'DJ Principal',
      email: 'dj@takiplay.com',
      passwordHash,
    },
  });
  console.log(`✅ Admin creado: ${admin.email}`);

  // ─── Mesas (5 mesas) ─────────────────────────────────────
  for (let i = 1; i <= 5; i++) {
    await prisma.table.upsert({
      where: { number: i },
      update: {},
      create: {
        number: i,
        qrCode: randomUUID(),
      },
    });
  }
  console.log('✅ 5 mesas creadas (números 1 al 5)');

  // ─── Canciones en Español ────────────────────────────────
  const songsEspanol = [
    { title: 'La Bamba', artist: 'Ritchie Valens', genre: 'Rock', duration: 135 },
    { title: 'Bésame Mucho', artist: 'Consuelo Velázquez', genre: 'Bolero', duration: 193 },
    { title: 'Cielito Lindo', artist: 'Quirino Mendoza', genre: 'Ranchera', duration: 148 },
    { title: 'Guantanamera', artist: 'Joseíto Fernández', genre: 'Son Cubano', duration: 210 },
    { title: 'Bamba Caliente', artist: 'Orquesta Tropical', genre: 'Salsa', duration: 245 },
    { title: 'Sabor a Mí', artist: 'Eydie Gormé', genre: 'Bolero', duration: 178 },
    { title: 'El Rey', artist: 'José Alfredo Jiménez', genre: 'Ranchera', duration: 162 },
    { title: 'Quizás Quizás', artist: 'Osvaldo Farrés', genre: 'Bolero', duration: 185 },
    { title: 'Moliendo Café', artist: 'Hugo Blanco', genre: 'Vals', duration: 220 },
    { title: 'Cucurrucucú Paloma', artist: 'Tomás Méndez', genre: 'Ranchera', duration: 195 },
  ];

  for (const s of songsEspanol) {
    await prisma.song.upsert({
      where: { id: `seed-es-${s.title.replace(/\s/g, '-').toLowerCase()}` },
      update: {},
      create: {
        id: `seed-es-${s.title.replace(/\s/g, '-').toLowerCase()}`,
        title: s.title,
        artist: s.artist,
        genre: s.genre,
        language: 'SPANISH',
        duration: s.duration,
        demoUrl: `http://localhost:3000/media/demos/${s.title.replace(/\s/g, '_').toLowerCase()}_demo.mp3`,
        fullUrl: `http://localhost:3000/media/full/${s.title.replace(/\s/g, '_').toLowerCase()}.mp3`,
        coverUrl: `http://localhost:3000/media/covers/${s.title.replace(/\s/g, '_').toLowerCase()}.jpg`,
      },
    });
  }
  console.log(`✅ ${songsEspanol.length} canciones en Español creadas`);

  // ─── Canciones en Kichwa ─────────────────────────────────
  const songsKichwa = [
    { title: 'Ñucanchik Llakta', artist: 'Conjunto Andino Taki', genre: 'Andino', duration: 215 },
    { title: 'Pacha Mama', artist: 'Inti Raymi', genre: 'Andino', duration: 240 },
    { title: 'Sumak Kawsay', artist: 'Kichwas del Norte', genre: 'Tradicional', duration: 198 },
    { title: 'Allpa Mama', artist: 'Rumiñahui', genre: 'Folklórico', duration: 185 },
    { title: 'Killa Raymi', artist: 'Conjunto Andino Taki', genre: 'Ceremonial', duration: 260 },
  ];

  for (const s of songsKichwa) {
    await prisma.song.upsert({
      where: { id: `seed-ki-${s.title.replace(/\s/g, '-').toLowerCase()}` },
      update: {},
      create: {
        id: `seed-ki-${s.title.replace(/\s/g, '-').toLowerCase()}`,
        title: s.title,
        artist: s.artist,
        genre: s.genre,
        language: 'KICHWA',
        duration: s.duration,
        demoUrl: `http://localhost:3000/media/demos/${s.title.replace(/\s/g, '_').toLowerCase()}_demo.mp3`,
        fullUrl: `http://localhost:3000/media/full/${s.title.replace(/\s/g, '_').toLowerCase()}.mp3`,
        coverUrl: `http://localhost:3000/media/covers/${s.title.replace(/\s/g, '_').toLowerCase()}.jpg`,
      },
    });
  }
  console.log(`✅ ${songsKichwa.length} canciones en Kichwa creadas`);

  // ─── Canciones en Achuar ─────────────────────────────────
  const songsAchuar = [
    { title: 'Amazonia Viva', artist: 'Shuar-Achuar Ensemble', genre: 'Tradicional', duration: 230 },
    { title: 'Juunt Nunkui', artist: 'Grupo Selva Sur', genre: 'Ceremonial', duration: 275 },
    { title: 'Tsunkina', artist: 'Achuar Cantores', genre: 'Folklórico', duration: 189 },
  ];

  for (const s of songsAchuar) {
    await prisma.song.upsert({
      where: { id: `seed-ac-${s.title.replace(/\s/g, '-').toLowerCase()}` },
      update: {},
      create: {
        id: `seed-ac-${s.title.replace(/\s/g, '-').toLowerCase()}`,
        title: s.title,
        artist: s.artist,
        genre: s.genre,
        language: 'ACHUAR',
        duration: s.duration,
        demoUrl: `http://localhost:3000/media/demos/${s.title.replace(/\s/g, '_').toLowerCase()}_demo.mp3`,
        fullUrl: `http://localhost:3000/media/full/${s.title.replace(/\s/g, '_').toLowerCase()}.mp3`,
        coverUrl: `http://localhost:3000/media/covers/${s.title.replace(/\s/g, '_').toLowerCase()}.jpg`,
      },
    });
  }
  console.log(`✅ ${songsAchuar.length} canciones en Achuar creadas`);

  console.log('\n🎉 Seed completado exitosamente!');
  console.log('─────────────────────────────────────────');
  console.log('  Credenciales del DJ:');
  console.log('  Email:    dj@takiplay.com');
  console.log('  Password: password123');
  console.log('─────────────────────────────────────────\n');
}

main()
  .catch((e) => {
    console.error('❌ Error en el seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
