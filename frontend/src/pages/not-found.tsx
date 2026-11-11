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
      <main className="mx-auto flex min-h-[65dvh] max-w-2xl items-center px-4 py-12 sm:px-6">
        <Card className="w-full">
          <CardContent className="space-y-5 p-8 text-center">
            <div className="mx-auto flex size-12 items-center justify-center rounded-xl bg-[#F0EEE7] text-[#444D47]">
              <SearchX className="size-6" />
            </div>
            <div className="space-y-2">
              <h1 className="font-display text-2xl font-bold tracking-tight text-[#202722]">
                Page not found
              </h1>
              <p className="mx-auto max-w-md text-sm leading-6 text-[#444D47]">
                The page you requested could not be found. Check the web address or return to your dashboard.
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-2.5">
              <Button asChild variant="outline">
                <Link to={user ? "/app" : "/"}>
                  <ArrowLeft className="size-4" /> {user ? "Back to dashboard" : "Back to home"}
                </Link>
              </Button>
              {user ? (
                <Button asChild>
                  <Link to="/app/workspace">
                    <Compass className="size-4" /> New Task
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
