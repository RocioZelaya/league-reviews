# League Reviews — Guía de estilo de código

Reglas de cómo se escribe código en este repo. No son sugerencias: son el estándar contra el que se revisa un cambio antes de mergear.

La spec está en [`SPECS.md`](./SPECS.md) y el plan de trabajo en [`ROADMAP.md`](./ROADMAP.md). Este documento cubre **cómo** se escribe, no **qué** se construye.

---

## 1. Idioma

**Todo el código va en inglés.** Sin excepciones, sin mezclas.

- Nombres de variables, funciones, tipos, componentes, archivos y carpetas.
- Comentarios y JSDoc.
- Mensajes de commit.
- Mensajes de error internos, logs y nombres de campos de la base.

La única excepción es el **texto que ve el usuario final** (copy de la UI, mensajes de validación mostrados en pantalla) y la documentación del repo (`SPECS.md`, `ROADMAP.md`, este archivo).

```ts
// ✅
const hasExpiredCache = statsUpdatedAt < Date.now() - STATS_TTL_MS;

// ❌
const cacheVencida = statsUpdatedAt < Date.now() - TTL_STATS_MS;
```

El copy de usuario nunca se hardcodea en medio de la lógica: sale de una constante o de un módulo de mensajes, para que la lógica quede en inglés y el texto visible quede aislado.

---

## 2. Formato y linting

El formato no se discute en un code review: lo decide la herramienta.

- **Prettier** formatea todo. Sin configuración creativa: la default del proyecto y nada más.
- **ESLint** con la config de `next/core-web-vitals` + reglas de TypeScript.
- El código se formatea **al guardar** (configurá tu editor) y se verifica en CI.
- `npm run lint` tiene que pasar limpio. Cero warnings tolerados: un warning que se ignora se multiplica.
- Prohibido `// eslint-disable-*` sin un comentario en la línea de arriba explicando por qué la regla no aplica en ese caso concreto.

Un PR con diff de formato mezclado con cambios de lógica se rechaza. Si hay que reformatear algo grande, va en su propio commit.

---

## 3. TypeScript

- `strict: true`. No se relaja para hacer pasar un archivo.
- **`any` está prohibido.** Si no sabés el tipo, es `unknown` y lo angostás con una guarda de tipo.
- Nada de `@ts-ignore`. Si hace falta un escape, es `@ts-expect-error` con el motivo escrito al lado.
- Nada de `as` para tapar un error del compilador. `as` se usa solo cuando sabés algo que el compilador no puede saber, y ahí va acompañado de una validación real.
- Los datos que entran desde afuera (Riot API, request bodies, env vars) **no se tipan a mano: se validan con zod** y el tipo se deriva con `z.infer`. Un tipo escrito a mano sobre datos externos es una mentira que compila.

```ts
// ✅ el tipo sale de la validación
const createCommentSchema = z.object({/* ... */});
type CreateCommentInput = z.infer<typeof createCommentSchema>;

// ❌ confiar en que el body tiene la forma que decís
const input = (await req.json()) as CreateCommentInput;
```

- Preferí `type` para uniones y formas de datos, `interface` solo cuando necesitás extender.
- Los tipos compartidos van en `src/types/`; los tipos locales a un módulo se quedan en su módulo.

---

## 4. Nombres

| Cosa                            | Convención                                    | Ejemplo                             |
| ------------------------------- | --------------------------------------------- | ----------------------------------- |
| Componentes React               | `PascalCase`, archivo igual al componente     | `CommentForm.tsx`                   |
| Funciones y variables           | `camelCase`                                   | `getTopComments`                    |
| Tipos y enums                   | `PascalCase`                                  | `ReviewTag`, `PlayerProfile`        |
| Constantes de módulo            | `SCREAMING_SNAKE_CASE`                        | `STATS_TTL_MS`                      |
| Archivos de `lib/`              | `camelCase.ts`                                | `rateLimit.ts`                      |
| Rutas y carpetas de `app/`      | `kebab-case` (o el que impone Next)           | `app/player/[riotId]/`              |
| Booleanos                       | prefijo `is` / `has` / `should` / `can`       | `isHidden`, `hasExpiredCache`       |
| Funciones async que traen datos | `get*` (cache-first) / `fetch*` (va a la red) | `getPlayerData`, `fetchRiotAccount` |

La distinción `get*` vs `fetch*` importa en este proyecto: `get*` puede devolver cache, `fetch*` siempre pega contra Riot. Confundirlas es cómo se queman los rate limits de la dev key.

