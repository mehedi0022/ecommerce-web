import Link from "next/link";

import { StoreContainer } from "./StoreContainer";

export function StoreFooter() {
  return (
    <footer className="mt-auto border-t">
      <StoreContainer>
        <div className="flex flex-col gap-4 py-8 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Store. All rights reserved.</p>

          <div className="flex gap-4">
            <Link href="/privacy" className="hover:text-foreground">
              Privacy
            </Link>

            <Link href="/terms" className="hover:text-foreground">
              Terms
            </Link>
          </div>
        </div>
      </StoreContainer>
    </footer>
  );
}
