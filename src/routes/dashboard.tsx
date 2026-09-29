import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  Activity, BarChart3, BellRing, Building2, ChevronLeft, ChevronRight, Flame,
  Gauge, Layers3, LogOut, MapPinned, Menu, Moon, Search, ShieldCheck, Siren,
  Sun, Volume2, VolumeX, XCircle,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis } from "recharts";
import { toast } from "sonner";

import municipalityMap from "@/assets/municipality-satellite-map.jpg";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { playAlertTone, pushDesktopNotification, requestNotificationPermission, setSoundEnabled, soundEnabled } from "@/lib/alert-signals";
import { INDUSTRIES, INCOMING_ALERTS, INITIAL_ALERTS, RESPONSE_TREND, type AlertStatus, type FireAlert } from "@/lib/demo-data";
import { initials, useDemoSession } from "@/lib/demo-session";
import { useTheme } from "@/lib/theme";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/dashboard")({
  head: () => ({ meta: [
    { title: "Fire Command Dashboard — AGNI-VISION" },
    { name: "description", content: "Municipal fire detection map, live alerts, risk zones and incident response controls." },
    { property: "og:title", content: "Fire Command Dashboard — AGNI-VISION" },
    { property: "og:description", content: "Municipal fire detection map, live alerts and incident response controls." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: Dashboard,
});

const actions: Array<{ label: string; status: AlertStatus }> = [
  { label: "Verify incident", status: "VERIFIED INCIDENT" },
  { label: "Escalate", status: "ESCALATED" },
  { label: "Resolve", status: "RESOLVED" },
  { label: "False positive", status: "FALSE POSITIVE" },
];

function Dashboard() {
  const navigate = useNavigate();
  const { session, ready, signOut } = useDemoSession();
  const { theme, setTheme } = useTheme();
  const [collapsed, setCollapsed] = useState(false);
  const [alerts, setAlerts] = useState<FireAlert[]>(INITIAL_ALERTS);
  const [selectedId, setSelectedId] = useState(INITIAL_ALERTS[0]?.id ?? "");
  const [sound, setSound] = useState(true);
  const [query, setQuery] = useState("");
  const incomingIndex = useRef(0);

  useEffect(() => { if (ready && !session) void navigate({ to: "/" }); }, [ready, session, navigate]);
  useEffect(() => setSound(soundEnabled()), []);
  useEffect(() => {
    const timer = window.setInterval(() => {
      const next = INCOMING_ALERTS[incomingIndex.current];
      if (!next) return window.clearInterval(timer);
      incomingIndex.current += 1;
      setAlerts((current) => [next, ...current]);
      setSelectedId(next.id);
      playAlertTone(next.severity);
      pushDesktopNotification(`${next.severity} fire alert`, `${next.facility} · ${next.location}`);
      toast.error(`${next.severity} alert · ${next.id}`, { description: next.facility });
    }, 18000);
    return () => window.clearInterval(timer);
  }, []);

  const selected = alerts.find((alert) => alert.id === selectedId) ?? alerts[0];
  const filteredAlerts = alerts.filter((alert) => `${alert.facility} ${alert.location} ${alert.id}`.toLowerCase().includes(query.toLowerCase()));
  const criticalCount = alerts.filter((alert) => alert.severity === "CRITICAL" && !["RESOLVED", "FALSE POSITIVE"].includes(alert.status)).length;
  const riskZones = INDUSTRIES.filter((industry) => industry.riskScore >= 65).length;
  const avgAccuracy = Math.round(alerts.reduce((sum, alert) => sum + alert.confidence, 0) / alerts.length);
  const mapUrl = useMemo(() => {
    if (!session) return "";
    const key = import.meta.env["VITE_GOOGLE_MAPS_BROWSER_KEY"];
    if (!key) return "";
    const place = encodeURIComponent(`${session.municipality}, ${session.state}, India`);
    return `https://www.google.com/maps/embed/v1/place?key=${key}&q=${place}&zoom=12&maptype=satellite`;
  }, [session]);

  if (!session || !selected) return null;

  const updateAlert = (status: AlertStatus, label: string) => {
    setAlerts((current) => current.map((alert) => alert.id === selected.id ? { ...alert, status } : alert));
    toast.success(label, { description: `${selected.id} · ${selected.facility}` });
  };

  const toggleSound = () => {
    const next = !sound;
    setSound(next); setSoundEnabled(next);
    if (next) playAlertTone("ROUTINE");
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="flex min-h-screen">
        <aside className={cn("sticky top-0 hidden h-screen shrink-0 flex-col border-r border-sidebar-border bg-sidebar transition-[width] duration-200 md:flex", collapsed ? "w-16" : "w-60")}>
          <div className="flex h-16 items-center gap-3 border-b border-sidebar-border px-4">
            <div className="grid size-9 shrink-0 place-items-center rounded-md bg-primary text-primary-foreground"><Flame className="size-5" /></div>
            {!collapsed && <div><div className="font-black">AGNI-VISION</div><div className="text-[9px] uppercase tracking-[0.16em] text-sidebar-muted">Fire intelligence</div></div>}
          </div>
          <nav className="flex-1 space-y-1 p-3">
            <NavItem icon={Gauge} label="Command" active collapsed={collapsed} />
            <NavItem icon={MapPinned} label="Live map" collapsed={collapsed} />
            <NavItem icon={Siren} label="Alerts" count={criticalCount} collapsed={collapsed} />
            <Link to="/reports"><NavItem icon={BarChart3} label="Reports" collapsed={collapsed} /></Link>
            <NavItem icon={Building2} label="Industries" collapsed={collapsed} />
          </nav>
          <div className="border-t border-sidebar-border p-3">
            {!collapsed && <div className="mb-3 rounded-md border border-sidebar-border bg-sidebar-accent p-3"><div className="text-[9px] uppercase text-sidebar-muted">Fixed jurisdiction</div><div className="mt-1 truncate text-sm font-semibold">{session.municipality}</div><div className="truncate text-xs text-sidebar-muted">{session.state}</div></div>}
            <Button variant="ghost" size="sm" className="w-full justify-start" onClick={() => setCollapsed(!collapsed)} aria-label={collapsed ? "Expand navigation" : "Collapse navigation"}>{collapsed ? <ChevronRight /> : <><ChevronLeft /> Collapse</>}</Button>
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-background/95 px-4 backdrop-blur sm:px-6">
            <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setCollapsed(!collapsed)} aria-label="Open navigation"><Menu /></Button>
            <div className="relative max-w-md flex-1"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search alerts, facilities or wards" className="pl-9" /></div>
            <div className="ml-auto hidden text-right lg:block"><div className="text-xs font-semibold">System active</div><div className="text-[10px] text-success">1,402 nodes online</div></div>
            <Button variant="ghost" size="icon" onClick={toggleSound} aria-label="Toggle alert sound">{sound ? <Volume2 /> : <VolumeX />}</Button>
            <Button variant="ghost" size="icon" onClick={() => void requestNotificationPermission()} aria-label="Enable notifications"><BellRing /></Button>
            <Button variant="ghost" size="icon" onClick={() => setTheme(theme === "dark" ? "light" : "dark")} aria-label="Toggle dark mode">{theme === "dark" ? <Sun /> : <Moon />}</Button>
            <div className="grid size-9 place-items-center rounded-full bg-secondary text-xs font-bold">{initials(session.name)}</div>
            <Button variant="ghost" size="icon" onClick={() => { signOut(); void navigate({ to: "/" }); }} aria-label="Sign out"><LogOut /></Button>
          </header>

          <main className="mx-auto max-w-[1600px] p-4 sm:p-6">
            <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
              <div><p className="text-xs font-semibold uppercase text-primary">Municipal command center</p><h1 className="mt-1 text-2xl font-bold">{session.municipality}</h1><p className="mt-1 text-sm text-muted-foreground">{session.state}, India · jurisdiction locked to this account</p></div>
              <div className="flex items-center gap-2 rounded-md border border-success/30 bg-success/10 px-3 py-2 text-xs font-semibold text-success"><span className="status-pulse size-2 rounded-full bg-success" /> Live monitoring</div>
            </div>

            <section className="grid grid-cols-2 gap-3 xl:grid-cols-4">
              <Kpi icon={Flame} label="Active fires" value={criticalCount} note="Requires attention" tone="text-critical" />
              <Kpi icon={MapPinned} label="Risk zones" value={riskZones} note="Across monitored wards" tone="text-warning" />
              <Kpi icon={Layers3} label="Monitored area" value="482 km²" note="Satellite coverage" tone="text-info" />
              <Kpi icon={ShieldCheck} label="Detection accuracy" value={`${avgAccuracy}%`} note="30-day confidence" tone="text-success" />
            </section>

            <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
              <section className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
                <div className="flex items-center justify-between border-b border-border px-4 py-3"><div><h2 className="font-semibold">Satellite fire map</h2><p className="text-xs text-muted-foreground">Focused on {session.municipality}</p></div><span className="rounded-md bg-primary/10 px-2 py-1 text-[10px] font-bold uppercase text-primary">Satellite</span></div>
                <div className="relative h-[500px] overflow-hidden bg-map-surface">
                  {mapUrl ? <iframe title={`Satellite map of ${session.municipality}`} src={mapUrl} className="absolute inset-0 size-full border-0" loading="eager" referrerPolicy="no-referrer-when-downgrade" /> : <img src={municipalityMap} alt={`Satellite map of ${session.municipality}`} className="absolute inset-0 size-full object-cover" />}
                  <div className="pointer-events-none absolute inset-0 bg-map-tint" />
                  {alerts.map((alert, index) => <button key={alert.id} type="button" onClick={() => setSelectedId(alert.id)} aria-label={`Open ${alert.id}`} className={cn("absolute grid size-8 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border-2 border-primary-foreground shadow-lg transition-transform hover:scale-110", alert.severity === "CRITICAL" ? "bg-critical text-critical-foreground" : alert.severity === "WARNING" ? "bg-warning text-warning-foreground" : "bg-success text-success-foreground", ["left-[49%] top-[44%]", "left-[36%] top-[62%]", "left-[67%] top-[34%]", "left-[61%] top-[58%]"][index % 4])}><Flame className="size-4" /></button>)}
                  <div className="absolute bottom-4 left-4 flex flex-wrap gap-3 rounded-md border border-map-border bg-map-overlay px-3 py-2 text-[10px] text-map-foreground shadow-lg"><Legend tone="bg-critical" label="Active fire" /><Legend tone="bg-warning" label="Hotspot" /><Legend tone="bg-success" label="Normal" /></div>
                  <div className="absolute right-4 top-4 rounded-md border border-map-border bg-map-overlay px-3 py-2 text-right text-map-foreground shadow-lg"><div className="text-[9px] uppercase text-map-muted">Viewing</div><div className="text-xs font-semibold">{session.municipality}</div></div>
                </div>
              </section>

              <aside className="rounded-lg border border-border bg-card shadow-sm">
                <div className="flex items-center justify-between border-b border-border px-4 py-3"><div><h2 className="font-semibold">Live alerts</h2><p className="text-xs text-muted-foreground">Priority queue</p></div><span className="rounded-md bg-critical/10 px-2 py-1 text-[10px] font-bold text-critical">{criticalCount} CRITICAL</span></div>
                <div className="max-h-[548px] space-y-2 overflow-y-auto p-3">
                  {filteredAlerts.map((alert) => <button key={alert.id} type="button" onClick={() => setSelectedId(alert.id)} className={cn("w-full rounded-md border p-3 text-left transition-colors", selected.id === alert.id ? "border-primary bg-primary/5" : "border-border hover:bg-secondary/60")}>
                    <div className="flex items-center justify-between gap-2"><span className={cn("rounded px-2 py-0.5 text-[9px] font-bold", alert.severity === "CRITICAL" ? "bg-critical/10 text-critical" : alert.severity === "WARNING" ? "bg-warning/10 text-warning" : "bg-success/10 text-success")}>{alert.severity}</span><span className="text-[10px] text-muted-foreground">{alert.time}</span></div>
                    <div className="mt-2 text-sm font-semibold">{alert.facility}</div><div className="mt-1 text-xs text-muted-foreground">{alert.location}</div>
                    <div className="mt-3 flex items-center justify-between text-[10px]"><span>FRP {alert.frp} MW</span><span className="font-semibold text-primary">{alert.confidence}% confidence</span></div>
                  </button>)}
                </div>
              </aside>
            </div>

            <section className="mt-5 grid gap-5 lg:grid-cols-3">
              <Panel title="Incident activity" icon={Activity}><div className="space-y-3">{alerts.slice(0,3).map((alert) => <div key={alert.id} className="flex gap-3"><span className={cn("mt-1 size-2 shrink-0 rounded-full", alert.severity === "CRITICAL" ? "bg-critical" : alert.severity === "WARNING" ? "bg-warning" : "bg-success")} /><div><div className="text-sm font-medium">{alert.facility}</div><div className="text-xs text-muted-foreground">{alert.time} · {alert.status}</div></div></div>)}</div></Panel>
              <Panel title="Fire-risk trend" icon={BarChart3}><ResponsiveContainer width="100%" height={145}><LineChart data={RESPONSE_TREND}><XAxis dataKey="month" axisLine={false} tickLine={false} fontSize={10} stroke="var(--color-muted-foreground)" /><Tooltip contentStyle={{ background: "var(--color-popover)", border: "1px solid var(--color-border)", borderRadius: 6, fontSize: 11 }} /><Line type="monotone" dataKey="minutes" stroke="var(--color-primary)" strokeWidth={2.5} dot={false} /></LineChart></ResponsiveContainer></Panel>
              <Panel title="Top-risk regions" icon={MapPinned}><div className="space-y-3">{[...INDUSTRIES].sort((a,b) => b.riskScore-a.riskScore).slice(0,3).map((item) => <Link key={item.id} to="/industries/$industryId" params={{ industryId: item.id }} className="flex items-center justify-between rounded-md border border-border px-3 py-2 hover:bg-secondary"><div><div className="text-sm font-medium">{item.name}</div><div className="text-[10px] text-muted-foreground">{item.ward}</div></div><span className="text-sm font-bold text-critical">{item.riskScore}</span></Link>)}</div></Panel>
            </section>

            <section className="mt-5 rounded-lg border border-border bg-card p-4 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-3"><div><div className="text-xs font-semibold uppercase text-critical">Selected incident · {selected.id}</div><h2 className="mt-1 font-semibold">{selected.facility}</h2></div><div className="flex flex-wrap gap-2">{actions.map((action) => <Button key={action.status} size="sm" variant={action.status === "ESCALATED" ? "destructive" : "outline"} onClick={() => updateAlert(action.status, action.label)}>{action.status === "FALSE POSITIVE" && <XCircle />}{action.label}</Button>)}</div></div>
            </section>
          </main>
        </div>
      </div>
    </div>
  );
}

function NavItem({ icon: Icon, label, active, count, collapsed }: { icon: typeof Gauge; label: string; active?: boolean; count?: number; collapsed: boolean }) {
  return <div title={collapsed ? label : undefined} className={cn("flex h-10 items-center gap-3 rounded-md px-3 text-sm", active ? "bg-sidebar-accent text-sidebar-foreground shadow-sm" : "text-sidebar-muted hover:bg-sidebar-accent hover:text-sidebar-foreground")}><Icon className={cn("size-4 shrink-0", active && "text-primary")} />{!collapsed && <><span className="flex-1">{label}</span>{count ? <span className="rounded bg-critical/10 px-1.5 text-[10px] font-bold text-critical">{count}</span> : null}</>}</div>;
}
function Kpi({ icon: Icon, label, value, note, tone }: { icon: typeof Flame; label: string; value: string | number; note: string; tone: string }) { return <div className="rounded-lg border border-border bg-card p-4 shadow-sm"><div className="flex items-center justify-between"><span className="text-xs font-medium text-muted-foreground">{label}</span><Icon className={cn("size-4", tone)} /></div><div className={cn("mt-3 text-2xl font-bold", tone)}>{value}</div><div className="mt-1 text-[10px] text-muted-foreground">{note}</div></div>; }
function Panel({ title, icon: Icon, children }: { title: string; icon: typeof Activity; children: React.ReactNode }) { return <div className="rounded-lg border border-border bg-card p-4 shadow-sm"><div className="mb-4 flex items-center gap-2 text-sm font-semibold"><Icon className="size-4 text-primary" />{title}</div>{children}</div>; }
function Legend({ tone, label }: { tone: string; label: string }) { return <span className="flex items-center gap-1.5"><span className={cn("size-2 rounded-full", tone)} />{label}</span>; }
