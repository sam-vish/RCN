import Link from "next/link";
import type { ReactNode } from "react";

const tabs = [
  { href: "/admin", label: "Branch page" },
  { href: "/admin/events", label: "Events" },
  { href: "/admin/inbox", label: "Inbox" },
  { href: "/team/dashboard", label: "Team area" },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <nav aria-label="Admin" className="fixed inset-x-0 top-[72px] z-30 border-b border-line bg-bg/95 backdrop-blur md:top-20">
        <ul className="wrap no-scrollbar flex gap-1 overflow-x-auto py-2 text-[14px] font-semibold">
          {tabs.map((t) => (
            <li key={t.href}>
              <Link href={t.href} className="block rounded-full px-4 py-1.5 hover:bg-ink/5">
                {t.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <div className="pt-12">{children}</div>
    </>
  );
}
