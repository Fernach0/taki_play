# Taki Play — Requisitos y Alcance del Sistema

> **Proyecto:** Sistema de Karaoke Intercultural  
> **Versión:** 1.0  
> **Fecha:** Mayo 2026  
> **Stack:** NestJS · PostgreSQL · Next.js · Socket.IO

---

## 1. Contexto del Proyecto

**Taki Play** es una plataforma de karaoke diseñada para espacios culturales que buscan valorizar la música indígena ecuatoriana (Kichwa y Achuar) junto al español. Los clientes escanean un código QR desde su mesa para solicitar canciones; el DJ gestiona la cola desde un panel de administración con actualizaciones en tiempo real.

---

## 2. Requisitos Funcionales

Los requisitos funcionales describen **qué debe hacer** el sistema.

### RF-01 · Autenticación de Administradores
- El sistema debe permitir el inicio de sesión de usuarios administradores (DJ) mediante correo electrónico y contraseña.
- El sistema debe emitir un token JWT con expiración de 8 horas al autenticarse correctamente.
- El sistema debe proteger todos los endpoints de administración con autenticación JWT.
- El sistema debe rechazar credenciales inválidas con un error descriptivo.

### RF-02 · Gestión de Canciones
- El sistema debe permitir registrar canciones con los atributos: título, artista, álbum, género, idioma, duración, URL de demo, URL completa, portada y letra.
- El sistema debe soportar los idiomas: **Español, Kichwa, Achuar y Otro**.
- El sistema debe permitir buscar canciones por texto libre (título, artista).
- El sistema debe permitir filtrar canciones por idioma, género y artista.
- El sistema debe permitir activar/desactivar canciones sin eliminarlas de la base de datos (borrado lógico).
- El sistema debe permitir actualizar la información de una canción existente.

### RF-03 · Gestión de Mesas
- El sistema debe permitir crear mesas con un número único y un código QR asociado único.
- El sistema debe permitir listar todas las mesas activas con el conteo de canciones pendientes en su cola.
- El sistema debe permitir ver los detalles de una mesa incluyendo sus ítems de cola actuales.
- El sistema debe permitir desactivar una mesa sin eliminarla.
- El sistema debe permitir actualizar los datos de una mesa.

### RF-04 · Sesiones de Mesa (Clientes)
- El sistema debe crear una sesión de cliente cuando este escanea el código QR de una mesa.
- El sistema debe asociar cada sesión a una mesa específica.
- El sistema debe admitir registrar opcionalmente el nombre del cliente.
- El sistema debe manejar una fecha de expiración opcional para las sesiones.

### RF-05 · Cola de Canciones
- El sistema debe permitir a los clientes agregar canciones a la cola de su mesa usando su ID de sesión.
- El sistema debe mantener un orden de posición para los ítems en cola.
- El sistema debe registrar quién solicitó la canción (nombre del solicitante, opcional).
- El sistema debe restringir un **mínimo de 6 minutos de cooldown** entre solicitudes desde la misma mesa.
- El sistema debe limitar a un **máximo de 10 canciones pendientes** por mesa en cualquier momento.
- El sistema debe permitir al DJ actualizar el estado de un ítem de cola.
- El sistema debe permitir al DJ cancelar/eliminar un ítem de la cola.
- El sistema debe proveer una vista global de la cola de todas las mesas para el DJ.

### RF-06 · Ciclo de Vida del Estado de la Cola
- Los ítems de cola deben seguir el flujo:
  ```
  PENDING → PLAYING → PLAYED
                    ↘ CANCELLED
  ```
- Solo puede haber una canción en estado `PLAYING` a la vez por mesa.

### RF-07 · Comunicación en Tiempo Real
- El sistema debe emitir actualizaciones de cola via WebSocket cada vez que un ítem es agregado, modificado o eliminado.
- El sistema debe notificar via WebSocket qué canción está en reproducción actual.
- Los clientes y el DJ deben poder unirse a la "sala" de una mesa específica para recibir solo las actualizaciones relevantes.

