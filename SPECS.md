# League Reviews — Especificación técnica (MVP)

## 1. Resumen

Web para buscar jugadores de League of Legends por Riot ID (`Nombre#Tag`), ver su perfil (últimas 5 partidas + stats generales vía Riot API oficial) y dejar/leer reviews de texto libre con rating, tags, y voto arriba/abajo. La home destaca los comentarios mejor valorados de toda la plataforma, linkeando al perfil correspondiente. Sin login: moderación vía identidad anónima por cookie + rate limiting por IP + reportes.

Fuera de alcance (documentado, no implementado en el MVP): login/RSO de Riot, leaderboard de toxicidad, compartir en redes, karma de reviewer, "solo podés reviewear si jugaste con esa persona". El schema está diseñado para no bloquear agregarlas después (ver §10).

## 2. Stack

- **Frontend/Backend**: Next.js (App Router) + TypeScript, Tailwind CSS.
- **Base de datos**: PostgreSQL (Neon) + Prisma ORM.
- **Fuente de datos externa**: Riot Games API oficial (Account-V1, League-V4, Match-V5), dev API key.
- **Deploy**: Vercel.
- **Validación**: zod.
- **Filtro de contenido**: librería `obscenity` (npm).

## 3. Dependencias externas a conseguir

- Cuenta developer en https://developer.riotgames.com/ → **Development API Key** (expira cada 24h, se regenera manualmente en desarrollo; Production Key queda fuera del MVP).
- Cuenta en **Neon** (Postgres serverless) — connection string pooled (`DATABASE_URL`) y directa (`DIRECT_URL`, requerida por Neon para `prisma migrate`).
- Cuenta en **Vercel** para deploy.
- Región Riot inicial: **EUW1 / europe** (configurable por env var, no hardcodeada). Account-V1 usa regiones continentales (americas/europe/asia/sea); Match-V5 y League-V4 usan platform routing (na1, euw1, etc).

## 4. Estructura de carpetas

```
league-reviews/
  prisma/
    schema.prisma
    migrations/
  middleware.ts                       # asegura cookie anonId en toda request
  src/
    app/
      layout.tsx
      page.tsx                        # Home: search bar + top comentarios
      globals.css
      player/
        [riotId]/
          page.tsx                    # Perfil del jugador
          loading.tsx
      api/
        comments/
          route.ts                    # POST crear comentario
          [id]/
            vote/route.ts             # POST votar
            report/route.ts           # POST reportar
    lib/
      db.ts                           # Prisma client singleton
      riot/
        client.ts                     # fetch wrapper (auth, 429 handling, retries)
        regions.ts                    # mapeo continental <-> platform
        types.ts                      # tipos de respuestas Riot API
      anon.ts                         # gestión de cookie de identidad anónima
      rateLimit.ts                    # rate limiter por IP (tabla RateLimitBucket)
      profanity.ts                    # filtro con "obscenity"
      hash.ts                         # sha256(ip + salt)
      validation.ts                   # esquemas zod
    components/
      SearchBar.tsx PlayerCard.tsx MatchList.tsx MatchItem.tsx
      RankSummary.tsx ChampionStatsGrid.tsx CommentForm.tsx CommentList.tsx
      CommentItem.tsx VoteButtons.tsx TagSelector.tsx StarRating.tsx
      TopCommentsFeed.tsx ReportButton.tsx
    types/index.ts
  .env.example
  next.config.ts
```

**Decisión de arquitectura**: las páginas (Server Components) llaman directo a funciones de `lib/` para el render inicial — sin round-trip HTTP interno a la propia API. Las mutaciones (comentar, votar, reportar) van por Route Handlers, invocadas desde Client Components vía `fetch`.

## 5. Esquema de base de datos (Prisma)

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model RiotAccount {
  id               String    @id @default(cuid())
  puuid            String    @unique
  gameName         String
  tagLine          String
  platformRegion   String    // "euw1", "na1", etc.

  soloTier         String?
  soloRank         String?
  soloLp           Int?
  soloWins         Int?
  soloLosses       Int?
  topChampions     Json?     // [{ championId, games, winrate }]
  lastMatchIds     Json?
  lastMatchesData  Json?     // payload resumido de las últimas 5 partidas
  statsUpdatedAt   DateTime?
  matchesUpdatedAt DateTime?

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  comments Comment[]

  @@index([gameName, tagLine])
}

