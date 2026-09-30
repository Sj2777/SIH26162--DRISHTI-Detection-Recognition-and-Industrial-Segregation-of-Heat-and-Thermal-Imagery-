import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft,
  Building2,
  Clock3,
  Flame,
  Mail,
  MapPin,
  Phone,
  Siren,
  UserRound,
} from "lucide-react";
import { useEffect } from "react";
import { toast } from "sonner";

import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { industryById, INDUSTRIES as FALLBACK_INDUSTRIES } from "@/lib/demo-data";
import { useDemoSession } from "@/lib/demo-session";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/industries/$industryId")({
  head: () => ({
    meta: [
      { title: "Industry fire history â€” AGNI-VISION Municipal Watch" },
      {
        name: "description",
        content:
          "Past fire alerts, response times and control-room contact details for a registered industrial facility.",
      },
      { property: "og:title", content: "Industry fire history â€” AGNI-VISION Municipal Watch" },
      {
        property: "og:description",
        content:
          "Past fire alerts, response times and contact details for a registered industrial facility.",
      },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: IndustryDetail,
});

function severityTone(severity) {
  return severity === "CRITICAL"
    ? "text-critical"
    : severity === "WARNING"
      ? "text-warning"
      : "text-success";
}

function IndustryDetail() {
  const { industryId } = Route.useParams();
  const navigate = useNavigate();
  const { session, ready } = useDemoSession();

  useEffect(() => {
    if (ready && !session) void navigate({ to: "/" });
  }, [ready, session, navigate]);

  const { data: industry, isLoading } = useQuery({
    queryKey: ["industry", industryId],
    queryFn: async () => {
      throw new Error("Offline");
    },
    initialData: () => industryById(industryId),
  });

  const { data: industries = FALLBACK_INDUSTRIES } = useQuery({
    queryKey: ["industries"],
    queryFn: async () => {
      throw new Error("Not found");
    },
  });

  if (isLoading) {
    return (
      <div className="grid min-h-screen place-items-center bg-background px-4">Loading...</div>
    );
  }

  if (!industry) {
    return (
      <div className="grid min-h-screen place-items-center bg-background px-4 text-center text-foreground">
        <div>
          <h1 className="text-xl font-semibold">Industry not found</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Pick a facility from the control room list.
          </p>
          <Button className="mt-5" asChild>
            <Link to="/dashboard">Back to control room</Link>
          </Button>
        </div>
      </div>
    );
  }

  const critical = industry.history.filter((entry) => entry.severity === "CRITICAL").length;
  const avgResponse = Math.round(
    industry.history.reduce((sum, entry) => sum + entry.responseMins, 0) / industry.history.length,
  );

  return (
    <div className="relative min-h-screen bg-background text-foreground">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_8%_0%,color-mix(in_oklab,var(--color-primary)_16%,transparent),transparent_32%)]" />

      <div className="relative z-10 mx-auto max-w-[1100px] px-4 py-6 sm:px-6">
        <Button variant="ghost" size="sm" asChild className="mb-5">
          <Link to="/dashboard">
            <ArrowLeft className="size-4" /> Back to control room
          </Link>
        </Button>

        <header className="rounded-xl border border-border bg-card p-5 shadow-xl">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-primary">
                {industry.category}
              </div>
              <h1 className="mt-2 text-2xl font-bold leading-tight">{industry.name}</h1>
              <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
                <MapPin className="size-4" /> {industry.ward}
              </p>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <Stat
                value={industry.riskScore}
                label="Risk score"
                tone={industry.riskScore > 80 ? "text-critical" : "text-warning"}
              />
              <Stat value={critical} label="Critical fires" tone="text-critical" />
              <Stat value={`${avgResponse}m`} label="Avg response" tone="text-success" />
            </div>
          </div>
        </header>

        <div className="mt-5 grid gap-5 lg:grid-cols-[1.4fr_1fr]">
          <section className="rounded-xl border border-border bg-card p-5 shadow-xl">
            <div className="mb-4 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
              <Flame className="size-3.5 text-critical" /> Past fire alerts
            </div>
            <div className="space-y-3">
              {industry.history.map((entry) => (
                <div key={entry.id} className="rounded-lg border border-border bg-secondary/35 p-3">
                  <div className="flex flex-wrap items-center justify-between gap-2 font-mono text-[9px] uppercase tracking-wider">
                    <span className={severityTone(entry.severity)}>
                      {entry.severity} Â· {entry.id}
                    </span>
                    <span className="text-muted-foreground">
                      {new Date(entry.date).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                  <div className="mt-1.5 text-sm font-medium">{entry.outcome}</div>
                  <div className="mt-1.5 flex flex-wrap gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <Siren className="size-3" /> FRP {entry.frp} MW
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Clock3 className="size-3" /> Response {entry.responseMins} min
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="space-y-5">
            <div className="rounded-xl border border-border bg-card p-5 shadow-xl">
              <div className="mb-4 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                <Building2 className="size-3.5 text-info" /> Contact details
              </div>
              <div className="space-y-3 text-sm">
                <ContactRow
                  icon={UserRound}
                  label="Site supervisor"
                  value={industry.contact.supervisor}
                />
                <ContactRow
                  icon={Phone}
                  label="Supervisor phone"
                  value={industry.contact.phone}
                  href={`tel:${industry.contact.phone.replace(/\s/g, "")}`}
                />
                <ContactRow
                  icon={Siren}
                  label="Plant control room"
                  value={industry.contact.controlRoom}
                  href={`tel:${industry.contact.controlRoom.replace(/\s/g, "")}`}
                />
                <ContactRow
                  icon={Mail}
                  label="Email"
                  value={industry.contact.email}
                  href={`mailto:${industry.contact.email}`}
                />
                <ContactRow icon={MapPin} label="Address" value={industry.contact.address} />
              </div>
              <Button
                variant="contact"
                className="mt-4 w-full"
                onClick={() =>
                  toast.success("Calling site supervisor", {
                    description: `${industry.contact.supervisor} Â· ${industry.contact.phone}`,
                  })
                }
              >
                <Phone className="size-4" /> Contact facility
              </Button>
            </div>

            <div className="rounded-xl border border-border bg-card p-5 shadow-xl">
              <div className="mb-3 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                Other facilities
              </div>
              <div className="space-y-2">
                {industries
                  .filter((item) => item.id !== industry.id)
                  .map((item) => (
                    <Link
                      key={item.id}
                      to="/industries/$industryId"
                      params={{ industryId: item.id }}
                      className="block rounded-lg border border-border bg-secondary/30 px-3 py-2 text-sm transition-colors hover:bg-secondary/60"
                    >
                      {item.name}
                      <span className="mt-0.5 block text-xs text-muted-foreground">
                        {item.ward}
                      </span>
                    </Link>
                  ))}
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function Stat({ value, label, tone }) {
  return (
    <div className="rounded-lg bg-secondary/45 p-2.5 text-center ring-1 ring-border">
      <div className={cn("text-lg font-semibold", tone)}>{value}</div>
      <div className="mt-1 font-mono text-[8px] uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
    </div>
  );
}

function ContactRow({ icon: Icon, label, value, href }) {
  return (
    <div className="flex items-start gap-3">
      <Icon className="mt-0.5 size-4 shrink-0 text-primary" />
      <div className="min-w-0">
        <div className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground">
          {label}
        </div>
        {href ? (
          <a
            href={href}
            className="break-words text-sm text-foreground underline-offset-4 hover:underline"
          >
            {value}
          </a>
        ) : (
          <div className="break-words text-sm">{value}</div>
        )}
      </div>
    </div>
  );
}


