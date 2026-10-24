import { z } from "zod";

export const API_ERROR_CODES = [
  "INVALID_INPUT",
  "PROFANITY",
  "RATE_LIMITED",
  "NOT_FOUND",
  "UPSTREAM_FAILED",
  "SELF_REVIEW",
  "NO_SHARED_MATCH",
] as const;

export const apiErrorCodeSchema = z.enum(API_ERROR_CODES);

export type ApiErrorCode = z.infer<typeof apiErrorCodeSchema>;

export const apiErrorResponseSchema = z.object({ error: apiErrorCodeSchema });

const HTTP_BAD_REQUEST = 400;
const HTTP_NOT_FOUND = 404;
const HTTP_TOO_MANY_REQUESTS = 429;
const HTTP_BAD_GATEWAY = 502;

const API_ERROR_STATUS: Record<ApiErrorCode, number> = {
  INVALID_INPUT: HTTP_BAD_REQUEST,
  PROFANITY: HTTP_BAD_REQUEST,
  RATE_LIMITED: HTTP_TOO_MANY_REQUESTS,
  NOT_FOUND: HTTP_NOT_FOUND,
  UPSTREAM_FAILED: HTTP_BAD_GATEWAY,
  SELF_REVIEW: HTTP_BAD_REQUEST,
  NO_SHARED_MATCH: HTTP_BAD_REQUEST,
};

/**
 * Error body returned by every route handler. Handlers send a stable code and
 * the client picks the localized message, so the API never carries copy.
 */
export function apiErrorResponse(code: ApiErrorCode): Response {
  return Response.json({ error: code }, { status: API_ERROR_STATUS[code] });
}

/**
 * Reads an error code from a failed response. Non-JSON bodies (a framework
 * 500 page, for example) and unknown codes yield null so the caller can show
 * its own fallback message.
 */
export async function readApiErrorCode(
  response: Response,
): Promise<ApiErrorCode | null> {
  let body: unknown;
  try {
    body = await response.json();
  } catch (error) {
    console.error("api.error_body.unparseable", {
      status: response.status,
      message: error instanceof Error ? error.message : String(error),
    });
    return null;
  }
  const parsed = apiErrorResponseSchema.safeParse(body);
  return parsed.success ? parsed.data.error : null;
}
