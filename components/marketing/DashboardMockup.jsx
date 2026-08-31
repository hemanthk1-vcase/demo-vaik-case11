export default function DashboardMockup({ className = "" }) {
  return (
    <div
      className={`rounded-xl border border-neutral-200 bg-white shadow-[0_8px_30px_rgba(0,0,0,0.06)] overflow-hidden ${className}`}
    >
      {/* window chrome */}
      <div className="flex items-center gap-2 px-4 h-10 border-b border-neutral-200 bg-neutral-50">
        <div className="w-2.5 h-2.5 rounded-full bg-neutral-300" />
        <div className="w-2.5 h-2.5 rounded-full bg-neutral-300" />
        <div className="w-2.5 h-2.5 rounded-full bg-neutral-300" />
        <div className="ml-3 h-5 flex-1 max-w-[220px] rounded bg-neutral-200" />
      </div>

      <div className="flex">
        {/* sidebar */}
        <div className="hidden sm:block w-36 border-r border-neutral-200 p-3 space-y-2.5 bg-neutral-50">
          <div className="h-3 w-20 rounded bg-neutral-800 mb-3" />
          {[72, 64, 80, 56, 68, 48].map((w, i) => (
            <div key={i} className="h-2.5 rounded bg-neutral-200" style={{ width: `${w}%` }} />
          ))}
        </div>

        {/* main panel */}
        <div className="flex-1 p-4 space-y-3 bg-white">
          <div className="grid grid-cols-3 gap-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="rounded-lg border border-neutral-200 p-3">
                <div className="h-2 w-12 rounded bg-neutral-300 mb-2" />
                <div className="h-4 w-16 rounded bg-neutral-900" />
              </div>
            ))}
          </div>
          <div className="rounded-lg border border-neutral-200">
            <div className="h-9 border-b border-neutral-200 flex items-center px-3 gap-2">
              <div className="h-2 w-24 rounded bg-neutral-300" />
              <div className="ml-auto h-5 w-16 rounded bg-neutral-900" />
            </div>
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className="flex items-center gap-3 px-3 py-2.5 border-t border-neutral-100"
              >
                <div className="w-6 h-6 rounded bg-neutral-200" />
                <div
                  className="h-2.5 rounded bg-neutral-200"
                  style={{ maxWidth: `${72 - i * 6}%`, width: "100%" }}
                />
                <div className="h-2.5 w-12 rounded bg-neutral-300" />
                <div className="h-5 w-16 rounded-full bg-neutral-100 border border-neutral-200" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}