**Nada de abreviaturas inventadas.** `comment`, no `cmt`. `account`, no `acc`. Las únicas siglas aceptadas son las del dominio: `id`, `ip`, `url`, `ttl`, `puuid`, `lp`.

**Nada de números mágicos.** Todo umbral es una constante nombrada, exportada del módulo al que pertenece.

```ts
// ✅
const STATS_TTL_MS = 15 * 60 * 1000;
const AUTO_HIDE_REPORT_THRESHOLD = 5;

// ❌
if (reports.length >= 5) {
  /* ... */
}
```

---

## 5. Comentarios

**Solo comentarios técnicos, y solo si son necesarios.**

Un comentario existe para explicar **por qué**, nunca **qué**. El qué ya lo dice el código; si no lo dice, el problema es el código y se arregla el código, no se le agrega una nota.

Escribí un comentario cuando:

- La razón de una decisión no es evidente leyendo la línea (un límite impuesto por la API de Riot, un workaround por un bug de una librería, una restricción de Neon).
- Hay una consecuencia no obvia (una transacción que existe por una condición de carrera concreta).
- Documentás un contrato público de `lib/` con JSDoc breve: qué devuelve, qué tira, qué efectos tiene.

No escribas un comentario para:

- Repetir el nombre de la función.
- Marcar secciones (`// ---- helpers ----`). Si un archivo necesita secciones, necesita dividirse.
- Dejar código comentado. **El código muerto se borra**, para eso está git.
- Explicar algo que se arregla renombrando una variable.

```ts
// ✅ explica el porqué, que no se deduce del código
// Riot's dev key allows 20 req/s; two profiles resolving in parallel already
// hit it, so stats and matches are refreshed independently by TTL.
if (isStale(account.statsUpdatedAt, STATS_TTL_MS)) {
  /* ... */
}

// ❌ repite lo que dice la línea
// check if stats are stale
if (isStale(account.statsUpdatedAt, STATS_TTL_MS)) {
  /* ... */
}
```

`TODO` y `FIXME` solo si van acompañados de contexto suficiente para que otra persona lo resuelva. Un `// TODO: fix this` suelto no entra.

---

## 6. Código depurable

Cuando algo falle en producción, tenés que poder entender qué pasó sin un debugger conectado.

**Errores**

- Nunca tragues un error. `catch {}` vacío está prohibido.
- Un `catch` o loguea, o transforma el error en algo tipado que el llamador maneja, o re-lanza. Nunca lo hace desaparecer.
- Errores de dominio como clases tipadas (`RiotNotFoundError`, `RateLimitExceededError`), no strings sueltos. El código de arriba decide qué hacer según el tipo, no parseando un mensaje.
- Un error que cruza hacia el usuario siempre lleva dos versiones: el mensaje técnico que se loguea y el mensaje entendible que se muestra. Nunca se filtra un stack trace al cliente.

```ts
// ✅
try {
  return await fetchRiotAccount(gameName, tagLine);
} catch (error) {
  if (error instanceof RiotNotFoundError) return null;
  logger.error("riot.account.fetch_failed", { gameName, tagLine, error });
  throw error;
}

// ❌
try {
  return await fetchRiotAccount(gameName, tagLine);
} catch {
  return null; // ¿404? ¿429? ¿la red? nadie lo va a saber nunca
}
```

**Logs**

- Logs estructurados, no interpolación de strings: un evento con nombre estable y un objeto de contexto. Eso se filtra y se busca; un string armado a mano, no.
- Nombre del evento en `dominio.accion.resultado`: `riot.match.cache_hit`, `comment.create.rejected_profanity`.
- Se loguean los bordes: llamadas a Riot (hit/miss de cache, 429, reintentos), rechazos de validación, rate limits alcanzados, auto-ocultamientos.
- **Nunca** se loguea una IP en claro, ni una API key, ni un connection string. La IP se loguea hasheada o no se loguea.
- `console.log` no llega a `main`. Para debug local está bien; se borra antes del commit.

**Fallos legibles**

- Las validaciones fallan temprano y con el motivo puesto: qué campo, qué se esperaba.
- Los estados imposibles se hacen imposibles con tipos, no se comentan como "esto no debería pasar".

---

## 7. Estructura de la codebase

La estructura de carpetas está definida en §4 de `SPECS.md` y no se improvisa. Reglas sobre dónde va cada cosa:

