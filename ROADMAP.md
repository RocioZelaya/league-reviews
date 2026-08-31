# League Reviews — Roadmap de implementación

Ruta de trabajo derivada de [`SPECS.md`](./SPECS.md), que sigue siendo la **fuente de verdad**: si algo de este roadmap contradice la spec, gana la spec.

Cada fase referencia la sección de `SPECS.md` que la define. Las fases están ordenadas por dependencia: cada una asume que las anteriores están terminadas y verificadas.

- `- [ ]` pendiente
- `- [x]` hecho y verificado

---

## Fase 0 — Prerrequisitos externos (§3)

Nada de código: conseguir accesos antes de empezar.

- [ ] Crear cuenta en https://developer.riotgames.com/ y generar la **Development API Key**.
  - Expira cada 24 h: hay que regenerarla y actualizar `.env.local` a diario durante el desarrollo.
  - Límites de la dev key: 20 req/1 s y 100 req/2 min — condicionan el diseño de cache de la Fase 4.
- [ ] Crear proyecto en **Neon** y copiar las dos connection strings:
  - `DATABASE_URL` (pooled, la que usa la app en runtime).
  - `DIRECT_URL` (directa, requerida por Neon para `prisma migrate`).
- [ ] Crear cuenta en **Vercel** (el deploy real es la Fase 13).
- [ ] Decidir región inicial: **EUW1 / europe**, siempre por env var, nunca hardcodeada.
- [ ] Generar un `RATE_LIMIT_SALT` aleatorio (p. ej. `openssl rand -hex 32`).

**Verificación:** `curl` manual a Account-V1 con la key y un Riot ID real devuelve un `puuid`.

---

## Fase 1 — Scaffolding del proyecto (§2, §4)

- [x] `create-next-app` con TypeScript, App Router, Tailwind CSS y ESLint.
- [x] Instalar dependencias: `prisma` (dev), `@prisma/client`, `zod`, `obscenity`.
- [x] Crear la estructura de carpetas de §4 (`src/app`, `src/lib`, `src/lib/riot`, `src/components`, `src/types`).
- [x] Escribir `.env.example` con las 7 variables de §10 y crear `.env.local` a partir de él.
- [x] Confirmar que `.env.local` está en `.gitignore`.

**Verificación:** `npm run dev` levanta y `npm run lint` pasa limpio.

---

## Fase 2 — Base de datos (§5)

- [x] Escribir `prisma/schema.prisma` con los 6 modelos y el enum:
  - `RiotAccount` (puuid único, campos de rank, `topChampions`/`lastMatchIds`/`lastMatchesData` como `Json?`, `statsUpdatedAt`, `matchesUpdatedAt`, índice `[gameName, tagLine]`).
  - `Comment` (body, rating, `anonId`, `nickname?`, `ipHash`, `upvotes`/`downvotes`/`score`, `isHidden`, índices en `riotAccountId`, `score` y `createdAt`).
  - `CommentTag` con `@@unique([commentId, tag])`.
  - `enum ReviewTag` con las 9 tags: `GOOD_SHOTCALLER`, `TOXIC_FLAMER`, `GOOD_CARRY`, `TEAM_PLAYER`, `INTING`, `GOOD_MECHANICS`, `BAD_ATTITUDE`, `FRIENDLY`, `GOES_AFK`.
  - `Vote` y `Report`, ambos con `@@unique([commentId, anonId])`.
  - `RateLimitBucket` con `key` único, `count` y `windowStart`.
- [x] Todas las relaciones a `Comment` con `onDelete: Cascade`.
- [x] Correr `npx prisma migrate dev --name init`.
- [x] Escribir `src/lib/db.ts`: singleton de PrismaClient que sobrevive al hot-reload de Next en dev.

**Verificación:** `npx prisma studio` muestra las 6 tablas vacías; insertar y borrar un `RiotAccount` de prueba funciona.

---

## Fase 3 — Capa Riot API aislada (§7)

- [x] `src/lib/riot/regions.ts`: mapeo entre routing **continental** (`americas`/`europe`/`asia`/`sea`, para Account-V1 y Match-V5) y **platform** (`euw1`, `na1`, …, para League-V4), leído de env vars.
- [x] `src/lib/riot/types.ts`: tipos de las respuestas de Account-V1, League-V4 y Match-V5 que realmente se consumen (no el payload completo de Riot).
- [x] `src/lib/riot/client.ts`: wrapper de `fetch` con
  - header `X-Riot-Token`,
  - manejo de **429**: leer `Retry-After`, 1 reintento con backoff; si persiste, servir cache existente o error controlado,
  - manejo de **404**: error tipado "jugador no encontrado", nunca un 500 genérico,
  - timeout y errores de red tipados.
- [x] `resolveRiotAccount(gameName, tagLine)`:
  - Account-V1 `/riot/account/v1/accounts/by-riot-id/{gameName}/{tagLine}` → `puuid`.
  - League-V4 `/lol/league/v4/entries/by-puuid/{puuid}` → tier, rank, LP, wins, losses de soloQ.
  - Match-V5 `/lol/match/v5/matches/by-puuid/{puuid}/ids?count=5` + `GET /matches/{matchId}` ×5 → resumen de las últimas 5 partidas.
