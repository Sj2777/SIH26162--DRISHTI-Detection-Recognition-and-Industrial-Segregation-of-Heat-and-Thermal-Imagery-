import { createFileRoute, Link } from "@tanstack/react-router";
import { Building2, ArrowLeft, ShieldAlert } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { INDUSTRIES as FALLBACK_INDUSTRIES } from "@/lib/demo-data";
import { useDemoSession } from "@/lib/demo-session";
import { useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";

export const Route = createFileRoute("/industries/")({
  component: IndustriesList,
});

function IndustriesList() {
  const navigate = useNavigate();
  const { session, ready } = useDemoSession();

  useEffect(() => {
    if (ready && !session) void navigate({ to: "/" });
  }, [ready, session, navigate]);

  const { data: industries = FALLBACK_INDUSTRIES } = useQuery({
    queryKey: ["industries"],
    queryFn: () => {
      return FALLBACK_INDUSTRIES;
    },
  });

  return (
    <div className="relative min-h-screen bg-background text-foreground">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_8%_0%,color-mix(in_oklab,var(--color-primary)_16%,transparent),transparent_32%)]" />

      <div className="relative z-10 mx-auto max-w-[1100px] px-4 py-6 sm:px-6">
        <Button variant="ghost" size="sm" asChild className="mb-5">
          <Link to="/dashboard">
            <ArrowLeft className="size-4" /> Back to control room
          </Link>
        </Button>

        <header className="rounded-xl border border-border bg-card p-5 shadow-xl mb-6">
          <div className="flex items-center gap-3">
            <div className="grid size-12 place-items-center rounded-lg bg-primary/20 text-primary ring-1 ring-primary/30">
              <Building2 className="size-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Industrial Facilities Directory</h1>
              <p className="text-sm text-muted-foreground">Monitor and investigate registered industrial sites in the district.</p>
            </div>
          </div>
        </header>

        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {industries.map((industry) => {
            const critical = industry.history.filter((entry) => entry.severity === "CRITICAL").length;
            
            return (
              <Link 
                key={industry.id} 
                to="/industries/$industryId"
                params={{ industryId: industry.id }}
                className="group flex flex-col justify-between rounded-xl border border-border bg-card p-5 shadow-sm transition-all hover:border-primary hover:shadow-md"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-primary">
                      {industry.category}
                    </div>
                    {critical > 0 && (
                      <span className="flex items-center gap-1 rounded bg-critical/10 px-1.5 py-0.5 text-[10px] font-bold text-critical">
                        <ShieldAlert className="size-3" /> {critical} CRITICAL
                      </span>
                    )}
                  </div>
                  <h2 className="mt-3 text-lg font-bold leading-tight group-hover:text-primary transition-colors">{industry.name}</h2>
                  <p className="mt-1 text-sm text-muted-foreground line-clamp-1">{industry.ward}</p>
                </div>
                
                <div className="mt-5 grid grid-cols-2 gap-2 border-t border-border pt-4">
                  <div className="text-center">
                    <div className="text-[10px] font-mono uppercase text-muted-foreground">Risk Score</div>
                    <div className="mt-1 font-bold">{industry.riskScore}</div>
                  </div>
                  <div className="text-center border-l border-border">
                    <div className="text-[10px] font-mono uppercase text-muted-foreground">Total Alerts</div>
                    <div className="mt-1 font-bold">{industry.history.length}</div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
