import "server-only";
import { VTURB_VIDEO_ID } from "./config";

const ANALYTICS_BASE_URL = "https://analytics.vturb.net";

export type VturbSessionStats = {
  total_viewed: number;
  total_viewed_device_uniq: number;
  total_started: number;
  total_finished: number;
  engagement_rate: number;
  total_conversions: number;
  overall_conversion_rate: number;
  play_rate: number;
};

// La API exige "YYYY-MM-DD HH:MM:SS" (sin "T" ni offset) — probado a mano,
// el formato ISO con "T"/offset que muestra la documentación devuelve 400.
function formatDateTime(date: Date): string {
  return date.toISOString().slice(0, 19).replace("T", " ");
}

// Devuelve null si falta el token o si la API falla — el dashboard debe
// seguir funcionando (con las métricas de ventas) aunque VTurb esté caído.
export async function getVturbSessionStats(params: { start: Date; end: Date }): Promise<VturbSessionStats | null> {
  const token = process.env.VTURB_ANALYTICS_API_TOKEN;
  if (!token) return null;

  try {
    const response = await fetch(`${ANALYTICS_BASE_URL}/sessions/stats`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Api-Token": token,
        "X-Api-Version": "v1",
      },
      body: JSON.stringify({
        player_id: VTURB_VIDEO_ID,
        start_date: formatDateTime(params.start),
        end_date: formatDateTime(params.end),
        timezone: "UTC",
      }),
      cache: "no-store",
    });

    if (!response.ok) return null;

    // La API devuelve `engagement_rate`/`play_rate` como string (ej. "37.13"),
    // no number — probado a mano. El resto de los campos usados sí vienen
    // como number.
    const raw = (await response.json()) as Omit<VturbSessionStats, "engagement_rate" | "play_rate"> & {
      engagement_rate: string | number;
      play_rate: string | number;
    };

    return {
      ...raw,
      engagement_rate: Number(raw.engagement_rate),
      play_rate: Number(raw.play_rate),
    };
  } catch {
    return null;
  }
}
