# League Reviews

Buscá a cualquier jugador de League of Legends por su Riot ID, mirá cómo viene jugando y leé (o escribí) reviews sobre cómo es tenerlo de equipo.

Sin login, sin cuentas: dejás tu review y listo.

---

## Qué hace

- **Búsqueda por Riot ID** — `Nombre#Tag`, con validación de formato antes de navegar.
- **Perfil del jugador** — rank de soloQ (tier, división, LP, wins/losses), campeones más jugados con winrate, y las últimas 5 partidas. Todo desde la API oficial de Riot.
- **Reviews** — texto libre (1-1000 caracteres), rating de 1 a 5 estrellas y hasta 3 tags de comportamiento.
- **Votos** — arriba/abajo en cada review, un voto por identidad, con toggle para sacarlo.
- **Top comentarios en la home** — las mejores reviews de toda la plataforma, ordenadas por score, cada una linkeando al perfil del jugador.
- **Moderación sin admin** — filtro de lenguaje al publicar, reportes de la comunidad y auto-ocultamiento a los 5 reports.
- **Anti-abuso** — identidad anónima por cookie y rate limiting por IP hasheada.

### Tags disponibles

`GOOD_SHOTCALLER` · `TOXIC_FLAMER` · `GOOD_CARRY` · `TEAM_PLAYER` · `INTING` · `GOOD_MECHANICS` · `BAD_ATTITUDE` · `FRIENDLY` · `GOES_AFK`

---

## Stack

