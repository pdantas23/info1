"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Filter } from "lucide-react";
import { Select, Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

const PRESETS = [
  { value: "hoje", label: "Hoje" },
  { value: "7d", label: "Últimos 7 dias" },
  { value: "30d", label: "Últimos 30 dias" },
  { value: "90d", label: "Últimos 90 dias" },
  { value: "todos", label: "Todos" },
];

const FIELD_SIZE = "h-11 w-full";

export function PeriodFilter({ activeFrom, activeTo }: { activeFrom: string; activeTo: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const containerRef = useRef<HTMLDivElement>(null);

  const [open, setOpen] = useState(false);

  const isCustom = Boolean(searchParams.get("from") && searchParams.get("to"));
  const currentPeriod = isCustom ? "custom" : (searchParams.get("period") ?? "30d");

  const [from, setFrom] = useState(activeFrom);
  const [to, setTo] = useState(activeTo);

  // Mantém os campos "De"/"Até" sincronizados com o período resolvido no
  // servidor (inclusive quando o usuário escolhe um preset no dropdown),
  // ajustando o estado durante a renderização em vez de usar um efeito.
  const [syncedFrom, setSyncedFrom] = useState(activeFrom);
  const [syncedTo, setSyncedTo] = useState(activeTo);
  if (activeFrom !== syncedFrom || activeTo !== syncedTo) {
    setSyncedFrom(activeFrom);
    setSyncedTo(activeTo);
    setFrom(activeFrom);
    setTo(activeTo);
  }

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function applyPeriod(period: string) {
    router.push(`${pathname}?period=${period}`);
    setOpen(false);
  }

  function applyCustomRange() {
    if (!from || !to || from > to) return;
    router.push(`${pathname}?from=${from}&to=${to}`);
    setOpen(false);
  }

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-label="Filtrar período"
        className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-300 bg-white text-brand-700 hover:border-brand-300 hover:text-brand-900"
      >
        <Filter className="h-4 w-4" />
      </button>

      {open ? (
        <div className="absolute left-0 z-10 mt-2 w-56 rounded-xl border border-brand-100 bg-white p-4 shadow-lg">
          <div className="flex flex-col gap-3">
            <Select
              id="period"
              label="Período"
              value={currentPeriod}
              onChange={(e) => applyPeriod(e.target.value)}
              className={FIELD_SIZE}
            >
              {isCustom ? (
                <option value="custom" hidden>
                  Personalizado
                </option>
              ) : null}
              {PRESETS.map((preset) => (
                <option key={preset.value} value={preset.value}>
                  {preset.label}
                </option>
              ))}
            </Select>

            <Input id="from" type="date" label="De" value={from} onChange={(e) => setFrom(e.target.value)} className={FIELD_SIZE} />
            <Input id="to" type="date" label="Até" value={to} onChange={(e) => setTo(e.target.value)} className={FIELD_SIZE} />

            <Button size="md" variant="outline" onClick={applyCustomRange} disabled={!from || !to} className={FIELD_SIZE}>
              Aplicar
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
