import { Suspense } from "react";
import { HomeContent } from "@/components/home/home-content";

function HomeLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <section className="py-12 px-4 border-b bg-gradient-to-r from-primary/5 via-background to-primary/5">
        <div className="container max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <div className="h-10 w-64 bg-muted animate-pulse rounded mx-auto mb-3" />
            <div className="h-6 w-96 bg-muted animate-pulse rounded mx-auto" />
          </div>
          <div className="max-w-2xl mx-auto mb-6">
            <div className="h-12 bg-muted animate-pulse rounded" />
          </div>
        </div>
      </section>
      <section className="py-8 px-4">
        <div className="container max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-48 bg-muted animate-pulse rounded-lg" />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<HomeLoading />}>
      <HomeContent />
    </Suspense>
  );
}
