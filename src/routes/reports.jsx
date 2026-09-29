import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, BarChart3, Download, Timer, TriangleAlert } from "lucide-react";
import { useEffect } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis } from
"recharts";
import { toast } from "sonner";

import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { INDUSTRIES as FALLBACK_INDUSTRIES, MONTHLY_ALERTS as FALLBACK_MONTHLY, RESPONSE_TREND as FALLBACK_RESPONSE } from "@/lib/demo-data";
import { useDemoSession } from "@/lib/demo-session";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/reports")({
  head: () => ({
    meta: [
    { title: "Reports & charts — AGNI-VISION Municipal Watch" },
    {
      name: "description",
      content: "Monthly fire alert volumes, severity mix, response-time trend and per-industry incident counts for the municipality."
    },
    { property: "og:title", content: "Reports & charts — AGNI-VISION Municipal Watch" },
    {
      property: "og:description",
      content: "Monthly alert volumes, severity mix and response-time trends for municipal fire control."
    },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" }]
  }),
  component: ReportsPage
});

const SEVERITY_COLORS = ["var(--color-critical)", "var(--color-warning)", "var(--color-success)"];

function ReportsPage() {
  const navigate = useNavigate();
  const { session, ready } = useDemoSession();

  useEffect(() => {
    if (ready && !session) void navigate({ to: "/" });
  }, [ready, session, navigate]);

  const { data: industries = FALLBACK_INDUSTRIES } = useQuery({
    queryKey: ["industries"],
    queryFn: async () => {
      const res = await fetch("http://localhost:8000/api/industries");
      if (!res.ok) throw new Error("Network error");
      return res.json();
    }
  });

  const { data: monthlyAlerts = FALLBACK_MONTHLY } = useQuery({
    queryKey: ["stats", "monthly"],
    queryFn: async () => {
      const res = await fetch("http://localhost:8000/api/stats/monthly");
      if (!res.ok) throw new Error("Network error");
      return res.json();
    }
  });

  const { data: responseTrend = FALLBACK_RESPONSE } = useQuery({
    queryKey: ["stats", "response"],
    queryFn: async () => {
      const res = await fetch("http://localhost:8000/api/stats/response");
      if (!res.ok) throw new Error("Network error");
      return res.json();
    }
  });

  const totals = monthlyAlerts.reduce(
    (acc, row) => ({
      critical: acc.critical + row.critical,
      warning: acc.warning + row.warning,
      routine: acc.routine + row.routine
    }),
    { critical: 0, warning: 0, routine: 0 }
  );
  const total = totals.critical + totals.warning + totals.routine;
  const severityMix = [
  { name: "Critical", value: totals.critical },
  { name: "Warning", value: totals.warning },
  { name: "Routine", value: totals.routine }];

  const perIndustry = industries.map((industry) => ({
    name: industry.name.split(" ").slice(0, 2).join(" "),
    alerts: industry.history.length
  }));
  const latestResponse = responseTrend[responseTrend.length - 1]?.minutes ?? 0;

  const exportCsv = () => {
    const rows = [["Month", "Critical", "Warning", "Routine"], ...monthlyAlerts.map((r) => [r.month, r.critical, r.warning, r.routine])];
    const blob = new Blob([rows.map((r) => r.join(",")).join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "fire-alerts-report.csv";
    link.click();
    URL.revokeObjectURL(url);
    toast.success("Report downloaded");
  };

  return (
    <div className="relative min-h-screen bg-background text-foreground">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_90%_0%,color-mix(in_oklab,var(--color-primary)_14%,transparent),transparent_35%)]" />

      <div className="relative z-10 mx-auto max-w-[1200px] px-4 py-6 sm:px-6">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/dashboard"><ArrowLeft className="size-4" /> Back to control room</Link>
          </Button>
          <Button variant="outline" size="sm" onClick={exportCsv}><Download className="size-4" /> Export CSV</Button>
        </div>

        <header className="mb-5">
          <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.18em] text-primary">
            <BarChart3 className="size-3.5" /> Reports &amp; charts
          </div>
          <h1 className="mt-2 text-2xl font-bold">{session?.municipality ?? "Municipality"} — last 6 months</h1>
        </header>

        <div className="grid gap-3 sm:grid-cols-4">
          <Kpi value={total} label="Total alerts" tone="text-foreground" />
          <Kpi value={totals.critical} label="Critical incidents" tone="text-critical" icon={TriangleAlert} />
          <Kpi value={`${latestResponse}m`} label="Latest avg response" tone="text-success" icon={Timer} />
          <Kpi value={industries.length} label="Monitored industries" tone="text-info" />
        </div>

        <div className="mt-5 grid gap-5 lg:grid-cols-2">
          <Panel title="Alerts by month and severity">
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={monthlyAlerts}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="month" stroke="var(--color-muted-foreground)" fontSize={11} />
                <YAxis stroke="var(--color-muted-foreground)" fontSize={11} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="critical" stackId="a" fill="var(--color-critical)" radius={[0, 0, 0, 0]} />
                <Bar dataKey="warning" stackId="a" fill="var(--color-warning)" />
                <Bar dataKey="routine" stackId="a" fill="var(--color-success)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Panel>

          <Panel title="Severity mix">
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={severityMix} dataKey="value" nameKey="name" innerRadius={55} outerRadius={95} paddingAngle={3}>
                  {severityMix.map((entry, index) =>
                  <Cell key={entry.name} fill={SEVERITY_COLORS[index % SEVERITY_COLORS.length]} />
                  )}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-2 flex flex-wrap justify-center gap-4 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
              {severityMix.map((entry, index) =>
              <span key={entry.name} className="flex items-center gap-1.5">
                  <span className="size-2 rounded-full" style={{ backgroundColor: SEVERITY_COLORS[index] }} />
                  {entry.name} · {entry.value}
                </span>
              )}
            </div>
          </Panel>

          <Panel title="Average response time (minutes)">
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={responseTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="month" stroke="var(--color-muted-foreground)" fontSize={11} />
                <YAxis stroke="var(--color-muted-foreground)" fontSize={11} />
                <Tooltip contentStyle={tooltipStyle} />
                <Line type="monotone" dataKey="minutes" stroke="var(--color-primary)" strokeWidth={2.5} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </Panel>

          <Panel title="Recorded alerts per industry">
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={perIndustry} layout="vertical" margin={{ left: 24 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis type="number" stroke="var(--color-muted-foreground)" fontSize={11} />
                <YAxis type="category" dataKey="name" stroke="var(--color-muted-foreground)" fontSize={11} width={110} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="alerts" fill="var(--color-info)" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Panel>
        </div>

        <p className="mt-6 text-center font-mono text-[9px] uppercase tracking-wider text-muted-foreground">
          Figures are simulated for this prototype console
        </p>
      </div>
    </div>);

}

const tooltipStyle = {
  backgroundColor: "var(--color-popover)",
  border: "1px solid var(--color-border)",
  borderRadius: "8px",
  color: "var(--color-popover-foreground)",
  fontSize: "12px"
};

function Kpi({ value, label, tone, icon: Icon }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-center gap-2">
        {Icon ? <Icon className={cn("size-4", tone)} /> : null}
        <span className={cn("text-2xl font-bold", tone)}>{value}</span>
      </div>
      <div className="mt-1 font-mono text-[9px] uppercase tracking-wider text-muted-foreground">{label}</div>
    </div>);

}

function Panel({ title, children }) {
  return (
    <section className="rounded-xl border border-border bg-card p-4 shadow-xl">
      <div className="mb-4 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">{title}</div>
      {children}
    </section>);

}