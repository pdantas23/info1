import type { Metadata, Viewport } from "next";
import { QuizExperience } from "./QuizExperience";

export const metadata: Metadata = {
  title: "Descubre tu plan de movilidad — Movilidad Total",
};

// Sin zoom (pellizco/doble-tap) — para que se sienta como una app nativa,
// no como una página web que se puede agrandar/achicar.
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function QuizPage() {
  return <QuizExperience />;
}