| Capa                | Tecnología                                             |
| ------------------- | ------------------------------------------------------ |
| Frontend + Backend  | Next.js (App Router) + TypeScript                      |
| Estilos             | Tailwind CSS                                           |
| Base de datos       | PostgreSQL (Neon) + Prisma ORM                         |
| Datos externos      | Riot Games API (Account-V1, League-V4, Match-V5)       |
| Validación          | zod                                                    |
| Filtro de contenido | [`obscenity`](https://www.npmjs.com/package/obscenity) |
| Deploy              | Vercel                                                 |

---

## Requisitos previos

- Node.js 18.17+ y npm.
- Una **Development API Key** de [developer.riotgames.com](https://developer.riotgames.com/) — ojo: **expira cada 24 h** y hay que regenerarla a mano.
- Un proyecto en [Neon](https://neon.tech/) (o cualquier Postgres, pero Neon necesita las dos connection strings de abajo).

---

## Setup local

```bash
git clone <repo-url>
cd league-reviews
npm install

cp .env.example .env.local   # y completar los valores (ver abajo)

npx prisma migrate dev       # crea el schema en la base
npm run dev                  # http://localhost:3000
```

---

## Variables de entorno

| Variable               | Para qué sirve                                                                                             |
| ---------------------- | ---------------------------------------------------------------------------------------------------------- |
| `DATABASE_URL`         | Connection string **pooled** de Neon. La que usa la app en runtime.                                        |
| `DIRECT_URL`           | Connection string **directa** de Neon. Necesaria para `prisma migrate`.                                    |
| `RIOT_API_KEY`         | Development API Key de Riot. Expira cada 24 h.                                                             |
| `RIOT_ACCOUNT_REGION`  | Routing continental para Account-V1 y Match-V5: `americas` · `europe` · `asia` · `sea`. Default: `europe`. |
| `RIOT_PLATFORM_REGION` | Platform routing para League-V4: `euw1`, `na1`, `las`, etc. Default: `euw1`.                               |
| `RATE_LIMIT_SALT`      | Salt del hash de IPs. String aleatorio largo (`openssl rand -hex 32`).                                     |
| `NEXT_PUBLIC_SITE_URL` | URL pública del sitio (links absolutos y metadata).                                                        |

La región no está hardcodeada en ningún lado: cambiando estas dos env vars la app apunta a otro servidor.

---

## Estructura del proyecto

```
league-reviews/
  prisma/
    schema.prisma          # RiotAccount, Comment, CommentTag, Vote, Report, RateLimitBucket
    migrations/
  middleware.ts            # asegura la cookie anonId en toda request
  src/
    app/
      page.tsx             # Home: search bar + top comentarios
      player/[riotId]/     # Perfil del jugador (+ loading.tsx)
      api/comments/        # POST comentar, votar, reportar
    lib/
      db.ts                # Prisma client singleton
      riot/                # client (auth, 429, retries), regions, types
      anon.ts              # identidad anónima por cookie
      rateLimit.ts         # rate limiter por IP
      profanity.ts         # filtro de lenguaje
      hash.ts              # sha256(ip + salt)
      validation.ts        # esquemas zod
    components/            # SearchBar, PlayerCard, MatchList, CommentForm, VoteButtons, ...
    types/
```

Las páginas son Server Components y llaman directo a las funciones de `lib/` para el render inicial — sin round-trip HTTP a la propia API. Las mutaciones van por Route Handlers, invocados desde Client Components con `fetch`.

---

## Cómo funciona

### Cache de la Riot API

La dev key permite 20 req/s y 100 req cada 2 min, así que nada se pide dos veces si no hace falta. Los datos se guardan en la tabla `RiotAccount` con TTL diferenciado:

| Dato             | TTL                                   |
| ---------------- | ------------------------------------- |
| `puuid`          | No vence (es prácticamente inmutable) |
| Rank y stats     | 15 min                                |
| Últimas partidas | 10 min                                |

Solo se llama a Riot cuando el TTL correspondiente venció. El cliente maneja los 429 respetando `Retry-After` (un reintento con backoff; si persiste, sirve la cache existente) y los 404 con una página de "jugador no encontrado", no un 500 genérico.

El perfil tiene un botón de **Actualizar datos** que fuerza el refresh, limitado a 1 cada 2 minutos por IP y jugador.

### Identidad anónima

El middleware genera un `anonId` (UUID) en cookie la primera vez que entrás — `sameSite: lax`, un año de duración, legible por el cliente para poder mandarla en los POST. Con eso alcanza para evitar votos duplicados y reportes repetidos, sin pedirte una cuenta. El nickname es opcional, va en su propia cookie y es puramente display: no es único ni es una cuenta.

Borrar la cookie te da una identidad nueva. Es una limitación conocida y aceptada de un sistema sin login.

### Rate limiting y moderación

Las IPs nunca se guardan en claro: se hashean con `sha256(ip + RATE_LIMIT_SALT)` antes de tocar la base. Los contadores viven en la tabla `RateLimitBucket`, así que sobreviven a los reinicios de las funciones serverless.

Las reviews pasan por el filtro de `obscenity` al publicarse: si hay lenguaje prohibido se rechaza el envío con un mensaje explícito — nunca se censura en silencio. Los reportes de la comunidad ocultan un comentario automáticamente al llegar a 5, sin necesidad de panel de administración.

---

## Endpoints

Todas las mutaciones son `POST` y validan con zod antes de tocar la base.

| Endpoint                    | Body                                                         | Límite           |
| --------------------------- | ------------------------------------------------------------ | ---------------- |
| `/api/comments`             | `{ riotAccountId, body, rating, tags[], anonId, nickname? }` | 5 / hora por IP  |
| `/api/comments/[id]/vote`   | `{ anonId, value: 1 \| -1 }`                                 | 30 / hora por IP |
| `/api/comments/[id]/report` | `{ anonId, reason? }`                                        | 10 / hora por IP |

Los votos y los reportes son idempotentes por `(comentario, anonId)`: votar dos veces lo mismo saca el voto, votar distinto lo cambia, y el `score` se recalcula en la misma transacción.

---

## Scripts

```bash
npm run dev            # servidor de desarrollo
npm run build          # build de producción
npm run start          # servir el build
npm run lint           # ESLint
npx prisma studio      # inspeccionar la base
npx prisma migrate dev # aplicar migraciones en local
```

---

## Deploy

Está pensado para Vercel:

1. Cargar las 7 variables de entorno en el proyecto.
2. `prisma generate` corre en `postinstall`.
3. `prisma migrate deploy` corre en el build.

Detrás del proxy de Vercel, la IP real llega en `x-forwarded-for` — de ahí la toma el rate limiter.

---

## Roadmap

El plan de implementación paso a paso está en [`ROADMAP.md`](./ROADMAP.md), la especificación técnica completa en [`SPECS.md`](./SPECS.md) y las reglas de código en [`CODESTYLE.md`](./CODESTYLE.md).

Fuera del alcance del MVP, pero contemplado en el diseño del schema:

- Login / RSO de Riot.
- Leaderboard de toxicidad.
- Compartir reviews en redes.
- Karma de reviewer.
- Validar que solo puedas reviewear a alguien con quien jugaste.

El `anonId` está desacoplado de cualquier tabla de usuarios, así que se puede sumar un modelo `User` con FK nullable en `Comment` sin romper lo que ya existe.

---

## Nota legal

League Reviews no está afiliado, asociado, autorizado ni respaldado por Riot Games, ni tiene ninguna conexión oficial con la empresa. League of Legends y Riot Games son marcas registradas de Riot Games, Inc.
