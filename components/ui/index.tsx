import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { SHOW_PENDING } from "@/content/site";
import { LoopVideo } from "@/components/motion/LoopVideo";

/** Dashed marker for anything the ministry still has to confirm. Hidden with NEXT_PUBLIC_SHOW_PENDING=false. */
export function Pending({ children, className = "", tone = "light" }: { children: ReactNode; className?: string; tone?: "light" | "night" }) {
  if (!SHOW_PENDING) return null;
  const cls =
    tone === "night"
      ? "border-gold/60 bg-gold/10 text-[#ecd2b3]"
      : "border-accent/60 bg-accent/[0.06] text-accent-ink";
  return (
    <span className={`inline-flex items-start gap-2 rounded-md border border-dashed px-2.5 py-1.5 text-[13px] leading-snug ${cls} ${className}`}>
      <span aria-hidden className="mt-[6px] inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-current" />
      <span>
        <strong className="font-semibold">To confirm:</strong> {children}
      </span>
    </span>
  );
}

/** A visibly-labelled empty slot for media we don't have yet (PRD: never stock photos). */
export function PlaceholderMedia({
  label,
  className = "",
  tone = "light",
  children,
}: {
  label: string;
  className?: string;
  tone?: "light" | "night";
  children?: ReactNode;
}) {
  return (
    <div
      role="img"
      aria-label={`Placeholder: ${label}`}
      className={`placeholder-box relative grid place-items-center overflow-hidden rounded-2xl border-2 border-dashed p-6 text-center ${
        tone === "night" ? "border-gold/40 bg-night-2 text-on-night-muted" : "border-accent/40 bg-surface-alt text-muted"
      } ${className}`}
    >
      <div>
        <svg viewBox="0 0 24 24" className="mx-auto mb-2 h-7 w-7 opacity-70" aria-hidden>
          <rect x="3" y="5" width="18" height="14" rx="2" fill="none" stroke="currentColor" strokeWidth="1.5" />
          <circle cx="9" cy="10" r="1.6" fill="currentColor" />
          <path d="M4 17l5-4 3 2.5 3-3 5 4.5" fill="none" stroke="currentColor" strokeWidth="1.5" />
        </svg>
        <p className="text-[13px] font-semibold uppercase tracking-[0.14em]">{label}</p>
        {children}
      </div>
    </div>
  );
}

type BtnProps = {
  href: string;
  children: ReactNode;
  variant?: "primary" | "ghost" | "night" | "white";
  external?: boolean;
  className?: string;
} & Omit<ComponentProps<"a">, "href">;

const btnBase =
  "inline-flex min-h-12 items-center justify-center gap-2 rounded-full px-6 text-[15px] font-semibold tracking-wide transition-[background-color,color,border-color,transform] duration-200 active:scale-[0.98]";
export const btnVariants = {
  primary: "btn-accent shadow-[0_8px_24px_-12px_rgba(196,80,26,0.7)]",
  ghost: "border border-line-strong text-ink hover:border-ink",
  night: "border border-on-night/35 text-on-night hover:border-on-night hover:bg-on-night/10",
  white: "bg-on-night text-night hover:bg-white",
};

