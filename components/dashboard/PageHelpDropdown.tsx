import { CircleHelp, Info } from "lucide-react";

interface Props {
  title?: string;
  steps: string[];
  note?: string;
}

export default function PageHelpDropdown({ title = "Cum se folosește această pagină?", steps, note }: Props) {
  return (
    <details className="group mb-6 overflow-hidden rounded-2xl border border-blue-100 bg-blue-50/60">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 font-semibold text-blue-900 outline-none transition hover:bg-blue-50 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-600 [&::-webkit-details-marker]:hidden">
        <span className="flex items-center gap-2"><CircleHelp size={19} className="shrink-0 text-blue-600" aria-hidden="true" />{title}</span>
        <span className="select-none text-xl leading-none text-blue-600 transition-transform group-open:rotate-45" aria-hidden="true">+</span>
      </summary>
      <div className="border-t border-blue-100 bg-white px-5 py-4 text-sm text-slate-700">
        <ol className="space-y-2">{steps.map((step, index) => <li key={step} className="flex gap-3"><span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700">{index + 1}</span><span className="leading-5">{step}</span></li>)}</ol>
        {note && <p className="mt-4 flex items-start gap-2 rounded-xl bg-slate-50 px-3 py-2 text-xs leading-5 text-slate-600"><Info size={15} className="mt-0.5 shrink-0 text-blue-600" aria-hidden="true" />{note}</p>}
      </div>
    </details>
  );
}
