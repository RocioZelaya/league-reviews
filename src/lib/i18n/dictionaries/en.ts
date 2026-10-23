import type { ReviewTag } from "@prisma/client";
import type { ApiErrorCode } from "@/lib/apiErrors";

const reviewTags: Record<ReviewTag, string> = {
  GOOD_SHOTCALLER: "Good shotcaller",
  GOOD_CARRY: "Carry",
  TEAM_PLAYER: "Team player",
  GOOD_MECHANICS: "Good mechanics",
  FRIENDLY: "Friendly",
  TOXIC_FLAMER: "Toxic",
  INTING: "Inter",
  BAD_ATTITUDE: "Bad attitude",
  GOES_AFK: "Goes AFK",
};

const ratingLabels: Record<number, string> = {
  1: "Avoid",
  2: "Weak",
  3: "Okay",
  4: "Good",
  5: "Excellent",
};

const roles: Record<string, string> = {
  TOP: "Top",
  JUNGLE: "Jungle",
  MIDDLE: "Mid",
  BOTTOM: "ADC",
  UTILITY: "Support",
};

const tiers: Record<string, string> = {
  IRON: "Iron",
  BRONZE: "Bronze",
  SILVER: "Silver",
  GOLD: "Gold",
  PLATINUM: "Platinum",
  EMERALD: "Emerald",
  DIAMOND: "Diamond",
  MASTER: "Master",
  GRANDMASTER: "Grandmaster",
  CHALLENGER: "Challenger",
};

const apiErrors: Record<ApiErrorCode, string> = {
  INVALID_INPUT: "That request was invalid. Reload the page and try again.",
  PROFANITY: "The review contains language that is not allowed.",
  RATE_LIMITED: "Too many requests. Try again in a bit.",
  NOT_FOUND: "That player does not exist.",
  UPSTREAM_FAILED: "Riot did not respond. Try again in a moment.",
};

export const en = {
  metadata: {
    description:
      "Look up League of Legends players by Riot ID and read or write reviews about what they are like as teammates.",
    playerDescription:
      "Rank, recent matches and reviews of {riotId} in League of Legends.",
  },
  header: {
    switchLanguage: "Switch to Spanish",
  },
  footer: {
    tagline: "Anonymous reviews, no accounts. Vote, report, and that's it.",
    disclaimer:
      "League Reviews is not affiliated with Riot Games. League of Legends is a trademark of Riot Games, Inc.",
  },
  home: {
    eyebrow: "Anonymous player reviews",
    heroTitleBefore: "What is it like having them as a ",
    heroTitleHighlight: "teammate",
    heroTitleAfter: "?",
    subtitle:
      "Look up any League of Legends player by Riot ID, see how they have been playing and read what people say about them.",
    topReviewsEyebrow: "Most upvoted",
    topReviewsTitle: "Top reviews",
    mostReviewedEyebrow: "Most reviewed",
    mostReviewedTitle: "Players",
    noReviewsTitle: "No reviews published yet.",
    noReviewsDescription: "Look someone up and write the first one.",
    noPlayersTitle: "Nobody has reviews yet.",
    viewProfile: "View profile →",
  },
  search: {
    placeholder: "Name#Tag",
    inputLabel: "Riot ID",
    submit: "Search",
    invalidFormat: "Use the Name#Tag format, for example Faker#KR1.",
  },
  player: {
    championsEyebrow: "Recent matches",
    championsTitle: "Champions",
    matchesEyebrow: "History",
    matchesTitle: "Recent matches",
    reviewsEyebrow: "What people say",
    reviewsTitle: "Reviews",
    noReviewsYet: "Nobody has left a review yet. Be the first.",
    reviewCount: { one: "{count} review", other: "{count} reviews" },
    noChampions: "No champions played recently.",
    noMatchesTitle: "No recent matches.",
    noMatchesDescription: "Once they play something, it shows up here.",
    refresh: "Refresh",
    refreshing: "Refreshing",
    loading: "Loading profile",
  },
  rank: {
    queue: "SoloQ",
    unranked: "Unranked",
    noRankedGames: "No ranked games.",
    winsSuffix: "W",
    lossesSuffix: "L",
    winrateSuffix: "WR",
    winrateLabel: "Winrate",
    outdated: "Outdated · Riot did not respond",
  },
  match: {
    win: "Victory",
    loss: "Defeat",
    winShort: "W",
    lossShort: "L",
    perfectKda: "Perfect",
    games: { one: "{count} game", other: "{count} games" },
    outdated: "Matches outdated · Riot did not respond",
  },
  time: {
    justNow: "just now",
    now: "now",
  },
  reviewTags,
  rating: {
    prompt: "What is it like to play with this person?",
    pick: "Pick a rating",
    labels: ratingLabels,
    stars: { one: "{count} star", other: "{count} stars" },
    outOf: "{rating} out of {max} stars",
  },
  commentForm: {
    bodyPlaceholder: "Tell us how it went. No insults, they get filtered.",
    bodyLabel: "Review",
    nicknamePlaceholder: "Your name (optional)",
    nicknameLabel: "Nickname",
    tagsLegend: "Tags",
    submit: "Publish review",
    submitting: "Publishing",
    missingRating: "Pick a rating from 1 to 5 stars.",
  },
  comments: {
    anonymous: "Anonymous",
    noneTitle: "No reviews for this player yet.",
    noneDescription: "Leave the first one above.",
    upvote: "Upvote",
    downvote: "Downvote",
    report: "Report",
    reportConfirm: "Report?",
    reportConfirmGroup: "Confirm report",
    yes: "Yes",
    no: "No",
    reported: "Reported",
  },
  errors: {
    eyebrow: "Error",
    retry: "Retry",
    sessionMissing: "We could not identify your session. Reload the page.",
    publishFailed: "The review could not be published.",
    voteFailed: "The vote could not be saved.",
    reportFailed: "The report could not be sent.",
    refreshFailed: "Could not refresh.",
    genericTitle: "Something went wrong",
    genericDescription: "We could not load the page. Try again in a moment.",
    playerTitle: "We could not load this profile",
    playerDescription:
      "It may be a temporary problem with the Riot API. Try again.",
    notFoundTitle: "This page does not exist",
    notFoundDescription: "The link may be broken or out of date.",
    backHome: "← Back to home",
    playerNotFoundTitle: "Player not found",
    playerNotFoundDescription:
      "That Riot ID does not exist in the configured region. Check the name and the tag, they are separated by #.",
  },
  apiErrors,
  tiers,
  roles,
};

export type Dictionary = typeof en;