export function ButtonLink({ href, children, variant = "primary", external, className = "", ...rest }: BtnProps) {
  const cls = `${btnBase} ${btnVariants[variant]} ${className}`;
  if (external || /^(https?:|mailto:|tel:)/.test(href)) {
    const ext = href.startsWith("http");
    return (
      <a href={href} {...(ext ? { target: "_blank", rel: "noopener noreferrer" } : {})} className={cls} {...rest}>
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className={cls} {...rest}>
      {children}
    </Link>
  );
}

export function Arrow({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path d="M5 12h13M13 6l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function TextLink({ href, children, className = "", tone = "light" }: { href: string; children: ReactNode; className?: string; tone?: "light" | "night" }) {
  const cls = `group inline-flex items-center gap-1.5 border-b pb-0.5 text-[15px] font-semibold ${
    tone === "night" ? "border-gold/40 text-gold hover:border-gold" : "border-accent/40 text-accent-ink hover:border-accent-ink"
  } ${className}`;
  const inner = (
    <>
      {children}
      <Arrow className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
    </>
  );
  return href.startsWith("http") ? (
    <a href={href} target="_blank" rel="noopener noreferrer" className={cls}>
      {inner}
    </a>
  ) : (
    <Link href={href} className={cls}>
      {inner}
    </Link>
  );
}

export function SectionHead({
  eyebrow,
  title,
  intro,
  action,
  className = "",
  as: H = "h2",
}: {
  eyebrow?: string;
  title: ReactNode;
  intro?: ReactNode;
  action?: ReactNode;
  className?: string;
  as?: "h1" | "h2" | "h3";
}) {
  return (
    <div className={`flex flex-wrap items-end justify-between gap-x-10 gap-y-5 ${className}`}>
      <div className="max-w-3xl">
        {eyebrow && <p className="eyebrow mb-4">{eyebrow}</p>}
        <H className="display text-[clamp(30px,3.9vw,53px)]">{title}</H>
        {intro && <div className="mt-4 max-w-2xl text-[17px] text-muted md:text-lg">{intro}</div>}
      </div>
      {action}
    </div>
  );
}

/** Page header. With `video`, runs footage behind it on a dark band; otherwise a warm ivory header. */
export function PageHeader({
  kicker,
  title,
  intro,
  children,
  video,
  image,
}: {
  kicker?: string;
  title: string;
  intro?: ReactNode;
  children?: ReactNode;
  video?: string;
  image?: string;
}) {
  const dark = Boolean(video || image);
  return (
    <header
      className={`relative overflow-hidden ${dark ? "on-night flex min-h-[64svh] items-end bg-night pb-14 pt-40 text-on-night md:pb-20" : "border-b border-line pb-14 pt-36 md:pb-20 md:pt-44"}`}
    >
      {video && <LoopVideo name={video} priority className="absolute inset-0" />}
      {image && !video && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={image} alt="" aria-hidden fetchPriority="high" className="absolute inset-0 h-full w-full object-cover" />
      )}
      {dark ? (
        <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-night/95 via-night/50 to-night/15" />
      ) : (
        <div
          aria-hidden
          className="pointer-events-none absolute -right-40 -top-40 h-[560px] w-[760px] rounded-full opacity-[0.16] blur-3xl"
          style={{ background: "radial-gradient(closest-side, #df6526, transparent)" }}
        />
      )}
      <div className="wrap relative z-10">
        {kicker && <p className="eyebrow mb-5">{kicker}</p>}
        <h1 className="display max-w-5xl text-[clamp(34px,5.5vw,81px)]">{title}</h1>
        {intro && <div className={`mt-6 max-w-2xl text-lg md:text-xl ${dark ? "text-on-night/85" : "text-muted"}`}>{intro}</div>}
        {children}
      </div>
    </header>
  );
}

/** Intentional empty state: says what's coming and offers a next step (PRD §7). */
export function EmptyState({
  title,
  body,
  children,
  icon = "calendar",
}: {
  title: string;
  body: ReactNode;
  children?: ReactNode;
  icon?: "calendar" | "story" | "letter" | "photo" | "gift";
}) {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-line bg-surface p-8 md:p-12">
      <div aria-hidden className="absolute -right-10 -top-10 h-48 w-48 rounded-full bg-accent/10 blur-2xl" />
      <div className="relative grid gap-6 md:grid-cols-[auto_1fr] md:items-start md:gap-10">
        <span className="grid h-16 w-16 place-items-center rounded-2xl bg-surface-alt text-accent-ink">
          <Icon name={icon} className="h-7 w-7" />
        </span>
        <div className="max-w-2xl">
          <p className="display text-[clamp(23px,2.7vw,34px)]">{title}</p>
          <div className="mt-3 text-muted">{body}</div>
          {children && <div className="mt-6">{children}</div>}
        </div>
      </div>
    </div>
  );
}

