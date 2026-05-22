import type { ReactNode } from "react";
import { Footer } from "./Footer";
import { Header } from "./Header";

export function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-[100dvh] min-h-screen flex-col overflow-x-hidden">
      <Header />
      <main className="flex-1 w-full max-w-[100vw]">{children}</main>
      <Footer />
    </div>
  );
}
