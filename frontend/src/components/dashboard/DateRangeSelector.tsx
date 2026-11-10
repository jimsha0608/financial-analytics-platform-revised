import { DATE_RANGE_PRESET_LABELS, type DateRangePreset } from "@/utils/dateRanges";

interface DateRangeSelectorProps {
  preset: DateRangePreset;
  customFrom: string;
  customTo: string;
  onPresetChange: (preset: DateRangePreset) => void;
  onCustomChange: (from: string, to: string) => void;
}

const PRESETS: DateRangePreset[] = [
  "this_month",
  "last_month",
  "last_3_months",
  "last_6_months",
  "this_year",
  "custom",
];

export default function DateRangeSelector({
  preset,
  customFrom,
  customTo,
  onPresetChange,
  onCustomChange,
}: DateRangeSelectorProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {PRESETS.map((p) => (
        <button
          key={p}
          onClick={() => onPresetChange(p)}
          className={`rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
            preset === p
              ? "bg-brand-600 text-white"
              : "border border-slate-300 bg-white text-slate-600 hover:bg-slate-50"
          }`}
        >
          {DATE_RANGE_PRESET_LABELS[p]}
        </button>
      ))}
      {preset === "custom" && (
        <div className="flex items-center gap-2">
          <input
            type="date"
            value={customFrom}
            max={customTo || undefined}
            onChange={(e) => onCustomChange(e.target.value, customTo)}
            className="rounded-lg border border-slate-300 px-2 py-1.5 text-sm"
          />
          <span className="text-slate-400">to</span>
          <input
            type="date"
            value={customTo}
            min={customFrom || undefined}
            onChange={(e) => onCustomChange(customFrom, e.target.value)}
            className="rounded-lg border border-slate-300 px-2 py-1.5 text-sm"
          />
        </div>
      )}
    </div>
  );
}
