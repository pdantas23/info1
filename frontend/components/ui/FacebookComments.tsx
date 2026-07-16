import { ThumbsUp } from "lucide-react";

export type FacebookComment = {
  photoUrl?: string;
  initials?: string;
  avatarColor?: string;
  name: string;
  text: string;
  time: string;
  likes: number;
  replies?: FacebookComment[];
};

// Copy de EJEMPLO para mostrarle al cliente el formato/tono final — nombres
// genéricos y avatares por iniciales, sin fotos ni personas reales. Antes de
// producción, reemplazar por reseñas reales de compradores (con permiso):
// inventar testimonios atribuidos a alguien —y sobre todo usar su foto sin
// permiso— es publicidad engañosa y uso indebido de imagen.
export const PLACEHOLDER_COMMENTS: FacebookComment[] = [
  {
    photoUrl: "https://media.istockphoto.com/id/2096494655/pt/foto/portrait-of-a-happy-senior-couple-sitting-on-sofa-at-home.jpg?b=1&s=612x612&w=0&k=20&c=EtJ6OHjtKCn4HoMSqfTADGyoZSLv6r0wpkfXswCO0D4=",
    name: "María González",
    text: "Llevo 3 semanas siguiendo el programa y ya noto la diferencia al levantarme 🙌 Antes me costaba agacharme y ahora lo hago sin pensarlo. Vale cada peso.",
    time: "2 d",
    likes: 14,
  },
  {
    photoUrl: "https://images.pexels.com/photos/16795991/pexels-photo-16795991.jpeg",
    name: "Carlos Ramírez",
    text: "Al principio dudé porque ya había probado otras cosas y no funcionaron, pero esto es distinto. Rutinas cortas de verdad, no exagera. No me arrepiento de haberlo comprado.",
    time: "3 d",
    likes: 9,
    replies: [
      {
        photoUrl: "https://media.istockphoto.com/id/1276778124/pt/foto/beautiful-senior-woman-outdoors-in-the-city.jpg?b=1&s=612x612&w=0&k=20&c=3V3yMb3wHrBXwMU6U21K8bH-yvwMclm0IoM5kbX6Lc0=",
        name: "Daniela Torres",
        text: "Totalmente de acuerdo, a mí me pasó lo mismo con las rodillas.",
        time: "3 d",
        likes: 3,
      },
    ],
  },
  {
    photoUrl: "https://images.pexels.com/photos/16876988/pexels-photo-16876988.jpeg",
    name: "Roberto Méndez",
    text: "Se lo recomendé a mi hermana que también tiene molestias en la espalda. Muy fácil de seguir, hasta yo que no soy nada deportista pude mantener el ritmo.",
    time: "4 d",
    likes: 21,
  },
  {
    photoUrl: "https://media.istockphoto.com/id/1316201778/pt/foto/happy-senior-woman-smiling-at-home.jpg?b=1&s=612x612&w=0&k=20&c=pFniiVLnoyysEGgckZajjnuoTwLwERgi8JSDseeN3bY=",
    name: "Ana Sánchez",
    text: "Justo lo que necesitaba, gracias 😊 Empecé hace 10 días y ya duermo mejor porque el cuerpo no me duele tanto.",
    time: "5 d",
    likes: 6,
  },
  {
    photoUrl: "https://images.pexels.com/photos/21612535/pexels-photo-21612535.jpeg",
    name: "Javier Pardo",
    text: "¿El acceso es de por vida o hay que pagar de nuevo cada mes? Quiero comprarlo pero esa duda no me quedó clara.",
    time: "6 d",
    likes: 1,
    replies: [
      {
        photoUrl: "https://images.pexels.com/photos/31599664/pexels-photo-31599664.jpeg",
        name: "María González",
        text: "Es de por vida, a mí no me han cobrado nada más desde que compré.",
        time: "6 d",
        likes: 4,
      },
    ],
  },
];

function LikeBadge({ likes }: { likes: number }) {
  if (likes <= 0) return null;
  return (
    <span className="absolute -bottom-1.5 right-2 flex items-center gap-0.5 rounded-full bg-white py-[1px] pl-[1px] pr-1.5 text-[11px] font-medium text-[#65676b] shadow-[0_1px_2px_rgba(0,0,0,0.2)]">
      <span className="flex h-3.5 w-3.5 items-center justify-center rounded-full bg-[#1877f2] ring-1 ring-white">
        <ThumbsUp className="h-2 w-2 text-white" fill="currentColor" />
      </span>
      {likes}
    </span>
  );
}

function CommentRow({ comment, isReply = false }: { comment: FacebookComment; isReply?: boolean }) {
  return (
    <div className="flex gap-2">
      <div
        className={`shrink-0 overflow-hidden rounded-full ${
          isReply ? "h-7 w-7" : "h-9 w-9"
        }`}
      >
        {comment.photoUrl ? (
          <img
            src={comment.photoUrl}
            alt={comment.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <div
            className="flex h-full w-full items-center justify-center bg-gray-400 font-bold text-white"
          >
            {comment.initials}
          </div>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="relative inline-block max-w-full rounded-[18px] bg-[#f0f2f5] px-3 py-2">
          <p className="text-[13px] font-semibold leading-[1.3333] text-[#050505]">{comment.name}</p>
          <p className="whitespace-pre-wrap break-words text-[15px] leading-[1.3333] text-[#050505]">{comment.text}</p>
          <LikeBadge likes={comment.likes} />
        </div>
        <div className="mt-1.5 flex items-center gap-3 px-3 text-[12px] font-semibold text-[#65676b]">
          <span className="font-normal">{comment.time}</span>
          <button type="button" className="hover:underline">
            Me gusta
          </button>
          <button type="button" className="hover:underline">
            Responder
          </button>
        </div>

        {comment.replies?.length ? (
          <div className="mt-2 space-y-2 border-l-2 border-[#e4e6eb] pl-3">
            {comment.replies.map((reply, index) => (
              <CommentRow key={index} comment={reply} isReply />
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}

export function FacebookComments({ comments }: { comments: FacebookComment[] }) {
  return (
    <div
      className="mx-auto max-w-xl rounded-lg border border-[#dadde1] bg-white p-4 shadow-sm sm:p-5"
      style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif' }}
    >
      <div className="mb-3 flex items-center justify-between border-b border-[#e4e6eb] pb-3">
        <p className="text-[15px] font-semibold text-[#050505]">{comments.length} comentarios</p>
        <button type="button" className="flex items-center gap-1 text-[13px] font-semibold text-[#65676b]">
          Más relevantes
          <svg viewBox="0 0 12 12" className="h-3 w-3 fill-current">
            <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>
      <div className="space-y-3">
        {comments.map((comment, index) => (
          <CommentRow key={index} comment={comment} />
        ))}
      </div>
    </div>
  );
}