model Comment {
  id            String      @id @default(cuid())
  riotAccountId String
  riotAccount   RiotAccount @relation(fields: [riotAccountId], references: [id], onDelete: Cascade)

  body   String @db.Text
  rating Int    // 1-5
  tags   CommentTag[]

  anonId   String   // uuid en cookie del autor
  nickname String?  // opcional
  ipHash   String   // sha256(ip + salt), nunca IP en claro

  upvotes   Int @default(0)
  downvotes Int @default(0)
  score     Int @default(0) // upvotes - downvotes, desnormalizado e indexado

  isHidden  Boolean  @default(false) // auto-oculto tras N reports
  createdAt DateTime @default(now())

  votes   Vote[]
  reports Report[]

  @@index([riotAccountId])
  @@index([score])
  @@index([createdAt])
}

model CommentTag {
  id        String      @id @default(cuid())
  commentId String
  comment   Comment     @relation(fields: [commentId], references: [id], onDelete: Cascade)
  tag       ReviewTag

  @@unique([commentId, tag])
}

enum ReviewTag {
  GOOD_SHOTCALLER
  TOXIC_FLAMER
  GOOD_CARRY
  TEAM_PLAYER
  INTING
  GOOD_MECHANICS
  BAD_ATTITUDE
  FRIENDLY
  GOES_AFK
}

model Vote {
  id        String   @id @default(cuid())
  commentId String
  comment   Comment  @relation(fields: [commentId], references: [id], onDelete: Cascade)
  anonId    String
  value     Int      // 1 = up, -1 = down
  createdAt DateTime @default(now())

  @@unique([commentId, anonId])
}

model Report {
  id        String   @id @default(cuid())
  commentId String
  comment   Comment  @relation(fields: [commentId], references: [id], onDelete: Cascade)
  anonId    String
  reason    String?
  createdAt DateTime @default(now())

  @@unique([commentId, anonId])
}

model RateLimitBucket {
  id          String   @id @default(cuid())
  key         String   @unique // ej: "ip:<hash>:comment"
  count       Int      @default(0)
  windowStart DateTime @default(now())
}
```

Notas:

- `score` se recalcula transaccionalmente junto al upsert de `Vote`, evitando agregaciones costosas en el feed de home.
- `CommentTag` como tabla relacional (no array nativo) para poder indexar/filtrar por tag e integridad referencial.
- `RateLimitBucket` en Postgres alcanza para el volumen de un MVP; sobrevive a reinicios de funciones serverless. Migrar a Redis/Upstash es mejora futura, no necesaria ahora.

## 6. Rutas y páginas

- **`GET /`**: `SearchBar` (client component, valida formato `Nombre#Tag`, `router.push('/player/' + encodeURIComponent('Nombre#Tag'))`) + `TopCommentsFeed` (Server Component, `getTopComments(limit=20)` ordenado por `score desc, createdAt desc`, excluyendo `isHidden`).
- **`GET /player/[riotId]`**: `riotId` es el Riot ID completo url-encoded (`encodeURIComponent('Nombre#Tag')`, ej `/player/Faker%23KR1`).
  1. Decodificar y parsear `gameName`/`tagLine`.
  2. `getPlayerData(gameName, tagLine)` (cache-first, ver §7).
  3. 404 si el jugador no existe en Riot.
  4. Render: `PlayerCard`, `RankSummary`, `ChampionStatsGrid`, `MatchList` (5 items), y debajo `CommentForm` + `CommentList`.
  - `loading.tsx` con skeleton (la resolución contra Riot puede tardar 1-2s).

## 7. Integración y cache de Riot API

- `resolveRiotAccount(gameName, tagLine)`: Account-V1 (`/riot/account/v1/accounts/by-riot-id/{gameName}/{tagLine}`) → `puuid`; League-V4 (`/lol/league/v4/entries/by-puuid/{puuid}`) → rank; Match-V5 (`/lol/match/v5/matches/by-puuid/{puuid}/ids?count=5` + `GET .../matches/{matchId}` x5) → últimas partidas.
- Cache-first en `RiotAccount` con TTL diferenciado:
  - puuid: prácticamente inmutable, no vence.
  - rank/stats (`statsUpdatedAt`): **15 min**.
  - partidas (`matchesUpdatedAt`): **10 min**.
- Solo se llama a Riot si el TTL venció — mitigación principal contra los límites de la dev key (20 req/1s, 100 req/2min) bajo tráfico concurrente de múltiples jugadores.
- Botón "Actualizar datos" opcional en el perfil: fuerza refresh, rate-limited a 1 cada 2 min por IP+jugador.
- `lib/riot/client.ts` maneja 429 con `Retry-After` (1 reintento con backoff; si persiste, servir cache existente o error controlado) y 404 (jugador no encontrado → página de error clara, no 500 genérico).

## 8. API de mutaciones

