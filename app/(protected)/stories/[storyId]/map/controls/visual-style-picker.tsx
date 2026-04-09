"use client";

import {
  DEFAULT_MAP_VISUAL_STYLE,
  MAP_VISUAL_STYLE_OPTIONS,
} from "@/lib/ai/map-visual-styles";

export function VisualStylePicker({
  value,
  onChange,
  disabled,
}: {
  value: string;
  onChange: (styleId: string) => void;
  disabled?: boolean;
}) {
  const current =
    MAP_VISUAL_STYLE_OPTIONS.find((o) => o.id === value) ??
    MAP_VISUAL_STYLE_OPTIONS.find((o) => o.id === DEFAULT_MAP_VISUAL_STYLE)!;

  return (
    <div className="flex min-w-0 max-w-[min(100vw-8rem,16rem)] flex-col gap-1">
      <label
        htmlFor="map-visual-style"
        className="text-xs font-medium text-zinc-500 dark:text-zinc-400"
      >
        Visual style
      </label>
      <select
        id="map-visual-style"
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        className="max-w-full truncate rounded-md border border-zinc-300 bg-white px-2 py-1.5 text-sm text-zinc-900 shadow-sm dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100"
        title={current.hint}
      >
        {MAP_VISUAL_STYLE_OPTIONS.map((o) => (
          <option key={o.id} value={o.id} title={o.hint}>
            {o.label}
          </option>
        ))}
      </select>
      <p className="line-clamp-2 text-[10px] leading-snug text-zinc-500 dark:text-zinc-400">
        {current.hint}
      </p>
    </div>
  );
}
