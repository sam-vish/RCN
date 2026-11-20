"use client";

import { useVideoModal } from "@/components/motion/VideoModal";
import { Icon } from "@/components/ui";

export function WatchLatest({ id, title, className = "" }: { id: string; title: string; className?: string }) {
  const { open } = useVideoModal();
  return (
    <a
      href={`https://www.youtube.com/watch?v=${id}`}
      onClick={(e) => {
        if (e.metaKey || e.ctrlKey) return;
        e.preventDefault();
        open(id, title);
      }}
      className={`inline-flex min-h-12 items-center justify-center gap-2.5 rounded-full border border-on-night/35 px-6 text-[15px] font-semibold text-on-night transition-colors hover:border-on-night hover:bg-on-night/10 ${className}`}
    >
      <span className="grid h-7 w-7 place-items-center rounded-full bg-on-night text-night">
        <Icon name="play" className="ml-0.5 h-3.5 w-3.5" />
      </span>
      Watch the latest message
    </a>
  );
}
