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
            <div className="mx-auto flex size-12 items-center justify-center rounded-xl bg-[#EDF0F6] text-[#4E596E]">
              <SearchX className="size-6" />
            </div>
            <div className="space-y-2">
              <h1 className="font-display text-2xl font-bold tracking-tight text-[#141B2D]">
                Page not found
              </h1>
              <p className="mx-auto max-w-md text-sm leading-6 text-[#4E596E]">
                The page or record you requested could not be found. Check the address or return to your workspace.
              </p>
              <p className="break-all font-mono text-xs text-[#68738A]">{location.pathname}</p>
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
                    <Compass className="size-4" /> AI Workspace
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
