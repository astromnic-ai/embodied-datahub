import { redirect } from "next/navigation";
import { isAuthenticated } from "@/lib/auth";
import { AdminDashboard } from "@/components/admin/admin-dashboard";

export default async function AdminPage() {
  const authenticated = await isAuthenticated();
  
  if (!authenticated) {
    redirect("/admin/login");
  }

  return <AdminDashboard />;
}
