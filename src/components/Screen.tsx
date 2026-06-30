import type { ReactNode } from "react";

// Standard screen shell: fixed top bar + independently scrolling content.
// On desktop the content is centered within `maxW` for readability.
export function Screen({
  top,
  children,
  maxW = "max-w-2xl md:max-w-3xl",
  contentClass = "",
}: {
  top: ReactNode;
  children: ReactNode;
  maxW?: string;
  contentClass?: string;
}) {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {top}
      <main className={`flex-1 overflow-y-auto overscroll-contain ${contentClass}`}>
        <div className={`mx-auto w-full ${maxW}`}>{children}</div>
      </main>
    </div>
  );
}
