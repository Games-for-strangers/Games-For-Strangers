import type { ReactNode } from "react";
import Header from "@/components/header";
import { Sidebar } from "@/components/sidebar";

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="min-h-svh xl:grid xl:grid-cols-[264px_minmax(0,1fr)]">
      <Sidebar />
      <div className="flex min-w-0 flex-col">
        <Header className="xl:hidden" />
        {children}
      </div>
    </div>
  );
}