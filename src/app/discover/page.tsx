import { Suspense } from "react";
import { DiscoverContent } from "./DiscoverContent";

export default function DiscoverPage() {
  return (
    <Suspense fallback={null}>
      <DiscoverContent />
    </Suspense>
  );
}
