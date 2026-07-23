import {
  PersonStanding,
  StretchHorizontal,
  Wind,
  Sparkles,
  Home,
  PiggyBank,
  Timer,
  Zap,
  CalendarClock,
  Footprints,
  BookOpenCheck,
  HeartHandshake,
  ListChecks,
  Award,
  Route,
  FileDown,
  MailCheck,
  Infinity,
  MonitorSmartphone,
  ShieldCheck,
  CreditCard,
  LifeBuoy,
  Globe,
} from "lucide-react";

// Contenido compartido del producto — usado tanto en /landing como en
// /resultado (página del quiz), para no repetir el copy en dos lugares.
export const BENEFITS = [
  { title: "Mayor movilidad", description: "Recupera tu rango de movimiento natural.", icon: PersonStanding },
  { title: "Más flexibilidad", description: "Músculos y articulaciones más libres.", icon: StretchHorizontal },
  { title: "Menos rigidez", description: "Reduce la tensión acumulada del día.", icon: Wind },
  { title: "Ejercicios fáciles", description: "Movimientos simples y fáciles de seguir.", icon: Sparkles },
  { title: "Desde casa", description: "Sin desplazamientos ni gimnasios.", icon: Home },
  { title: "Sin equipos costosos", description: "Todo con tu peso corporal.", icon: PiggyBank },
  { title: "Rutinas cortas", description: "Entre 10 y 15 minutos al día.", icon: Timer },
  { title: "Acceso inmediato", description: "Empieza en minutos tras tu compra.", icon: Zap },
  { title: "Disponible 24/7", description: "Practica cuando tú quieras.", icon: CalendarClock },
  { title: "Paso a paso", description: "Estructura clara semana a semana.", icon: Footprints },
  { title: "Fácil de seguir", description: "Explicaciones sencillas y claras.", icon: BookOpenCheck },
  { title: "Ideal para adultos", description: "Diseñado pensando en ti.", icon: HeartHandshake },
];

export const INCLUDES = [
  { title: "Programa completo", description: "Método estructurado semana a semana para avanzar sin frustrarte.", icon: ListChecks },
  { title: "Contenido de calidad", description: "Todo pensado para que veas resultados reales, sin complicaciones.", icon: Award },
  { title: "Guía paso a paso", description: "Sabrás exactamente qué hacer cada día, sin adivinar.", icon: Route },
  { title: "Material digital", description: "PDFs descargables, calendario y hojas de seguimiento.", icon: FileDown },
  { title: "Acceso inmediato", description: "Recibe tus accesos en tu correo justo después de pagar.", icon: MailCheck },
  { title: "Acceso ilimitado", description: "Sin fecha de vencimiento. Es tuyo para siempre.", icon: Infinity },
  { title: "Multi-dispositivo", description: "Compatible con celular, tablet y computadora.", icon: MonitorSmartphone },
];

export const AUDIENCE = [
  "Adultos que sienten rigidez o molestias al moverse.",
  "Personas que pasan muchas horas sentadas.",
  "Quienes quieren volver a caminar, agacharse o subir escaleras sin dolor.",
  "Adultos activos que buscan prevenir lesiones.",
  "Personas que prefieren entrenar en casa a su ritmo.",
  "Quienes ya probaron otras cosas y no vieron resultados.",
];

export const COMPARISON = [
  { feature: "Diseñado para adultos", ours: true },
  { feature: "Rutinas cortas (10–15 min)", ours: true },
  { feature: "Sin equipos ni gimnasio", ours: true },
  { feature: "Acceso inmediato y de por vida", ours: true },
  { feature: "Método paso a paso", ours: true },
  { feature: "Soporte incluido", ours: true },
  { feature: "Contenido genérico sin orden", ours: false },
  { feature: "Suscripciones caras mensuales", ours: false },
];

export const VIDEO_TESTIMONIALS = [
  { file: "relato1", name: "Verónica M.", location: "Guadalajara, México" },
  { file: "relato2", name: "Daniela F.", location: "Medellín, Colombia" },
];

export const GUARANTEES = [
  { title: "Compra segura", description: "Encriptación SSL de extremo a extremo.", icon: ShieldCheck },
  { title: "Pago protegido", description: "Procesadores reconocidos internacionalmente.", icon: CreditCard },
  { title: "Acceso inmediato", description: "Recibes tus accesos justo después de pagar.", icon: Zap },
  { title: "Soporte", description: "Estamos para ayudarte en el proceso.", icon: LifeBuoy },
  { title: "100% digital", description: "Sin envíos, sin esperas, todo online.", icon: Globe },
];

export const FAQS = [
  { question: "¿Cómo recibo el acceso después de pagar?", answer: "Recibirás un correo automático con tus datos de acceso justo después de completar la compra. Podrás empezar en minutos." },
  { question: "¿Necesito experiencia previa?", answer: "No. El programa está pensado desde cero, con explicaciones sencillas y progresivas." },
  { question: "¿Necesito equipos o material especial?", answer: "No hace falta nada. Los ejercicios se realizan con tu peso corporal y en cualquier espacio de tu casa." },
  { question: "¿Cuánto tiempo tengo que dedicar al día?", answer: "Entre 10 y 15 minutos son suficientes para ver resultados si eres constante." },
  { question: "¿Puedo verlo desde el celular?", answer: "Sí. El programa es compatible con celular, tablet y computadora." },
  { question: "¿El acceso caduca?", answer: "No. Una vez lo compras, el acceso es ilimitado y de por vida." },
  { question: "¿Es apto para personas mayores?", answer: "Sí, está diseñado especialmente pensando en adultos. Aun así, si tienes una condición médica, consulta a tu médico." },
  { question: "¿Qué pasa si no tengo tiempo todos los días?", answer: "Puedes seguir el programa a tu ritmo. Los avances quedan guardados en tu área privada." },
  { question: "¿El pago es seguro?", answer: "Sí. Usamos procesadores certificados con encriptación SSL. Tus datos están totalmente protegidos." },
  { question: "¿Qué métodos de pago aceptan?", answer: "Aceptamos las principales tarjetas de crédito, débito y otros métodos según tu país." },
];