### RF-08 · Panel de Administración (DJ)
- El DJ debe poder ver todas las mesas y sus colas activas.
- El DJ debe poder marcar canciones como "reproduciendo", "reproducida" o "cancelada".
- El DJ debe poder gestionar el catálogo de canciones (crear, editar, activar/desactivar).
- El DJ debe poder gestionar las mesas (crear, editar, activar/desactivar).

### RF-09 · Interfaz de Cliente (Escaneo QR)
- El cliente debe poder acceder a la plataforma escaneando el QR de su mesa.
- El cliente debe poder buscar canciones y filtrarlas por idioma/género.
- El cliente debe poder solicitar una canción desde su mesa.
- El cliente debe poder ver el estado actual de la cola de su mesa en tiempo real.

---

## 3. Requisitos No Funcionales

Los requisitos no funcionales describen **cómo debe comportarse** el sistema.

### RNF-01 · Seguridad
- Las contraseñas deben almacenarse con hash **bcrypt** (nunca en texto plano).
- Los tokens JWT deben firmarse con una clave secreta segura.
- Los endpoints de administración deben requerir autenticación en cada request.
- El sistema no debe exponer información sensible (contraseñas, tokens internos) en respuestas de la API.

### RNF-02 · Rendimiento
- La API debe responder en menos de **500 ms** en condiciones normales de operación.
- Las actualizaciones de cola via WebSocket deben propagarse en menos de **200 ms** desde el evento.
- El catálogo de canciones debe ser paginable/filtrable para evitar cargas masivas.

### RNF-03 · Disponibilidad
- El sistema debe soportar múltiples mesas activas simultáneamente sin degradación de servicio.
- Las sesiones de WebSocket deben reconectarse automáticamente ante desconexiones momentáneas.

### RNF-04 · Usabilidad
- La interfaz de cliente debe ser completamente funcional en **dispositivos móviles** (acceso mediante QR).
- El tiempo de incorporación de un cliente desde el escaneo del QR hasta solicitar una canción no debe superar **2 minutos**.
- La UI debe soportar un tema oscuro con paleta de colores culturalmente alineada (Oro Inca, Verde Selva, Marrón Suelo).

### RNF-05 · Mantenibilidad
- El código fuente debe estar organizado por módulos (NestJS) con responsabilidades claramente separadas.
- El esquema de base de datos debe gestionarse mediante migraciones versionadas de Prisma.
- Los DTOs deben validar las entradas con decoradores de `class-validator`.

### RNF-06 · Escalabilidad
- La arquitectura debe permitir agregar nuevos idiomas de música sin cambios estructurales al enum `Language`.
- El sistema de WebSocket debe soportar múltiples salas (una por mesa) de forma independiente.

### RNF-07 · Portabilidad y Despliegue
- El backend debe estar contenerizado con **Docker**.
- El backend debe ser desplegable en **Railway.app** con configuración `railway.toml`.
- Las variables de entorno deben administrarse mediante archivos `.env` separados por ambiente.

### RNF-08 · Interoperabilidad
- La API debe exponer endpoints REST en el prefijo `/api/v1`.
- La comunicación en tiempo real debe usar el protocolo **Socket.IO** (compatible con WebSockets estándar).
- El frontend debe consumir la API usando **Axios** con interceptores para adjuntar JWT automáticamente.

---

## 4. Alcance del Sistema — ¿Qué SÍ puede hacer?

| # | Capacidad |
|---|-----------|
| ✅ 1 | Gestión completa del catálogo de canciones (CRUD) con soporte multilingüe (ES, Kichwa, Achuar) |
| ✅ 2 | Creación y gestión de mesas con códigos QR únicos por mesa |
| ✅ 3 | Sesiones de cliente vinculadas a mesa mediante escaneo de QR |
| ✅ 4 | Sistema de cola de canciones con reglas de negocio (cooldown 6 min, max 10 pendientes) |
| ✅ 5 | Seguimiento del estado de cada canción en cola (PENDING → PLAYING → PLAYED/CANCELLED) |
| ✅ 6 | Panel de control en tiempo real para el DJ con actualizaciones via WebSocket |
| ✅ 7 | Autenticación segura para administradores con JWT |
| ✅ 8 | Búsqueda y filtrado de canciones por texto, idioma y género |
| ✅ 9 | Vista de cola global (todas las mesas) para el DJ |
| ✅ 10 | Interfaz responsive optimizada para móviles (clientes) y escritorio (DJ) |
| ✅ 11 | Seeder de base de datos para datos iniciales (admin por defecto, mesas, canciones de ejemplo) |
| ✅ 12 | Despliegue contenerizado con Docker y soporte para Railway.app |

