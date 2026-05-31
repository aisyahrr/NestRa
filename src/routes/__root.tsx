import {
  Outlet,
  Link,
  createRootRoute,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { Toaster } from "sonner";
import { KostProvider } from "../contexts/KostContext";
import { AppSidebar } from "../components/AppSidebar";

import appCss from "../index.css?url";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">
          Halaman tidak ditemukan
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Halaman yang Anda cari tidak ada.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Kembali
          </Link>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Nestra— Sistem Pendukung Keputusan" },
      {
        name: "description",
        content: "Sistem Pendukung Keputusan Pemilihan Kost Terbaik",
      },
    ],
    links: [{ rel: "stylesheet", href: appCss }],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  return (
    <KostProvider>
      <div className="h-screen w-full overflow-hidden p-3 md:p-6 lg:p-8">
        {/* MacBook Window Frame */}
        <div className="macbook-window mx-auto max-w-7xl h-full flex flex-col overflow-hidden">
          {/* Title bar with traffic lights — blueprint */}
          <div className="macbook-titlebar">
            <span className="traffic-light traffic-red" />
            <span className="traffic-light traffic-yellow" />
            <span className="traffic-light traffic-green" />
            <div className="flex-1 flex justify-center">
              <div className="rounded-full bg-primary px-4 py-1 tech-label text-foreground border-2 border-foreground">
                ✿ NESTRA — KOST FINDER
              </div>
            </div>
            <div className="font-hand text-foreground/70 hidden md:block text-lg">
              weighted product ✦
            </div>
          </div>

          {/* App body */}
          <div className="flex flex-1 w-full overflow-hidden">
            <AppSidebar />
            <main className="flex-1 overflow-auto no-scrollbar px-5 py-7 pb-12 blueprint-grid">
              <Outlet />
            </main>
          </div>
        </div>
      </div>
      <Toaster
        theme="light"
        toastOptions={{
          style: {
            background: "white",
            border: "2.5px solid black",
            color: "black",
            borderRadius: "16px",
            boxShadow: "5px 5px 0 0 black",
            fontWeight: 700,
          },
        }}
      />
    </KostProvider>
  );
}
