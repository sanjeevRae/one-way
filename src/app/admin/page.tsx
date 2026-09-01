import AdminPanel from "@/components/AdminPanel";
import LoginForm from "@/components/LoginForm";
import { getSessionUser } from "@/lib/auth";

// Render per request so the auth cookie is always re-checked.
export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const user = await getSessionUser();

  if (!user) {
    return <LoginForm />;
  }

  return <AdminPanel />;
}
