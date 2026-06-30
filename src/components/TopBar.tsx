import type { ReactNode } from "react";
import { ChevronLeft, Instagram } from "lucide-react";
import { useRouter } from "@tanstack/react-router";

interface TopBarProps {
  title?: string;
  showBack?: boolean;
  right?: ReactNode;
  onIgClick?: () => void;
}

export function TopBar({ title, showBack, right, onIgClick }: TopBarProps) {
  const router = useRouter();
  return (
    <header className="sticky top-0 z-30 flex items-center justify-between border-b border-line bg-cream/95 px-4 pb-3 pt-4 backdrop-blur-sm">
      <div className="flex min-w-[64px] items-center">
        {showBack ? (
          <button
            aria-label="Go back"
            onClick={() => router.history.back()}
            className="text-deep transition-transform active:scale-90"
          >
            <ChevronLeft size={24} />
          </button>
        ) : (
          <div className="leading-none md:hidden">
            <span className="font-serif text-[22px] font-semibold tracking-tight text-deep">
              liltreats
            </span>
            <span className="mt-[-2px] block text-[9px] font-bold uppercase tracking-[2px] text-gold">
              mystery scoops
            </span>
          </div>
        )}
      </div>

      {title && (
        <h1 className="font-serif text-[17px] font-semibold text-deep md:flex-1 md:pl-1 md:text-left md:text-[19px]">
          {title}
        </h1>
      )}

      <div className="flex min-w-[64px] items-center justify-end md:hidden">
        {right ??
          (!showBack && (
            <button
              onClick={onIgClick}
              className="flex items-center gap-1.5 rounded-full border border-lav-deep bg-lav px-3 py-1.5 text-[11px] font-bold text-lav-deep transition-transform active:scale-95"
            >
              <Instagram size={12} />
              @_liltreats_
            </button>
          ))}
      </div>
    </header>
  );
}
