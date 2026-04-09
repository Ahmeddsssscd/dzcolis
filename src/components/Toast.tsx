"use client";
import { useToast } from "@/lib/context";

export default function ToastContainer() {
  const { toasts, removeToast } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          onClick={() => removeToast(t.id)}
          className={`px-5 py-3 rounded-xl shadow-lg text-white text-sm font-medium cursor-pointer animate-[slideIn_0.3s_ease] ${
            t.type === "success" ? "bg-dz-green" : t.type === "error" ? "bg-dz-red" : "bg-dz-gray-700"
          }`}
        >
          {t.message}
        </div>
      ))}
    </div>
  );
}
