export const INSUFFICIENT_CREDITS_PATH = "/insufficient-credits";

export type InsufficientCreditsResponse = { insufficientCredits: true };

export function insufficientCreditsResponse(): InsufficientCreditsResponse {
  return { insufficientCredits: true };
}

export function isInsufficientCreditsPayload(
  value: unknown
): value is InsufficientCreditsResponse {
  return (
    typeof value === "object" &&
    value !== null &&
    "insufficientCredits" in value &&
    (value as InsufficientCreditsResponse).insufficientCredits === true
  );
}
