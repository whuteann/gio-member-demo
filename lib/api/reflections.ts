import { api, ApiError } from "./client";
import type { Language } from "@/lib/types";
import type {
  AnswerIn,
  CheckInResultsOut,
  CheckInSessionOut,
  CheckInSubmitResponse,
  InnerReadingOut,
  InnerReadingSubmitResponse,
  InnerStateSnapshotOut,
  QuestionSetOut,
  TrendOut,
} from "./types";

export { ApiError };

export function getCheckInQuestions(token: string) {
  return api.get<QuestionSetOut>("/check-ins/questions", { token });
}

export function submitCheckIn(token: string, answers: AnswerIn[], privateNote: string | null) {
  return api.post<CheckInSubmitResponse>("/check-ins", { answers, private_note: privateNote }, { token });
}

export function listCheckIns(token: string) {
  return api.get<CheckInSessionOut[]>("/check-ins", { token });
}

export function getCheckIn(token: string, id: string) {
  return api.get<CheckInSessionOut>(`/check-ins/${id}`, { token });
}

export function getCheckInResults(token: string, id: string) {
  return api.get<CheckInResultsOut>(`/check-ins/${id}/results`, { token });
}

export function getReadingQuestions(token: string) {
  return api.get<QuestionSetOut>("/inner-readings/questions", { token });
}

export function submitInnerReading(token: string, answers: AnswerIn[], language: Language) {
  // The reading is written in this language synchronously; the other one is
  // generated in the background and is there by the time the user opens it
  // from history.
  return api.post<InnerReadingSubmitResponse>("/inner-readings", { answers, language }, { token });
}

export function listInnerReadings(token: string) {
  return api.get<InnerReadingOut[]>("/inner-readings", { token });
}

export function getInnerReading(token: string, id: string) {
  return api.get<InnerReadingOut>(`/inner-readings/${id}`, { token });
}

export function getLatestSnapshot(token: string) {
  return api.get<InnerStateSnapshotOut>("/state-snapshots/latest", { token });
}

export function getTrend(token: string, period: "weekly" | "monthly") {
  return api.get<TrendOut>("/state-snapshots/trend", { token, params: { period } });
}
