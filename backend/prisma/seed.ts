import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { randomUUID } from 'node:crypto';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed...\n');

  // ─── Admin por defecto ───────────────────────────────────
  const passwordHash = await bcrypt.hash('password123', 10);

  const admin = await prisma.admin.upsert({
    where: { email: 'dj@takiplay.com' },
    update: { passwordHash },
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

  // ─── Helper idempotente para canciones ───────────────────
  async function upsertSong(data: {
    title: string;
    artist: string;
    album?: string;
    genre: string;
    language: 'SPANISH' | 'KICHWA' | 'ACHUAR' | 'OTHER';
    duration: number;
    demoUrl: string;
    fullUrl: string;
    coverUrl?: string;
    lyrics?: string;
  }) {
    const existing = await prisma.song.findFirst({
      where: { title: data.title, language: data.language },
    });
    if (!existing) {
      await prisma.song.create({ data });
      console.log(`   ♪ Creada: ${data.title} — ${data.artist}`);
    } else {
      console.log(`   ↩ Ya existe: ${data.title}`);
    }
  }

  // ─── Canciones en Kichwa ─────────────────────────────────
  console.log('\n🎵 Canciones en Kichwa:');

  await upsertSong({
    title: 'Munasquechay',
    artist: 'Los Kjarkas',
    album: 'Lo Mejor de Los Kjarkas',
    genre: 'Andino',
    language: 'KICHWA',
    duration: 210,
    demoUrl: 'http://localhost:3000/media/demos/munasquechay_demo.mp3',
    fullUrl: 'http://localhost:3000/media/full/munasquechay.mp3',
    coverUrl: 'http://localhost:3000/media/covers/munasquechay.jpg',
    lyrics: `Munasquechay
tuta punchay maskakunay
tarispa suscucunay warmisitay
munasquechay
tuta punchay maskakunay
tarispa suscucunay warmisitay

Qanraykullay ña karin viday
sonqo kullay sipasitay
qanraykullay ña karin viday
sonqo kullay sipasitay

mi buen amor
mi herida de amor mi verdad
mi credo, razón de vivir
mi lluvia de abril
mi buen amor
mi herida de amor mi verdad
mi credo, razón de vivir
mi lluvia de abril

gracias a ti mi triste vivir
pudo cambiar en un jardín
gracias a ti mi triste vivir
pudo cambiar en un jardín`,
  });

  await upsertSong({
    title: 'Mi Error',
    artist: 'Delfín Quishpe',
    genre: 'Andino',
    language: 'KICHWA',
    duration: 180,
    demoUrl: 'http://localhost:3000/media/demos/mi_error_demo.mp3',
    fullUrl: 'http://localhost:3000/media/full/mi_error.mp3',
    coverUrl: 'http://localhost:3000/media/covers/mi_error.png',
  });

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