const iconPaths: Record<string, ReactNode> = {
  youtube: (
    <>
      <rect x="2" y="5" width="20" height="14" rx="4" fill="none" stroke="currentColor" strokeWidth="1.7" />
      <path d="M10 9.2v5.6l4.8-2.8z" fill="currentColor" />
    </>
  ),
  instagram: (
    <>
      <rect x="3" y="3" width="18" height="18" rx="5" fill="none" stroke="currentColor" strokeWidth="1.7" />
      <circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" strokeWidth="1.7" />
      <circle cx="17.3" cy="6.7" r="1.1" fill="currentColor" />
    </>
  ),
  facebook: (
    <path d="M13.5 21v-7.5h2.6l.4-3h-3V8.6c0-.9.3-1.5 1.6-1.5h1.6V4.4c-.3 0-1.2-.1-2.3-.1-2.3 0-3.9 1.4-3.9 4v2.2H8v3h2.5V21z" fill="currentColor" />
  ),
  telegram: (
    <path d="M21 4.5L2.8 11.4c-.9.4-.9 1.4 0 1.7l4.5 1.4 1.7 5.3c.2.7 1.1.9 1.6.4l2.5-2.3 4.6 3.4c.8.5 1.7.1 1.9-.8L22.3 5.8c.3-1-.5-1.7-1.3-1.3zM9.3 14.2l8.2-6.9-6.4 7.8-.3 3.1z" fill="currentColor" />
  ),
  whatsapp: (
    <>
      <path d="M4 20l1.2-4.1A8 8 0 1 1 8.3 19z" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
      <path d="M9.2 8.6c.2-.4.5-.4.7-.4h.5c.2 0 .4.1.5.4l.6 1.5c.1.2 0 .4-.1.6l-.4.5c.5 1 1.3 1.8 2.3 2.3l.5-.4c.2-.1.4-.2.6-.1l1.5.6c.3.1.4.3.4.5v.5c0 .3-.1.5-.4.7-.6.4-1.5.5-2.4.1a8.4 8.4 0 0 1-4.3-4.3c-.4-.9-.3-1.8.1-2.4z" fill="currentColor" />
    </>
  ),
  pin: (
    <>
      <path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21z" fill="none" stroke="currentColor" strokeWidth="1.7" />
      <circle cx="12" cy="9.5" r="2.5" fill="none" stroke="currentColor" strokeWidth="1.7" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="8.5" fill="none" stroke="currentColor" strokeWidth="1.7" />
      <path d="M12 7.5V12l3 2" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </>
  ),
  calendar: (
    <>
      <rect x="3.5" y="5" width="17" height="15" rx="2.5" fill="none" stroke="currentColor" strokeWidth="1.7" />
      <path d="M3.5 10h17M8 3v4M16 3v4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </>
  ),
  mail: (
    <>
      <rect x="3" y="5.5" width="18" height="13" rx="2" fill="none" stroke="currentColor" strokeWidth="1.7" />
      <path d="M3.5 7l8.5 6 8.5-6" fill="none" stroke="currentColor" strokeWidth="1.7" />
    </>
  ),
  phone: (
    <path d="M6.6 3.5h2.6l1.3 4-2 1.3a11 11 0 0 0 6.7 6.7l1.3-2 4 1.3v2.6a2 2 0 0 1-2.2 2A16.5 16.5 0 0 1 4.6 5.7a2 2 0 0 1 2-2.2z" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
  ),
  story: (
    <path d="M5 4.5h10.5L19 8v11.5H5zM8.5 10h7M8.5 13.5h7M8.5 17h4" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
  ),
  letter: (
    <>
      <rect x="3" y="5.5" width="18" height="13" rx="2" fill="none" stroke="currentColor" strokeWidth="1.7" />
      <path d="M3.5 7l8.5 6 8.5-6" fill="none" stroke="currentColor" strokeWidth="1.7" />
    </>
  ),
  photo: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="2" fill="none" stroke="currentColor" strokeWidth="1.7" />
      <circle cx="9" cy="10" r="1.6" fill="currentColor" />
      <path d="M4 17l5-4 3 2.5 3-3 5 4.5" fill="none" stroke="currentColor" strokeWidth="1.7" />
    </>
  ),
  gift: (
    <>
      <rect x="4" y="9" width="16" height="11" rx="1.5" fill="none" stroke="currentColor" strokeWidth="1.7" />
      <path d="M3 9h18M12 9v11M12 9c-1.5-3.5-5-4-5-1.5S12 9 12 9zm0 0c1.5-3.5 5-4 5-1.5S12 9 12 9z" fill="none" stroke="currentColor" strokeWidth="1.7" />
    </>
  ),
  play: <path d="M8 5.5v13l10.5-6.5z" fill="currentColor" />,
  locate: (
    <>
      <circle cx="12" cy="12" r="6.5" fill="none" stroke="currentColor" strokeWidth="1.7" />
      <circle cx="12" cy="12" r="2" fill="currentColor" />
      <path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </>
  ),
  search: (
    <>
      <circle cx="11" cy="11" r="6.5" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <path d="M16 16l4.5 4.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </>
  ),
  users: (
    <>
      <circle cx="9" cy="8.5" r="3.2" fill="none" stroke="currentColor" strokeWidth="1.7" />
      <path d="M3 19.5c.6-3.4 3-5.2 6-5.2s5.4 1.8 6 5.2M15.5 5.6a3.2 3.2 0 0 1 0 6M17.5 14.6c1.9.6 3.1 2.2 3.5 4.9" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </>
  ),
  heart: (
    <path d="M12 20s-7.5-4.6-7.5-10.2A4.3 4.3 0 0 1 12 7.2a4.3 4.3 0 0 1 7.5 2.6C19.5 15.4 12 20 12 20z" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
  ),
  car: (
    <>
      <path d="M4 16.5V12l2-5h12l2 5v4.5zM4 12h16" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
      <circle cx="7.5" cy="16.5" r="1.8" fill="currentColor" />
      <circle cx="16.5" cy="16.5" r="1.8" fill="currentColor" />
    </>
  ),
  train: (
    <>
      <rect x="6" y="3.5" width="12" height="13" rx="3" fill="none" stroke="currentColor" strokeWidth="1.7" />
      <path d="M6 10h12M9 20.5l1.5-4M15 20.5l-1.5-4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </>
  ),
  video: (
    <>
      <rect x="3" y="6" width="13" height="12" rx="2" fill="none" stroke="currentColor" strokeWidth="1.7" />
      <path d="M16 10.5l5-3v9l-5-3" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
    </>
  ),
  check: <path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />,
  lock: (
    <>
      <rect x="5" y="10.5" width="14" height="10" rx="2" fill="none" stroke="currentColor" strokeWidth="1.7" />
      <path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" fill="none" stroke="currentColor" strokeWidth="1.7" />
    </>
  ),
};

export function Icon({ name, className = "h-5 w-5" }: { name: string; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      {iconPaths[name]}
    </svg>
  );
}

export function SocialIconLink({ href, icon, label, className = "" }: { href: string; icon: string; label: string; className?: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`${label} (opens in a new tab)`}
      className={`grid h-11 w-11 place-items-center rounded-full transition-colors ${className}`}
    >
      <Icon name={icon} />
    </a>
  );
}
