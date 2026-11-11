import { Link, useLocation } from "react-router-dom";
import { ArrowLeft, Compass, LayoutDashboard, SearchX } from "lucide-react";
import { PublicHeader, MarketingFooter } from "@/components/layout/public-layout";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function NotFoundPage() {
  const { user } = useAuth();
  const location = useLocation();
  const insideApp = location.pathname.startsWith("/app");

  return (
    <div className="min-h-dvh bg-[#F5F7FC] text-[#141B2D]">
      {!insideApp ? <PublicHeader /> : null}
      <main className="mx-auto flex min-h-[65dvh] max-w-2xl items-center px-4 py-12 sm:px-6">
        <Card className="w-full">
          <CardContent className="space-y-5 p-8 text-center">
            <div className="mx-auto flex size-12 items-center justify-center rounded-xl border border-[#E4E9F2] bg-[#EDF0F6] text-[#4E596E]">
              <SearchX className="size-6" />
            </div>
            <div className="space-y-1.5">
              <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-[#4263EB]">
                404 · Route Not Found
              </p>
              <h1 className="font-display text-2xl font-bold tracking-tight text-[#141B2D]">
                That page or record does not exist
              </h1>
              <p className="mx-auto max-w-md text-sm leading-6 text-[#68738A]">
                The requested URL does not match an active route, or the referenced task or session identifier is not
                present.
              </p>
              <p className="break-all font-mono text-[11px] text-[#68738A]">{location.pathname}</p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-2.5">
              <Button asChild variant="outline">
                <Link to={user ? "/app" : "/"}>
                  <ArrowLeft className="size-4" /> {user ? "Back to workspace" : "Back to home"}
                </Link>
              </Button>
              {user ? (
                <Button asChild>
                  <Link to="/app/workspace">
                    <Compass className="size-4" /> Agent workspace
                  </Link>
                </Button>
              ) : (
                <Button asChild>
                  <Link to="/login">
                    <LayoutDashboard className="size-4" /> Sign in
                  </Link>
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </main>
      {!insideApp ? <MarketingFooter /> : null}
    </div>
  );
}
