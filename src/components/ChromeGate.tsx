"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

export default function ChromeGate({
  header,
  footer,
  children,
}: {
  header: ReactNode;
  footer: ReactNode;
  children: ReactNode;
}) {
  const path = usePathname() ?? "";
  const inApp = path.startsWith("/app") || path.startsWith("/admin");
  return (
    <>
      {!inApp && header}
      <main>{children}</main>
      {!inApp && footer}
    </>
  );
}
