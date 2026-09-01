import React, { useEffect, useState, useCallback } from "react";
import { slides } from "@/components/presentation-us/SlidesUS";
import { ChevronLeft, ChevronRight, Maximize, Minimize, Printer, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { buildVakilPptxUS } from "@/lib/vakilPptxUS";
import BrandLogo from "@/components/BrandLogo";

export default function PresentationUS() {
  const [index, setIndex] = useState(0);
  const [printMode, setPrintMode] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const go = useCallback((d) => setIndex((p) => Math.min(slides.length - 1, Math.max(0, p + d))), []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.();
      setIsFullscreen(false);
    }
  };

  const doPrint = () => {
    setPrintMode(true);
    setTimeout(() => { window.print(); setPrintMode(false); }, 400);
  };

  useEffect(() => {
    const onKey = (e) => {
      if (printMode) return;
      if (e.key === "ArrowRight" || e.key === " ") go(1);
      if (e.key === "ArrowLeft") go(-1);
      if (e.key === "f") toggleFullscreen();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go, printMode]);

  if (printMode) {
    return (
      <div className="bg-white">
        {slides.map((s, idx) => (
          <section key={idx} className="min-h-screen w-full p-12 flex flex-col justify-center break-after-page">
            <SlideView slide={s} />
          </section>
        ))}
      </div>
    );
  }

  const slide = slides[index];
  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col">
      <div className="flex items-center justify-between px-6 py-3 border-b border-white/10">
        <div className="flex items-center gap-2 font-semibold">
          <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-white p-1">
            <BrandLogo className="h-6 w-6" />
          </span>
          Vakil Case — US Sales Presentation · Demo.US.Vakilcase.com
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={buildVakilPptxUS} className="text-white hover:bg-white/10">
            <Download className="w-4 h-4 mr-1" /> Download PPTX
          </Button>
          <Button variant="ghost" size="sm" onClick={doPrint} className="text-white hover:bg-white/10">
            <Printer className="w-4 h-4 mr-1" /> Export PDF
          </Button>
          <Button variant="ghost" size="sm" onClick={toggleFullscreen} className="text-white hover:bg-white/10">
            {isFullscreen ? <Minimize className="w-4 h-4 mr-1" /> : <Maximize className="w-4 h-4 mr-1" />}
            {isFullscreen ? "Exit" : "Fullscreen"}
          </Button>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-4 md:p-8">
        <div className="w-full max-w-6xl">
          <SlideView slide={slide} />
        </div>
      </div>

      <div className="flex items-center justify-between px-6 py-3 border-t border-white/10">
        <Button variant="ghost" size="sm" onClick={() => go(-1)} disabled={index === 0} className="text-white hover:bg-white/10 disabled:opacity-30">
          <ChevronLeft className="w-4 h-4" /> Prev
        </Button>
        <div className="flex items-center gap-2">
          {slides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setIndex(idx)}
              className={`w-2 h-2 rounded-full transition ${idx === index ? "bg-white" : "bg-white/30 hover:bg-white/50"}`}
              aria-label={`Slide ${idx + 1}`}
            />
          ))}
        </div>
        <Button variant="ghost" size="sm" onClick={() => go(1)} disabled={index === slides.length - 1} className="text-white hover:bg-white/10 disabled:opacity-30">
          Next <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
      <div className="px-6 pb-2 text-center text-xs text-white/40">
        {index + 1} / {slides.length} · Use ← → to navigate · Press F for fullscreen
      </div>
    </div>
  );
}

function SlideView({ slide }) {
  return (
    <div className="bg-white text-slate-900 rounded-2xl shadow-2xl p-8 md:p-14 min-h-[78vh] flex flex-col">
      <div className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-600">{slide.tag}</div>
      <h2 className="text-2xl md:text-4xl font-bold mt-2 leading-tight">{slide.title}</h2>
      {slide.subtitle && <p className="text-base md:text-lg text-slate-500 mt-2 max-w-3xl">{slide.subtitle}</p>}
      <div className="mt-8 flex-1">{slide.content}</div>
      <div className="mt-6 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-x-4 gap-y-1 text-[11px] text-slate-400">
        <span>© 2026 Vakil Case</span>
        <span>Demo.US.Vakilcase.com</span>
      </div>
    </div>
  );
}