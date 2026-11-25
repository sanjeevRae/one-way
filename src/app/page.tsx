import { getContentStore } from "@/lib/db";
import HomeClient from "@/components/HomeClient";

// The homepage renders the live CMS content on the server, so the first
// paint (and search crawlers) see exactly what is stored in the database -
// no client-side fetch and no hardcoded fallback content.
export const dynamic = "force-dynamic";

export default async function HomePage() {
  const content = await getContentStore();
  return <HomeClient initialContent={content} />;
}
