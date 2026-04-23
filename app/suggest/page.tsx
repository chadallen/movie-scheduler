import { redirect } from "next/navigation";
import { checkAllowlist } from "@/lib/checkAllowlist";
import SearchMovies from "./SearchMovies";

// Protected route — requires authentication (enforced by proxy.ts).
// Allowlist is verified server-side before rendering content.
export default async function SuggestPage() {
  const { allowed } = await checkAllowlist();
  if (!allowed) {
    redirect("/not-authorized");
  }

  return (
    <main className="flex flex-1 flex-col items-center px-4 py-8">
      <div className="w-full max-w-md">
        <h1 className="text-3xl font-bold mb-6 text-wire-text">
          Suggest a Movie
        </h1>
        <SearchMovies />
      </div>
    </main>
  );
}