---

## 5. Fuera del Alcance — ¿Qué NO puede hacer?

| # | Limitación | Razón / Contexto |
|---|------------|------------------|
| ❌ 1 | **Reproducción de audio** dentro de la plataforma | El sistema gestiona la cola y almacena URLs de audio, pero la reproducción ocurre en sistema externo (equipo del DJ). |
| ❌ 2 | **Pagos o facturación** de canciones | No existe módulo de cobro, carrito de compras ni integración con pasarelas de pago. |
| ❌ 3 | **Registro propio de clientes** (cuentas de usuario) | Los clientes acceden mediante sesión de mesa, no crean cuentas ni perfil propios. |
| ❌ 4 | **Historial personalizado por cliente** | No hay sistema de favoritos, historial de canciones escuchadas ni recomendaciones por usuario. |
| ❌ 5 | **Múltiples venues/locales** | El sistema no maneja un concepto de "local" o "sucursal"; está diseñado para un único establecimiento. |
| ❌ 6 | **Carga directa de archivos de audio** | Las canciones se registran con URLs externas; no existe almacenamiento propio de archivos de audio. |
| ❌ 7 | **Control del hardware de reproducción** | No existe integración con reproductores físicos, parlantes, ni software de DJ (p. ej. DJ Pro). |
| ❌ 8 | **Múltiples roles de administrador** | Solo existe un tipo de administrador (DJ/Admin); no hay roles diferenciados (superadmin, operador, etc.). |
| ❌ 9 | **Notificaciones push o SMS** | No se envían notificaciones fuera de la plataforma cuando una canción está por reproducirse. |
| ❌ 10 | **Modo offline** | La plataforma requiere conexión a internet activa; no funciona sin acceso al servidor. |
| ❌ 11 | **Internacionalización de la UI (i18n)** | La interfaz está en español; no hay soporte dinámico para cambiar el idioma de la aplicación. |
| ❌ 12 | **Reportes y analíticas avanzadas** | No hay dashboards de estadísticas, canciones más pedidas, horas pico, ni exportación de datos. |

---

## 6. Restricciones de Negocio

| Regla | Valor | Descripción |
|-------|-------|-------------|
| Cooldown entre pedidos | **6 minutos** | Una mesa no puede pedir otra canción hasta que hayan pasado 6 minutos desde su última solicitud. |
| Máximo de pendientes | **10 canciones** | Si una mesa ya tiene 10 canciones en estado `PENDING`, no puede agregar más hasta que alguna sea reproducida o cancelada. |
| Token de sesión | **8 horas** | El JWT del DJ expira a las 8 horas de haber iniciado sesión. |
| Identificación de mesa | **QR único** | Cada mesa tiene un QR irrepetible; dos mesas no pueden compartir el mismo código. |

---

## 7. Glosario

| Término | Definición |
|---------|------------|
| **Mesa** | Unidad física del local identificada por un número y un QR único. |
| **Sesión de Mesa** | Registro temporal que conecta a un cliente con una mesa específica, creado al escanear el QR. |
| **Cola** | Lista ordenada de canciones solicitadas para una mesa, gestionada por el DJ. |
| **Ítem de Cola** | Registro individual de una solicitud de canción: incluye canción, mesa, estado y posición. |
| **DJ / Admin** | Usuario autenticado con acceso al panel de control. |
| **Cooldown** | Periodo mínimo de espera entre solicitudes de canciones por la misma mesa. |
| **Demo URL / Full URL** | La URL demo es un fragmento corto (para previsualización); Full URL es la canción completa para reproducir. |
