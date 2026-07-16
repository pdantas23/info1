import { ThumbsUp } from "lucide-react";

export type FacebookComment = {
  initials: string;
  avatarColor: string;
  name: string;
  text: string;
  time: string;
  likes: number;
};

// TODO: reemplazar por reseñas reales de compradores (con su permiso). Estos
// son placeholders de ejemplo — publicar testimonios inventados como si
// fueran de clientes reales es publicidad engañosa en la mayoría de países.
export const PLACEHOLDER_COMMENTS: FacebookComment[] = [
  {
    initials: "??",
    avatarColor: "#94a3b8",
    name: "Nombre Apellido",
    text: "[Escribe acá un comentario real de un cliente que compró el programa]",
    time: "2 d",
    likes: 0,
  },
  {
    initials: "??",
    avatarColor: "#94a3b8",
    name: "Nombre Apellido",
    text: "[Escribe acá otro comentario real, por ejemplo alguien recomendando el programa]",
    time: "5 d",
    likes: 0,
  },
];

function CommentRow({ comment }: { comment: FacebookComment }) {
  return (
    <div className="flex gap-2.5">
      <span
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
        style={{ backgroundColor: comment.avatarColor }}
        aria-hidden="true"
      >
        {comment.initials}
      </span>
      <div className="min-w-0 flex-1">
        <div className="inline-block rounded-2xl bg-slate-100 px-3 py-2">
          <p className="text-sm font-semibold text-slate-900">{comment.name}</p>
          <p className="text-sm text-slate-800">{comment.text}</p>
        </div>
        <div className="mt-1 flex items-center gap-3 px-3 text-xs font-semibold text-slate-500">
          <button type="button" className="hover:underline">
            Me gusta
          </button>
          <button type="button" className="hover:underline">
            Responder
          </button>
          <span className="font-normal text-slate-400">{comment.time}</span>
          {comment.likes > 0 ? (
            <span className="ml-auto flex items-center gap-1 rounded-full bg-white px-1.5 py-0.5 text-slate-500 shadow-sm">
              <span className="flex h-3.5 w-3.5 items-center justify-center rounded-full bg-brand-600 text-white">
                <ThumbsUp className="h-2 w-2" fill="currentColor" />
              </span>
              {comment.likes}
            </span>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export function FacebookComments({ comments }: { comments: FacebookComment[] }) {
  return (
    <div className="mx-auto max-w-xl rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <p className="mb-4 text-sm font-semibold text-slate-500">Comentarios</p>
      <div className="space-y-4">
        {comments.map((comment, index) => (
          <CommentRow key={index} comment={comment} />
        ))}
      </div>
    </div>
  );
}
