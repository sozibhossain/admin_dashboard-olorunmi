import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { authOptions } from "@/lib/auth-options";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session || session.role !== "admin") {
    redirect("/login");
  }

  return <DashboardShell>{children}</DashboardShell>;
}