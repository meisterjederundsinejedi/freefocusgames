import { Header } from "./header";

/** Page frame: the always-visible top bar and the content area. No sidebar, no footer. */
export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="mx-auto w-full max-w-6xl px-6 py-8">{children}</main>
    </div>
  );
}
