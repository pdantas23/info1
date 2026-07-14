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
    return (await response.json()) as VturbSessionStats;
  } catch {
    return null;
  }
}
