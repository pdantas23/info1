export type QuestionType = "single" | "multi" | "scale";

export type SectionKey = "perfil" | "estilo_de_vida" | "dores" | "objetivos";

export const SECTION_LABEL: Record<SectionKey, string> = {
  perfil: "Perfil",
  estilo_de_vida: "Estilo de vida",
  dores: "Dores",
  objetivos: "Objetivos",
};

export type Question = {
  id: string;
  section: SectionKey;
  type: QuestionType;
  question: string;
  options?: string[];
};

export const QUESTIONS: Question[] = [
  // Perfil
  {
    id: "edad",
    section: "perfil",
    type: "single",
    question: "¿Cuál es tu rango de edad?",
    options: ["Menos de 45", "45-54", "55-64", "65-74", "75+"],
  },
  { id: "genero", section: "perfil", type: "single", question: "¿Cuál es tu género?", options: ["Femenino", "Masculino", "Prefiero no decirlo"] },
  {
    id: "articulaciones_al_despertar",
    section: "perfil",
    type: "single",
    question: "Al despertar, ¿cómo sientes tus articulaciones?",
    options: ["Rígidas y adoloridas", "Un poco entumecidas", "Normales"],
  },
  {
    id: "diagnostico_medico",
    section: "perfil",
    type: "single",
    question: "¿Algún médico te ha dicho que tienes desgaste, artrosis, artritis o hernia?",
    options: ["Sí", "No", "No estoy seguro/a"],
  },
  {
    id: "evolucion_dolor",
    section: "perfil",
    type: "single",
    question: "En los últimos 6 meses, ¿tu dolor empeoró, siguió igual o mejoró?",
    options: ["Empeoró", "Siguió igual", "Mejoró"],
  },
  { id: "mobilidad_hoy", section: "perfil", type: "scale", question: "Del 1 al 10, ¿cómo calificas tu movilidad hoy?" },

  // Estilo de vida
  {
    id: "horas_sentado",
    section: "estilo_de_vida",
    type: "single",
    question: "¿Cuántas horas al día pasas sentado sin levantarte?",
    options: ["Menos de 4h", "Entre 4 y 8h", "Más de 8h"],
  },
  {
    id: "intento_en_casa",
    section: "estilo_de_vida",
    type: "single",
    question: "¿Ya intentaste ejercitarte en casa y sentiste que empeoró el dolor en vez de ayudar?",
    options: ["Sí", "No", "Nunca lo intenté"],
  },
  {
    id: "equipamiento",
    section: "estilo_de_vida",
    type: "single",
    question: "¿Tienes espacio o equipamiento en casa, o prefieres algo sin ningún equipo?",
    options: ["Tengo equipamiento", "Tengo espacio, sin equipo", "Prefiero sin nada de eso"],
  },
  {
    id: "minutos_disponibles",
    section: "estilo_de_vida",
    type: "single",
    question: "¿Cuántos minutos al día puedes dedicar realmente a esto?",
    options: ["5 a 10 min", "10 a 15 min", "15 a 30 min"],
  },
  {
    id: "guiado_o_solo",
    section: "estilo_de_vida",
    type: "single",
    question: "¿Prefieres que te guíen paso a paso, o ya sabes qué hacer y solo te falta constancia?",
    options: ["Guiado paso a paso", "Solo me falta constancia"],
  },
  {
    id: "rutina_fija_o_flexible",
    section: "estilo_de_vida",
    type: "single",
    question: "¿Prefieres una rutina fija todos los días o algo flexible?",
    options: ["Rutina fija", "Algo flexible"],
  },

  // Dores
  {
    id: "zona_dolor",
    section: "dores",
    type: "multi",
    question: "¿Qué parte del cuerpo te molesta o traba más?",
    options: ["Rodilla", "Espalda baja", "Cadera", "Hombro", "Tobillo", "Cuello"],
  },
  {
    id: "tiempo_con_dolor",
    section: "dores",
    type: "single",
    question: "¿Hace cuánto tiempo convives con este dolor?",
    options: ["Menos de 6 meses", "De 6 meses a 2 años", "Más de 2 años"],
  },
  {
    id: "peor_momento",
    section: "dores",
    type: "single",
    question: "¿Cuándo es peor?",
    options: ["Al levantarme de la cama", "Al subir escaleras", "Mucho tiempo de pie", "Por la noche al dormir"],
  },
  {
    id: "rechazo_planes",
    section: "dores",
    type: "single",
    question: "¿Ya rechazaste un paseo, viaje o encuentro por culpa del dolor?",
    options: ["Sí, más de una vez", "Sí, ya me pasó", "Nunca"],
  },
  {
    id: "chasquidos",
    section: "dores",
    type: "single",
    question: "¿Sientes chasquidos, bloqueos o una sensación de \"arenilla\" en la articulación?",
    options: ["Sí, con frecuencia", "A veces", "No"],
  },
  { id: "impacto_animo", section: "dores", type: "scale", question: "Del 1 al 10, ¿cuánto te quita este dolor tu energía y tu ánimo en el día a día?" },

  // Objetivos
  {
    id: "intentos_previos",
    section: "objetivos",
    type: "multi",
    question: "¿Ya intentaste resolver esto antes?",
    options: ["Fisioterapia", "Medicamentos", "Gimnasio", "Nada todavía"],
  },
  {
    id: "motivo_abandono",
    section: "objetivos",
    type: "multi",
    question: "¿Qué te hizo abandonarlo?",
    options: ["Dolía más durante el ejercicio", "Sin resultados", "Faltó tiempo", "Costo alto", "No abandoné"],
  },
  {
    id: "si_desapareciera",
    section: "objetivos",
    type: "single",
    question: "Si este dolor desapareciera, ¿qué harías primero?",
    options: ["Jugar con mis nietos en el suelo", "Viajar sin miedo", "Bajar escaleras sin sujetarme", "Volver a hacer lo que amaba"],
  },
  {
    id: "miedo_empeorar",
    section: "objetivos",
    type: "single",
    question: "¿Temes que este dolor empeore y limite aún más tu independencia en el futuro?",
    options: ["Sí, mucho miedo", "Un poco", "No lo había pensado"],
  },
  {
    id: "plazo_esperado",
    section: "objetivos",
    type: "single",
    question: "¿En cuánto tiempo te gustaría sentir una diferencia?",
    options: ["En pocos días", "En 2 a 4 semanas", "En algunos meses"],
  },
  {
    id: "disposicion_cambio",
    section: "objetivos",
    type: "scale",
    question: "Del 1 al 10, ¿cuánto estás dispuesto/a a cambiar tu rutina para que esta vez funcione?",
  },
];
