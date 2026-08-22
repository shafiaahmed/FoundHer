import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/supabase/auth";
import { OnboardingForm } from "./OnboardingForm";

export default async function OnboardingPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login?next=/onboarding");
  }

  return <OnboardingForm userId={user.id} />;
}
