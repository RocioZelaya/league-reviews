import type { ReviewTag } from "@prisma/client";
import type { ApiErrorCode } from "@/lib/apiErrors";
import type { Dictionary } from "./en";

const reviewTags: Record<ReviewTag, string> = {
  GOOD_SHOTCALLER: "Buen shotcaller",
  GOOD_CARRY: "Carry",
  TEAM_PLAYER: "Juega en equipo",
  GOOD_MECHANICS: "Buenas mecánicas",
  FRIENDLY: "Buena onda",
  TOXIC_FLAMER: "Tóxico",
  INTING: "Inteador",
  BAD_ATTITUDE: "Mala actitud",
  GOES_AFK: "Se va AFK",
};

const ratingLabels: Record<number, string> = {
  1: "Evitar",
  2: "Flojo",
  3: "Normal",
  4: "Bueno",
  5: "Excelente",
};

const roles: Record<string, string> = {
  TOP: "Top",
  JUNGLE: "Jungla",
  MIDDLE: "Mid",
  BOTTOM: "ADC",
  UTILITY: "Support",
};

const tiers: Record<string, string> = {
  IRON: "Hierro",
  BRONZE: "Bronce",
  SILVER: "Plata",
  GOLD: "Oro",
  PLATINUM: "Platino",
  EMERALD: "Esmeralda",
  DIAMOND: "Diamante",
  MASTER: "Maestro",
  GRANDMASTER: "Gran Maestro",
  CHALLENGER: "Retador",
};

const apiErrors: Record<ApiErrorCode, string> = {
  INVALID_INPUT:
    "La solicitud no es válida. Recargá la página y probá de nuevo.",
  PROFANITY: "La review contiene lenguaje no permitido.",
  RATE_LIMITED: "Demasiados intentos. Probá de nuevo en un rato.",
  NOT_FOUND: "Ese jugador no existe.",
  UPSTREAM_FAILED: "Riot no respondió. Probá de nuevo en un momento.",
};

export const es: Dictionary = {
  metadata: {
    description:
      "Buscá jugadores de League of Legends por Riot ID y leé o dejá reviews sobre cómo es tenerlos de equipo.",
    playerDescription:
      "Rank, partidas recientes y reviews de {riotId} en League of Legends.",
  },
  header: {
    switchLanguage: "Cambiar a inglés",
  },
  footer: {
    tagline: "Reviews anónimas, sin cuentas. Votá, reportá, y nada más.",
    disclaimer:
      "League Reviews no está afiliado a Riot Games. League of Legends es marca de Riot Games, Inc.",
  },
  home: {
    eyebrow: "Reviews anónimas de jugadores",
    heroTitleBefore: "¿Cómo es tenerlo de ",
    heroTitleHighlight: "equipo",
    heroTitleAfter: "?",
    subtitle:
      "Buscá a cualquier jugador de League of Legends por su Riot ID, mirá cómo viene jugando y leé lo que dicen de él.",
    topReviewsEyebrow: "Lo más votado",
    topReviewsTitle: "Top reviews",
    mostReviewedEyebrow: "Más comentados",
    mostReviewedTitle: "Jugadores",
    noReviewsTitle: "Todavía no hay reviews publicadas.",
    noReviewsDescription: "Buscá a alguien y dejá la primera.",
    noPlayersTitle: "Nadie tiene reviews todavía.",
    viewProfile: "Ver perfil →",
  },
  search: {
    placeholder: "Nombre#Tag",
    inputLabel: "Riot ID",
    submit: "Buscar",
    invalidFormat: "Usá el formato Nombre#Tag, por ejemplo Faker#KR1.",
  },
  player: {
    championsEyebrow: "Últimas partidas",
    championsTitle: "Campeones",
    matchesEyebrow: "Historial",
    matchesTitle: "Partidas recientes",
    reviewsEyebrow: "Lo que dicen",
    reviewsTitle: "Reviews",
    noReviewsYet: "Todavía nadie dejó una review. Sé la primera persona.",
    reviewCount: { one: "{count} review", other: "{count} reviews" },
    noChampions: "Sin campeones jugados recientemente.",
    noMatchesTitle: "Sin partidas recientes.",
    noMatchesDescription: "Cuando juegue algo, aparece acá.",
    refresh: "Actualizar",
    refreshing: "Actualizando",
    loading: "Cargando perfil",
  },
  rank: {
    queue: "SoloQ",
    unranked: "Sin clasificar",
    noRankedGames: "Sin partidas de ranked.",
    winsSuffix: "V",
    lossesSuffix: "D",
    winrateSuffix: "WR",
    winrateLabel: "Winrate",
    outdated: "Datos desactualizados · Riot no respondió",
  },
  match: {
    win: "Victoria",
    loss: "Derrota",
    winShort: "V",
    lossShort: "D",
    perfectKda: "Perfect",
    games: { one: "{count} partida", other: "{count} partidas" },
    outdated: "Partidas desactualizadas · Riot no respondió",
  },
  time: {
    justNow: "hace un momento",
    now: "ahora",
  },
  reviewTags,
  rating: {
    prompt: "¿Cómo es jugar con esta persona?",
    pick: "Elegí un rating",
    labels: ratingLabels,
    stars: { one: "{count} estrella", other: "{count} estrellas" },
    outOf: "{rating} de {max} estrellas",
  },
  commentForm: {
    bodyPlaceholder: "Contá cómo fue. Sin insultos, que se filtran.",
    bodyLabel: "Review",
    nicknamePlaceholder: "Tu nombre (opcional)",
    nicknameLabel: "Nickname",
    tagsLegend: "Tags",
    submit: "Publicar review",
    submitting: "Publicando",
    missingRating: "Elegí un rating de 1 a 5 estrellas.",
  },
  comments: {
    anonymous: "Anónimo",
    noneTitle: "Todavía no hay reviews de este jugador.",
    noneDescription: "La primera la dejás vos, arriba.",
    upvote: "Votar arriba",
    downvote: "Votar abajo",
    report: "Reportar",
    reportConfirm: "¿Reportar?",
    reportConfirmGroup: "Confirmar reporte",
    yes: "Sí",
    no: "No",
    reported: "Reportado",
  },
  errors: {
    eyebrow: "Error",
    retry: "Reintentar",
    sessionMissing: "No se pudo identificar tu sesión. Recargá la página.",
    publishFailed: "No se pudo publicar la review.",
    voteFailed: "No se pudo registrar el voto.",
    reportFailed: "No se pudo enviar el reporte.",
    refreshFailed: "No se pudo actualizar.",
    genericTitle: "Algo salió mal",
    genericDescription:
      "No pudimos cargar la página. Probá de nuevo en un momento.",
    playerTitle: "No pudimos cargar este perfil",
    playerDescription:
      "Puede ser un problema temporal con la API de Riot. Probá de nuevo.",
    notFoundTitle: "Esta página no existe",
    notFoundDescription: "Puede que el link esté roto o viejo.",
    backHome: "← Volver al inicio",
    playerNotFoundTitle: "Jugador no encontrado",
    playerNotFoundDescription:
      "No existe ese Riot ID en la región configurada. Revisá el nombre y el tag, van separados por #.",
  },
  apiErrors,
  tiers,
  roles,
};
