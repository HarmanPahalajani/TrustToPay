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
    <div className="min-h-dvh bg-[#F7F5EF] text-[#202722]">
      {!insideApp ? <PublicHeader /> : null}
      <main className="container flex min-h-[65vh] max-w-2xl items-center py-12">
        <Card className="w-full border-[#E5E1D7] bg-[#FFFEFA] shadow-sm">
          <CardContent className="space-y-5 p-8 text-center">
            <div className="mx-auto flex size-12 items-center justify-center rounded-lg border border-[#E5E1D7] bg-[#F0EEE7] text-[#69736D]">
              <SearchX className="size-6" />
            </div>
            <div className="space-y-1.5">
              <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-[#365FEA]">
                404 · Route Not Found
              </p>
              <h1 className="font-display text-2xl font-bold tracking-tight text-[#202722]">
                That page or record does not exist
              </h1>
              <p className="mx-auto max-w-md text-sm leading-6 text-[#69736D]">
                The requested URL does not match an active route, or the referenced task/session identifier is no longer
                present in the current database.
              </p>
              <p className="break-all font-mono text-[11px] text-[#69736D]">{location.pathname}</p>
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