- **`POST /api/comments`** — body `{ riotAccountId, body, rating, tags[], anonId, nickname? }`:
  1. Validar con zod (texto 1-1000 chars, rating entero 1-5, tags del enum, máx 3 tags).
  2. `containsProfanity(body)` → si true, rechazar con mensaje claro (no censura silenciosa).
  3. `checkRateLimit` por IP hasheada (5/hora).
  4. Crear `Comment` + `CommentTag[]` en transacción.
  5. `revalidatePath` de la página del jugador y de home.
- **`POST /api/comments/[id]/vote`** — body `{ anonId, value: 1 | -1 }`:
  1. Rate limit 30/hora por IP.
  2. Upsert en `Vote` respetando `@@unique([commentId, anonId])`: mismo valor → no-op/toggle a quitar voto; valor distinto → actualiza.
  3. Recalcular `upvotes`/`downvotes`/`score` transaccionalmente.
- **`POST /api/comments/[id]/report`** — body `{ anonId, reason? }`:
  1. Rate limit 10/hora por IP.
  2. Upsert respetando `@@unique([commentId, anonId])`.
  3. Si `reports.count >= 5` → `isHidden = true` automático (sin panel de admin en el MVP).

## 9. Identidad anónima y anti-abuso

- `middleware.ts` genera `anonId = crypto.randomUUID()` en cookie (`sameSite: lax`, `maxAge: 1 año`, no-httpOnly porque el cliente debe poder leerla para enviarla en los POST) si no existe.
- Nickname opcional en cookie separada, editable por el usuario, sin validación de unicidad (display name, no cuenta).
- IP obtenida de `headers().get('x-forwarded-for')` (provista por Vercel), siempre hasheada con `sha256(ip + RATE_LIMIT_SALT)` antes de persistir — nunca en claro.
- `checkRateLimit(keyPrefix, ipHash, limit, windowMs)`: upsert sobre `RateLimitBucket`, resetea si la ventana venció, incrementa y compara contra `limit` si no.
- Límites: comentarios 5/hora, votos 30/hora, reports 10/hora, refresh manual 1/2min por IP+jugador.
- Filtro de palabras prohibidas: librería `obscenity` (dataset default + lista custom en español si hace falta), cargada una vez en `lib/profanity.ts`.

## 10. Variables de entorno (`.env.example`)

```
DATABASE_URL=
DIRECT_URL=
RIOT_API_KEY=
RIOT_ACCOUNT_REGION=europe
RIOT_PLATFORM_REGION=euw1
RATE_LIMIT_SALT=
NEXT_PUBLIC_SITE_URL=
```

## 11. Fuera de alcance del MVP (futuro)

Login/RSO de Riot, leaderboard de toxicidad, compartir en redes, karma de reviewer, validación "solo podés reviewear si jugaste con esa persona". El desacople de `anonId` respecto de cualquier tabla de usuarios permite agregar una tabla `User` opcional + FK nullable en `Comment` más adelante sin romper el schema actual.

## 12. Plan de implementación (orden sugerido)

1. Setup del proyecto (`create-next-app`, TS, App Router, Tailwind, ESLint).
2. DB: Neon + `schema.prisma` + `prisma migrate dev` + `lib/db.ts`.
3. Integración Riot API aislada (`lib/riot/*`), probada contra un Riot ID real.
4. Cache en DB (`getPlayerData` cache-first + upsert).
5. Página de perfil (solo lectura): rank, stats, últimas 5 partidas.
6. Home + search bar con validación de formato y redirect.
7. Identidad anónima: middleware + cookie `anonId` + nickname opcional.
8. Sistema de reviews: profanity filter, validación zod, `POST /api/comments`, `CommentForm`, `CommentList`.
9. Votos y reportes: `VoteButtons`, `ReportButton`, recálculo transaccional de `score`, auto-ocultamiento a 5 reports.
10. Rate limiting aplicado a los 3 endpoints de mutación + refresh manual.
11. Top comentarios en home (`score desc`) con link + scroll al comentario en el perfil.
12. Pulido: `loading.tsx`/`error.tsx`, responsive.
13. Deploy a Vercel: env vars, `prisma generate` en postinstall, `prisma migrate deploy`.
14. Smoke test end-to-end: buscar → ver perfil real → comentar (rating+tags) → votar → verificar en top de home → reportar 5 veces → confirmar auto-ocultamiento.

## 13. Verificación

- Local: recorrer el flujo completo del paso 14 contra datos reales de Riot.
- `npx prisma studio` para inspeccionar reviews, votos, tags y reports.
- Casos borde: jugador inexistente, texto con palabra prohibida, doble voto con misma cookie, voto tras borrar cookie (debe permitirse, es otra identidad), rate limit excedido.
- Tras deploy: repetir el flujo contra la URL de Vercel, verificando que `x-forwarded-for` resuelve bien la IP real detrás del proxy.
