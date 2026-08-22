import { Hero } from "@/components/Hero";
import { UseCases } from "@/components/UseCases";
import { WhyFoundHer } from "@/components/WhyFoundHer";
import { getMyProfile } from "@/lib/supabase/profile";

export default async function Home() {
  const profile = await getMyProfile();

  return (
    <>
      <Hero />
      <WhyFoundHer />
      <UseCases profile={profile} />
    </>
  );
}