- [x] Normalizar el payload de partidas a un resumen chico (campeón, KDA, resultado, duración, fecha, rol) — no guardar el match completo.

**Verificación:** script suelto (`tsx`/route temporal) contra un Riot ID real que imprima puuid, rank y las 5 partidas.

---

## Fase 4 — Cache en base de datos (§7)

- [x] `getPlayerData(gameName, tagLine)` cache-first sobre `RiotAccount`:
  - `puuid`: prácticamente inmutable, **no vence**.
  - rank/stats: TTL **15 min** (`statsUpdatedAt`).
  - partidas: TTL **10 min** (`matchesUpdatedAt`).
- [x] Solo llamar a Riot cuando el TTL correspondiente venció; los dos TTL se evalúan por separado.
- [x] Upsert de `RiotAccount` por `puuid` tras cada refresh, actualizando solo los timestamps que se refrescaron.
- [x] Si Riot falla pero hay cache vencida, servir la cache marcando el dato como desactualizado en vez de romper la página.
- [ ] Botón opcional "Actualizar datos" en el perfil: fuerza refresh (el rate limit de 1 cada 2 min por IP+jugador llega en la Fase 10).

**Verificación:** dos cargas seguidas del mismo perfil hacen 0 llamadas a Riot en la segunda (log de `client.ts`); tras esperar el TTL, vuelve a llamar.

---

## Fase 5 — Página de perfil, solo lectura (§6)

- [x] Ruta `src/app/player/[riotId]/page.tsx` (Server Component):
  1. Decodificar `riotId` y parsear `gameName` / `tagLine` (separador `#`).
  2. Llamar a `getPlayerData` directo desde el server component — sin round-trip HTTP a la propia API.
  3. `notFound()` (404) si el jugador no existe en Riot.
- [x] Componentes: `PlayerCard`, `RankSummary`, `ChampionStatsGrid`, `MatchList` + `MatchItem` (5 items).
- [x] `loading.tsx` con skeleton — la resolución contra Riot puede tardar 1-2 s en frío.

**Verificación:** `/player/Faker%23KR1` renderiza datos reales; un Riot ID inventado muestra el 404 propio, no un stack trace.

---

## Fase 6 — Home y búsqueda (§6)

- [x] `src/app/page.tsx`: `SearchBar` + placeholder de `TopCommentsFeed` (el feed real llega en la Fase 11).
- [x] `SearchBar` (Client Component):
  - valida el formato `Nombre#Tag` antes de navegar,
  - `router.push('/player/' + encodeURIComponent('Nombre#Tag'))`,
  - mensaje de error inline si el formato es inválido.
- [x] Layout y `globals.css` base.

**Verificación:** buscar `Nombre#Tag` navega al perfil; `Nombre` sin tag muestra error sin navegar.

---

## Fase 7 — Identidad anónima (§9)

- [x] `middleware.ts`: si no existe la cookie `anonId`, generar `crypto.randomUUID()` y setearla (`sameSite: lax`, `maxAge` 1 año, **no** httpOnly — el cliente la lee para mandarla en los POST).
- [x] `src/lib/anon.ts`: leer/escribir `anonId` desde server y cliente.
- [x] Cookie separada de **nickname** opcional, editable por el usuario, sin unicidad — es display name, no cuenta.
- [x] `src/lib/hash.ts`: `sha256(ip + RATE_LIMIT_SALT)`. La IP sale de `x-forwarded-for` y **nunca** se persiste en claro.

**Verificación:** primera visita setea la cookie; borrarla y recargar genera un `anonId` distinto.

---

## Fase 8 — Sistema de reviews (§8.1)

- [x] `src/lib/validation.ts` con zod: `body` 1-1000 chars, `rating` entero 1-5, `tags` del enum con **máximo 3**, `anonId` uuid, `nickname` opcional.
- [x] `src/lib/profanity.ts`: `obscenity` cargado **una sola vez** a nivel de módulo (dataset default + lista custom en español si hace falta), exportando `containsProfanity(text)`.
- [x] `POST /api/comments`:
  1. Validar con zod.
  2. `containsProfanity(body)` → rechazar con mensaje claro (**no** censura silenciosa).
  3. Rate limit (se cablea en la Fase 10).
  4. Crear `Comment` + `CommentTag[]` en **una transacción**.
  5. `revalidatePath` del perfil del jugador y de la home.
- [x] Componentes: `CommentForm` (con `StarRating` y `TagSelector`), `CommentList`, `CommentItem`.
- [x] `CommentList` excluye los comentarios con `isHidden = true`.

**Verificación:** comentar desde la UI persiste comment + tags (visible en `prisma studio`) y aparece sin recargar a mano; un texto con palabra prohibida se rechaza con mensaje explícito.

---

