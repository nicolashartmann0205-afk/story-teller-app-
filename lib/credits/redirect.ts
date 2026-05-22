import { redirect } from "next/navigation";
import {
  INSUFFICIENT_CREDITS_CODE,
  type ConsumeCreditResult,
} from "@/lib/credits/service";
import {
  INSUFFICIENT_CREDITS_PATH,
  insufficientCreditsResponse,
  type InsufficientCreditsResponse,
} from "@/lib/credits/constants";

export { INSUFFICIENT_CREDITS_PATH, type InsufficientCreditsResponse };
export { isInsufficientCreditsPayload } from "@/lib/credits/constants";

export function isInsufficientCredits(
  result: ConsumeCreditResult
): result is Extract<ConsumeCreditResult, { ok: false }> {
  return !result.ok && result.code === INSUFFICIENT_CREDITS_CODE;
}

export function creditGate(
  result: ConsumeCreditResult
): InsufficientCreditsResponse | null {
  if (isInsufficientCredits(result)) {
    return insufficientCreditsResponse();
  }
  return null;
}

/** For form actions / server-only flows where navigation can redirect immediately. */
export function redirectIfInsufficientCredits(result: ConsumeCreditResult): void {
  if (isInsufficientCredits(result)) {
    redirect(INSUFFICIENT_CREDITS_PATH);
  }
}
