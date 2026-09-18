import { HomeContent } from "./components/HomeContent";
import { readFullNameFromMetadata } from "@/lib/auth/userMetadata";
import { createClient } from "@/lib/supabase/server";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <HomeContent
      userEmail={user?.email ?? null}
      userName={readFullNameFromMetadata(user?.user_metadata)}
    />
  );
}
