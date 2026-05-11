-- =============================================================
-- INGENIERÍA INVERSA — TAKI PLAY
-- Base de datos: PostgreSQL (Supabase)
-- Generado desde: backend/prisma/schema.prisma
-- Propósito: reconstruir el MER a partir de la estructura real
-- =============================================================

-- ─────────────────────────────────────────────
-- 1. ENUMERACIONES (TIPOS PERSONALIZADOS)
-- ─────────────────────────────────────────────

CREATE TYPE "Language" AS ENUM (
  'SPANISH',
  'KICHWA',
  'ACHUAR',
  'OTHER'
);

CREATE TYPE "QueueStatus" AS ENUM (
  'PENDING',
  'PLAYING',
  'PLAYED',
  'CANCELLED'
);

-- ─────────────────────────────────────────────
-- 2. TABLAS (sin claves foráneas primero)
-- ─────────────────────────────────────────────

-- 2.1 ADMINS
-- Almacena las cuentas de los administradores / DJs del sistema.
CREATE TABLE admins (
  id            VARCHAR(36)   PRIMARY KEY DEFAULT gen_random_uuid(),
  name          VARCHAR(255)  NOT NULL,
  email         VARCHAR(255)  NOT NULL UNIQUE,
  "passwordHash" VARCHAR(255) NOT NULL,
  "createdAt"   TIMESTAMP     NOT NULL DEFAULT NOW(),
  "updatedAt"   TIMESTAMP     NOT NULL
);

-- 2.2 TABLES (mesas del local)
-- Representa cada mesa física del establecimiento.
CREATE TABLE tables (
  id          VARCHAR(36)   PRIMARY KEY DEFAULT gen_random_uuid(),
  number      INTEGER       NOT NULL UNIQUE,
  "qrCode"    VARCHAR(255)  NOT NULL UNIQUE,
  "isActive"  BOOLEAN       NOT NULL DEFAULT TRUE,
  "createdAt" TIMESTAMP     NOT NULL DEFAULT NOW()
);

-- 2.3 SONGS (catálogo de canciones)
-- Catálogo de canciones disponibles para karaoke.
CREATE TABLE songs (
  id          VARCHAR(36)   PRIMARY KEY DEFAULT gen_random_uuid(),
  title       VARCHAR(255)  NOT NULL,
  artist      VARCHAR(255)  NOT NULL,
  album       VARCHAR(255),
  genre       VARCHAR(100)  NOT NULL,
  language    "Language"    NOT NULL,
  duration    INTEGER       NOT NULL,   -- duración en segundos
  "demoUrl"   TEXT          NOT NULL,
  "fullUrl"   TEXT          NOT NULL,
  "coverUrl"  TEXT,
  lyrics      TEXT,
  "isActive"  BOOLEAN       NOT NULL DEFAULT TRUE,
  "createdAt" TIMESTAMP     NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP     NOT NULL
);

-- 2.4 TABLE_SESSIONS (sesiones de mesa)
-- Registra cada vez que un cliente escanea el QR de una mesa.
CREATE TABLE table_sessions (
  id           VARCHAR(36)  PRIMARY KEY DEFAULT gen_random_uuid(),
  "tableId"    VARCHAR(36)  NOT NULL,
  "clientName" VARCHAR(255),
  "createdAt"  TIMESTAMP    NOT NULL DEFAULT NOW(),
  "expiresAt"  TIMESTAMP
);

-- 2.5 QUEUE_ITEMS (cola de reproducción)
-- Registra cada canción pedida por una mesa.
CREATE TABLE queue_items (
  id            VARCHAR(36)   PRIMARY KEY DEFAULT gen_random_uuid(),
  "tableId"     VARCHAR(36)   NOT NULL,
  "songId"      VARCHAR(36)   NOT NULL,
  "requestedBy" VARCHAR(255),
  status        "QueueStatus" NOT NULL DEFAULT 'PENDING',
  position      INTEGER       NOT NULL,
  "createdAt"   TIMESTAMP     NOT NULL DEFAULT NOW(),
  "updatedAt"   TIMESTAMP     NOT NULL
);

-- ─────────────────────────────────────────────
-- 3. CLAVES FORÁNEAS (RELACIONES)
-- ─────────────────────────────────────────────

-- table_sessions → tables (N:1)
-- Una mesa puede tener muchas sesiones; cada sesión pertenece a una mesa.
ALTER TABLE table_sessions
  ADD CONSTRAINT fk_table_sessions_table
  FOREIGN KEY ("tableId")
  REFERENCES tables(id)
  ON DELETE CASCADE;

-- queue_items → tables (N:1)
-- Muchos items de cola pertenecen a una mesa.
ALTER TABLE queue_items
  ADD CONSTRAINT fk_queue_items_table
  FOREIGN KEY ("tableId")
  REFERENCES tables(id)
  ON DELETE CASCADE;

-- queue_items → songs (N:1)
-- Muchos items de cola referencian una canción.
ALTER TABLE queue_items
  ADD CONSTRAINT fk_queue_items_song
  FOREIGN KEY ("songId")
  REFERENCES songs(id)
  ON DELETE CASCADE;

-- ─────────────────────────────────────────────
-- 4. ÍNDICES (rendimiento)
-- ─────────────────────────────────────────────

CREATE INDEX idx_queue_items_status    ON queue_items(status);
CREATE INDEX idx_queue_items_table_id  ON queue_items("tableId");
CREATE INDEX idx_queue_items_song_id   ON queue_items("songId");
CREATE INDEX idx_table_sessions_table  ON table_sessions("tableId");
CREATE INDEX idx_songs_language        ON songs(language);
CREATE INDEX idx_songs_is_active       ON songs("isActive");

-- ─────────────────────────────────────────────
-- 5. DIAGRAMA DE RELACIONES (comentario MER)
-- ─────────────────────────────────────────────
--
--   admins          (entidad independiente — sin FK)
--      |
--      · (no relacionada directamente con otras tablas)
--
--   tables ──────────────────────────┐
--      │  1                          │ 1
--      │                             │
--      │ N                           │ N
--   table_sessions            queue_items ──── N ──── songs
--
--
--  CARDINALIDADES:
--    tables        1 ──── N    table_sessions
--    tables        1 ──── N    queue_items
--    songs         1 ──── N    queue_items
--
-- =============================================================