## Fase 9 — Votos y reportes (§8.2, §8.3)

- [x] `POST /api/comments/[id]/vote` con body `{ anonId, value: 1 | -1 }`:
  - Upsert sobre `Vote` respetando `@@unique([commentId, anonId])`.
  - Mismo valor que el voto existente → quita el voto (toggle). Valor distinto → lo actualiza.
  - Recalcular `upvotes`, `downvotes` y `score` **en la misma transacción** que el voto.
- [x] `POST /api/comments/[id]/report` con body `{ anonId, reason? }`:
  - Upsert respetando `@@unique([commentId, anonId])`.
  - Al llegar a **5 reports** → `isHidden = true` automático (no hay panel de admin en el MVP).
- [x] Componentes `VoteButtons` (estado optimista + rollback si el POST falla) y `ReportButton` (confirmación antes de mandar).

**Verificación:** votar dos veces igual deja `score` en 0; cambiar el voto mueve el score de +1 a -1 en un solo paso; 5 reports de 5 `anonId` distintos ocultan el comentario de la lista.

---

## Fase 10 — Rate limiting (§9)

- [ ] `src/lib/rateLimit.ts`: `checkRateLimit(keyPrefix, ipHash, limit, windowMs)` sobre `RateLimitBucket` — upsert por `key`, reset si la ventana venció, si no incrementar y comparar contra `limit`.
- [ ] Aplicar a los 3 endpoints de mutación:
  - comentarios **5/hora**,
  - votos **30/hora**,
  - reports **10/hora**.
- [ ] Refresh manual de datos de jugador: **1 cada 2 min** por IP + jugador.
- [ ] Devolver 429 con un mensaje entendible y mostrarlo en la UI.

**Verificación:** el 6º comentario en una hora devuelve 429; la fila correspondiente de `RateLimitBucket` refleja el `count` y la ventana.

---

## Fase 11 — Top comentarios en home (§6)

- [ ] `getTopComments(limit = 20)`: orden `score desc, createdAt desc`, excluyendo `isHidden`, incluyendo el `RiotAccount` para poder linkear.
- [ ] `TopCommentsFeed` (Server Component) en la home.
- [ ] Cada item linkea al perfil del jugador con anchor al comentario (`/player/<riotId>#comment-<id>`) y la página hace scroll a ese comentario.

**Verificación:** un comentario recién votado hacia arriba sube en la home tras revalidar, y su link cae exactamente en ese comentario dentro del perfil.

---

## Fase 12 — Pulido (§12)

- [ ] `error.tsx` en las rutas que pueden fallar (perfil, home).
- [ ] Estados vacíos: jugador sin partidas, jugador sin reviews, home sin comentarios.
- [ ] Responsive: mobile primero, verificar en ~375 px y desktop.
- [ ] Accesibilidad básica: labels en el form, foco visible, botones de voto con `aria-label`.
- [ ] Metadata de la página (title, description).

---

## Fase 13 — Deploy a Vercel (§12)

- [ ] Cargar las 7 env vars de §10 en el proyecto de Vercel.
- [ ] `prisma generate` en `postinstall`.
- [ ] `prisma migrate deploy` en el build.
- [ ] Primer deploy y humo básico: home carga, un perfil real carga.
- [ ] Confirmar que `x-forwarded-for` resuelve la **IP real** detrás del proxy de Vercel (si no, el rate limiting es inútil o agrupa a todo el mundo).

---

## Fase 14 — Verificación end-to-end (§13)

Flujo completo, primero en local y después contra la URL de Vercel:

- [ ] Buscar un Riot ID real → ver el perfil con rank, stats y 5 partidas.
- [ ] Comentar con rating y tags.
- [ ] Votar el comentario.
- [ ] Verificar que aparece en el top de la home y que el link lleva al comentario.
- [ ] Reportarlo 5 veces (5 `anonId` distintos) y confirmar el auto-ocultamiento.

Casos borde:

- [ ] Jugador inexistente → 404 propio.
- [ ] Texto con palabra prohibida → rechazo con mensaje claro.
- [ ] Doble voto con la misma cookie → no duplica score.
- [ ] Voto tras borrar la cookie → **debe permitirse**, es otra identidad (limitación conocida y aceptada del MVP).
- [ ] Rate limit excedido → 429 visible en la UI.
- [ ] Inspección final con `npx prisma studio`: reviews, votos, tags y reports consistentes.

---

## Fuera de alcance del MVP (§11)

Backlog post-MVP, **no** pendientes de este roadmap. El schema ya está diseñado para no bloquearlos: `anonId` está desacoplado de cualquier tabla de usuarios, así que se puede agregar `User` + FK nullable en `Comment` sin romper nada.

- Login / RSO de Riot.
- Leaderboard de toxicidad.
- Compartir en redes sociales.
- Karma de reviewer.
- Validación "solo podés reviewear a alguien con quien jugaste".
- Production API Key de Riot (la dev key alcanza para el MVP).
- Migrar el rate limiting de Postgres a Redis/Upstash.
