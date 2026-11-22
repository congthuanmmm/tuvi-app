"use client";

export interface SavedChart {
  id: string;
  label: string | null;
  birth: { calendar_type: string; birth_time: { year: number; month: number; day: number; hour: number; minute: number }; gender: string };
  created_at: string;
}

export default function HistoryList({
  charts,
  activeId,
  onOpen,
  onDelete,
}: {
  charts: SavedChart[];
  activeId: string | null;
  onOpen: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  if (!charts.length) return null;
  return (
    <div className="mt-4 rounded-xl border border-amber-900/30 bg-amber-50/90 p-4 shadow-md">
      <h2 className="mb-2 font-semibold text-red-900">Lá số đã lưu</h2>
      <ul className="max-h-72 space-y-1 overflow-y-auto text-sm">
        {charts.map((c) => {
          const b = c.birth.birth_time;
          const pad = (n: number) => String(n).padStart(2, "0");
          return (
            <li key={c.id} className={`flex items-center gap-2 rounded-md px-2 py-1 ${c.id === activeId ? "bg-amber-200" : "hover:bg-amber-100"}`}>
              <button className="flex-1 text-left" onClick={() => onOpen(c.id)}>
                <span className="font-medium">{c.label || "Không tên"}</span>
                <span className="ml-1 text-stone-600">
                  {pad(b.day)}/{pad(b.month)}/{b.year} {pad(b.hour)}:{pad(b.minute)}
                  {c.birth.calendar_type === "lunar" ? " (âm)" : ""} · {c.birth.gender === "男" ? "Nam" : "Nữ"}
                </span>
              </button>
              <button className="text-stone-400 hover:text-red-700" title="Xóa" onClick={() => onDelete(c.id)}>
                ✕
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
