"use client";

import { useMemo, useState, type MouseEvent } from "react";
import { formatPrice } from "@/lib/format";

type DailyPoint = { date: string; revenueCents: number };

const VIEW_WIDTH = 1000;
const VIEW_HEIGHT = 260;
const PLOT_TOP = 16;
const PLOT_BOTTOM = 210;
const AXIS_LABEL_Y = 236;
const GRID_FRACTIONS = [0, 0.5, 1];
const BAR_COLOR = "#219b7d";
const BAR_COLOR_HOVER = "#1c8a70";
const GRID_COLOR = "#e1e0d9";
const AXIS_COLOR = "#c3c2b7";
const MUTED_TEXT = "#898781";

function niceMax(value: number) {
  if (value <= 0) return 100;
  const exponent = Math.floor(Math.log10(value));
  const magnitude = Math.pow(10, exponent);
  const fraction = value / magnitude;
  const niceFraction = fraction <= 1 ? 1 : fraction <= 2 ? 2 : fraction <= 5 ? 5 : 10;
  return niceFraction * magnitude;
}

function formatAxisDate(dateKey: string) {
  return new Date(`${dateKey}T00:00:00Z`).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    timeZone: "UTC",
  });
}

function roundedTopBarPath(x: number, y: number, width: number, height: number, radius: number) {
  if (height <= 0) return "";
  const r = Math.min(radius, width / 2, height);
  return `M${x},${y + height} L${x},${y + r} Q${x},${y} ${x + r},${y} L${x + width - r},${y} Q${x + width},${y} ${x + width},${y + r} L${x + width},${y + height} Z`;
}

export function DailySalesChart({ data, currency }: { data: DailyPoint[]; currency: string }) {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const [showTable, setShowTable] = useState(false);

  const plotHeight = PLOT_BOTTOM - PLOT_TOP;
  const max = useMemo(() => niceMax(Math.max(...data.map((point) => point.revenueCents), 0)), [data]);
  const slotWidth = VIEW_WIDTH / Math.max(data.length, 1);
  const barWidth = Math.max(Math.min(slotWidth * 0.6, 24), 1);
  const labelEvery = Math.max(Math.ceil(data.length / 7), 1);
  const hasSales = data.some((point) => point.revenueCents > 0);

  function handleMove(event: MouseEvent<SVGSVGElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    const ratio = (event.clientX - rect.left) / rect.width;
    const index = Math.min(data.length - 1, Math.max(0, Math.floor(ratio * data.length)));
    setHoverIndex(index);
  }

  const hovered = hoverIndex !== null ? data[hoverIndex] : null;
  const hoveredBarHeight = hovered && max > 0 ? (hovered.revenueCents / max) * plotHeight : 0;
  const tooltipTopPercent = hovered ? ((PLOT_BOTTOM - hoveredBarHeight) / VIEW_HEIGHT) * 100 : 0;
  const tooltipLeftPercent = hoverIndex !== null ? ((hoverIndex + 0.5) / data.length) * 100 : 0;

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-brand-900">Vendas por dia</h2>
          <p className="text-sm text-slate-500">Receita diária no período selecionado.</p>
        </div>
        <button
          type="button"
          onClick={() => setShowTable((value) => !value)}
          className="text-sm font-semibold text-brand-600 hover:text-brand-800"
        >
          {showTable ? "Ver gráfico" : "Ver como tabela"}
        </button>
      </div>

      {showTable ? (
        <div className="mt-4 max-h-72 overflow-y-auto rounded-xl border border-brand-100/70">
          <table className="w-full text-left text-sm">
            <thead className="sticky top-0 bg-brand-50 text-slate-500">
              <tr>
                <th className="px-4 py-2 font-semibold">Data</th>
                <th className="px-4 py-2 font-semibold">Receita</th>
              </tr>
            </thead>
            <tbody>
              {data.map((point) => (
                <tr key={point.date} className="border-t border-brand-50">
                  <td className="px-4 py-2 text-slate-700">{formatAxisDate(point.date)}</td>
                  <td className="px-4 py-2 text-slate-700">{formatPrice(point.revenueCents, currency)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="relative mt-4">
          <svg
            viewBox={`0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`}
            className="w-full"
            style={{ height: 260 }}
            onMouseMove={handleMove}
            onMouseLeave={() => setHoverIndex(null)}
          >
            {GRID_FRACTIONS.map((fraction) => {
              const y = PLOT_BOTTOM - plotHeight * fraction;
              return (
                <g key={fraction}>
                  <line x1={0} y1={y} x2={VIEW_WIDTH} y2={y} stroke={GRID_COLOR} strokeWidth={1} />
                  <text x={4} y={y - 4} fontSize={11} fill={MUTED_TEXT}>
                    {formatPrice(Math.round(max * fraction), currency)}
                  </text>
                </g>
              );
            })}

            {data.map((point, index) => {
              const slotX = slotWidth * index;
              const barX = slotX + (slotWidth - barWidth) / 2;
              const barHeight = max > 0 ? (point.revenueCents / max) * plotHeight : 0;
              const barY = PLOT_BOTTOM - barHeight;
              const isHovered = hoverIndex === index;
              return (
                <g key={point.date}>
                  <path
                    d={roundedTopBarPath(barX, barY, barWidth, barHeight, 3)}
                    fill={isHovered ? BAR_COLOR_HOVER : BAR_COLOR}
                  />
                  {index % labelEvery === 0 || index === data.length - 1 ? (
                    <text x={slotX + slotWidth / 2} y={AXIS_LABEL_Y} fontSize={11} fill={MUTED_TEXT} textAnchor="middle">
                      {formatAxisDate(point.date)}
                    </text>
                  ) : null}
                </g>
              );
            })}

            <line x1={0} y1={PLOT_BOTTOM} x2={VIEW_WIDTH} y2={PLOT_BOTTOM} stroke={AXIS_COLOR} strokeWidth={1} />
          </svg>

          {hovered ? (
            <div
              className="pointer-events-none absolute -translate-x-1/2 -translate-y-[calc(100%+8px)] rounded-lg border border-brand-100 bg-white px-3 py-2 text-xs shadow-lg"
              style={{ left: `${tooltipLeftPercent}%`, top: `${tooltipTopPercent}%` }}
            >
              <p className="font-semibold text-brand-900">{formatPrice(hovered.revenueCents, currency)}</p>
              <p className="text-slate-500">{formatAxisDate(hovered.date)}</p>
            </div>
          ) : null}

          {!hasSales ? <p className="mt-2 text-center text-sm text-slate-400">Nenhuma venda no período selecionado.</p> : null}
        </div>
      )}
    </div>
  );
}