- **`src/lib/`** es lógica pura de servidor: acceso a datos, integración con Riot, validación, rate limiting. No importa nada de React ni de `next/navigation`.
- **`src/components/`** es presentación. Un componente no llama a Prisma ni a Riot directo.
- **`src/app/`** conecta las dos: los Server Components llaman a `lib/` para el render inicial — sin round-trip HTTP a la propia API — y los Route Handlers manejan las mutaciones.
- **La dirección de las dependencias es una sola**: `app` → `lib`, `app` → `components`. Nunca `lib` → `components`, nunca `lib` → `app`.
- Toda llamada a Riot pasa por `lib/riot/client.ts`. Ningún `fetch` a `api.riotgames.com` vive fuera de ahí.
- Todo acceso a la base pasa por el singleton de `lib/db.ts`. Ningún `new PrismaClient()` suelto.

**Client vs Server Components**

- Server Component por default. `"use client"` solo cuando hace falta estado, efectos o handlers del DOM.
- El `"use client"` va lo más abajo posible en el árbol: un formulario interactivo es cliente, la página que lo contiene no tiene por qué serlo.
- Un Client Component nunca importa un módulo de `lib/` que toque la base o secretos — eso termina en el bundle del navegador.

**Tamaño y responsabilidad**

- Un archivo, una responsabilidad. Si un componente pasa de ~150 líneas o mezcla fetching con presentación, se parte.
- Una función hace una cosa. Si necesitás un comentario para separar sus dos mitades, son dos funciones.
- Antes de escribir un helper, buscá si ya existe en `lib/`. Duplicar lógica de cache, hashing o validación es la forma más rápida de que las dos copias se desincronicen.

---

## 8. Datos y acceso a base

- Todas las escrituras relacionadas van **en una transacción**. Crear un `Comment` con sus `CommentTag[]`, o upsertear un `Vote` y recalcular el `score`, son operaciones atómicas o no son nada.
- El `score` desnormalizado se recalcula en la misma transacción que el voto. Nunca por separado, nunca "después".
- Las restricciones de integridad viven en el schema (`@@unique`, `onDelete: Cascade`), no en el código de aplicación. El código puede duplicar la validación por UX, pero la base es la que garantiza.
- Los `select` traen solo lo que se usa. Nada de traer el `Comment` entero con todas sus relaciones para mostrar un contador.
- Cero SQL crudo salvo necesidad real y documentada en un comentario.

---

## 9. Seguridad

- **Ningún secreto en el código.** Todo por env var, y `.env.local` nunca se commitea.
- Las env vars se leen y validan en un único módulo al arranque, no con `process.env.LO_QUE_SEA` desparramado. Si falta una, la app falla al arrancar con un mensaje claro, no a la primera request.
- Las IPs se hashean con `sha256(ip + RATE_LIMIT_SALT)` antes de tocar la base o un log. **Nunca** en claro.
- Todo input de usuario se valida con zod en el borde del servidor. La validación del cliente es UX, no seguridad.
- Nada de datos sensibles en el bundle del cliente: `NEXT_PUBLIC_*` es público, tratalo como tal.

---

## 10. Estilos

- Tailwind con clases en el JSX. Nada de CSS suelto salvo lo que ya está en `globals.css`.
- Mobile primero: las variantes `sm:`/`md:`/`lg:` agregan, no corrigen.
- Sin valores arbitrarios (`w-[437px]`) salvo que no exista nada en la escala que sirva.
- Si la lista de clases se vuelve ilegible, el problema es que el componente hace demasiado: partilo.

---

## 11. Commits y PRs

- Mensajes en inglés, imperativo, con scope: `feat(riot): add 429 retry with backoff`, `fix(comments): recalculate score inside vote transaction`.
- Un commit, un cambio coherente. Formato, refactor y feature no van juntos.
- Antes de abrir un PR: `npm run lint` limpio, `npm run build` pasa, y probaste el flujo a mano.
- Un PR describe **qué cambia y por qué**, y menciona cómo verificarlo.

---

## 12. Checklist antes de commitear

- [ ] Todo el código nuevo está en inglés.
- [ ] `npm run lint` y `npm run build` pasan limpios.
- [ ] Cero `any`, cero `@ts-ignore`, cero `as` sin justificar.
- [ ] Cero `console.log`, cero código comentado, cero `catch` vacío.
- [ ] Los comentarios que quedaron explican **por qué**, no qué.
- [ ] Ningún secreto, ninguna IP en claro, ningún stack trace expuesto al cliente.
- [ ] Los inputs externos pasan por zod.
- [ ] Las escrituras relacionadas están en una transacción.
- [ ] Los archivos nuevos están en la carpeta que les corresponde según §7.
- [ ] Lo probaste corriendo, no solo compilando.
