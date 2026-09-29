import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  Activity, BarChart3, BellRing, Building2, ChevronLeft, ChevronRight, Flame,
  Gauge, Layers3, LogOut, MapPinned, Menu, Moon, Search, ShieldCheck, Siren,
  Sun, Volume2, VolumeX, XCircle } from
"lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis } from "recharts";
import { useQuery, useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import Map, { Marker } from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';
import { getMunicipalityCoords } from "@/lib/municipality-coords";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { playAlertTone, pushDesktopNotification, requestNotificationPermission, setSoundEnabled, soundEnabled } from "@/lib/alert-signals";
import { INDUSTRIES, INCOMING_ALERTS, INITIAL_ALERTS, RESPONSE_TREND } from "@/lib/demo-data";
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
    { name: "twitter:card", content: "summary_large_image" }]
  }),
  component: Dashboard
});

const actions = [
  { label: "Acknowledge", status: "Acknowledged" },
  { label: "Request analyst review", status: "Analyst review requested" },
  { label: "Contact facility", status: "Industry contacted" },
  { label: "Verify as incident", status: "Under verification" },
  { label: "Mark routine flare", status: "Routine flare" },
  { label: "Escalate to fire-control-room", status: "Fire-control-room notified" },
  { label: "Escalate to state", status: "Escalated to state" },
  { label: "Close as resolved", status: "Resolved" },
  { label: "Mark false positive", status: "False positive" },
  { label: "Add field note/photo", status: "Note added" },
  { label: "Generate incident report", status: "Report generated" },
];

const getTimeSince = (timeString) => {
  if (!timeString) return "";
  const mins = Math.floor((new Date() - new Date(timeString)) / 60000);
  if (mins < 0) return "Just now";
  return mins < 60 ? `${mins}m ago` : `${Math.floor(mins / 60)}h ${mins % 60}m ago`;
};


function Dashboard() {
  const navigate = useNavigate();
  const { session, ready, signOut } = useDemoSession();
  const { theme, setTheme } = useTheme();
  const [collapsed, setCollapsed] = useState(false);
  const [query, setQuery] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [sound, setSound] = useState(true);
  const incomingIndex = useRef(0);

  const { data: alerts = INITIAL_ALERTS, refetch } = useQuery({
    queryKey: ["alerts"],
    queryFn: async () => {
      try {
        const res = await fetch("http://localhost:8000/api/alerts");
        if (res.ok) return await res.json();
      } catch (e) {
        console.error("Backend fetch failed, falling back to local data");
      }
      return INITIAL_ALERTS;
    },
    refetchInterval: 5000 // Poll every 5s for updates
  });

  const { data: industries = INDUSTRIES } = useQuery({
    queryKey: ["industries"],
    queryFn: async () => {
      try {
        const res = await fetch("http://localhost:8000/api/industries");
        if (res.ok) return await res.json();
      } catch (e) {}
      return INDUSTRIES;
    }
  });

  const updateAlertMutation = useMutation({
    mutationFn: async ({ id, status }) => {
      const res = await fetch(`http://localhost:8000/api/alerts/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status })
      });
      if (!res.ok) throw new Error("Failed to update");
      return res.json();
    },
    onSuccess: () => refetch()
  });

  const [selectedId, setSelectedId] = useState("");
  // set default selection when alerts load
  useEffect(() => {
    if (alerts.length > 0 && !selectedId) {
      setSelectedId(alerts[0].id);
    }
  }, [alerts, selectedId]);

  useEffect(() => {if (ready && !session) void navigate({ to: "/" });}, [ready, session, navigate]);
  useEffect(() => setSound(soundEnabled()), []);

  const selected = alerts.find((alert) => alert.id === selectedId) ?? alerts[0];
  const filteredAlerts = alerts.filter((alert) => `${alert.facility} ${alert.location} ${alert.id}`.toLowerCase().includes(query.toLowerCase()));
  const criticalCount = alerts.filter((alert) => alert.severity === "CRITICAL" && !["RESOLVED", "FALSE POSITIVE"].includes(alert.status)).length;
  const mapCenter = useMemo(() => session ? getMunicipalityCoords(session.municipality) : { lat: 22.5, lng: 78.5 }, [session]);

  if (!session || !selected) return null;

  const updateAlert = (status, label) => {
    updateAlertMutation.mutate({ id: selected.id, status });
    toast.success(label, { description: `${selected.id} · ${selected.facility}` });
  };

  const toggleSound = () => {
    const next = !sound;
    setSound(next);setSoundEnabled(next);
    if (next) playAlertTone("ROUTINE");
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="flex min-h-screen">
        {/* Desktop sidebar */}
        <aside className={cn("sticky top-0 hidden h-screen shrink-0 flex-col border-r border-sidebar-border bg-sidebar transition-[width] duration-200 md:flex", collapsed ? "w-16" : "w-60")}>
          <div className="flex h-16 items-center gap-3 border-b border-sidebar-border px-4">
            <div className="grid size-9 shrink-0 place-items-center rounded-md bg-primary text-primary-foreground"><Flame className="size-5" /></div>
            {!collapsed && <div><div className="font-black">AGNI-VISION</div><div className="text-[9px] uppercase tracking-[0.16em] text-sidebar-muted">Fire intelligence</div></div>}
          </div>
          <nav className="flex-1 space-y-1 p-3">
            <Link to="/dashboard"><NavItem icon={Gauge} label="Command" active collapsed={collapsed} /></Link>
            <a href="#map-section" onClick={(e) => { e.preventDefault(); document.getElementById("map-section")?.scrollIntoView({ behavior: "smooth" }); }}><NavItem icon={MapPinned} label="Live map" collapsed={collapsed} /></a>
            <a href="#alerts-section" onClick={(e) => { e.preventDefault(); document.getElementById("alerts-section")?.scrollIntoView({ behavior: "smooth" }); }}><NavItem icon={Siren} label="Alerts" count={criticalCount} collapsed={collapsed} /></a>
            <Link to="/reports"><NavItem icon={BarChart3} label="Reports" collapsed={collapsed} /></Link>
            <Link to="/industries/$industryId" params={{ industryId: industries[0]?.id ?? "sunrise-chemicals" }}><NavItem icon={Building2} label="Industries" collapsed={collapsed} /></Link>
          </nav>
          <div className="border-t border-sidebar-border p-3">
            {!collapsed && <div className="mb-3 rounded-md border border-sidebar-border bg-sidebar-accent p-3"><div className="text-[9px] uppercase text-sidebar-muted">Fixed jurisdiction</div><div className="mt-1 truncate text-sm font-semibold">{session.municipality}</div><div className="truncate text-xs text-sidebar-muted">{session.state}</div></div>}
            <Button variant="ghost" size="sm" className="w-full justify-start" onClick={() => setCollapsed(!collapsed)} aria-label={collapsed ? "Expand navigation" : "Collapse navigation"}>{collapsed ? <ChevronRight /> : <><ChevronLeft /> Collapse</>}</Button>
          </div>
        </aside>

        {/* Mobile sidebar overlay */}
        {mobileOpen && (
          <div className="fixed inset-0 z-50 md:hidden">
            <div className="absolute inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
            <aside className="absolute left-0 top-0 h-full w-64 flex-col border-r border-sidebar-border bg-sidebar flex">
              <div className="flex h-16 items-center justify-between border-b border-sidebar-border px-4">
                <div className="flex items-center gap-3">
                  <div className="grid size-9 shrink-0 place-items-center rounded-md bg-primary text-primary-foreground"><Flame className="size-5" /></div>
                  <div><div className="font-black">AGNI-VISION</div><div className="text-[9px] uppercase tracking-[0.16em] text-sidebar-muted">Fire intelligence</div></div>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setMobileOpen(false)}><XCircle className="size-4" /></Button>
              </div>
              <nav className="flex-1 space-y-1 p-3">
                <Link to="/dashboard" onClick={() => setMobileOpen(false)}><NavItem icon={Gauge} label="Command" active /></Link>
                <a href="#map-section" onClick={(e) => { e.preventDefault(); setMobileOpen(false); document.getElementById("map-section")?.scrollIntoView({ behavior: "smooth" }); }}><NavItem icon={MapPinned} label="Live map" /></a>
                <a href="#alerts-section" onClick={(e) => { e.preventDefault(); setMobileOpen(false); document.getElementById("alerts-section")?.scrollIntoView({ behavior: "smooth" }); }}><NavItem icon={Siren} label="Alerts" count={criticalCount} /></a>
                <Link to="/reports" onClick={() => setMobileOpen(false)}><NavItem icon={BarChart3} label="Reports" /></Link>
                <Link to="/industries/$industryId" params={{ industryId: industries[0]?.id ?? "sunrise-chemicals" }} onClick={() => setMobileOpen(false)}><NavItem icon={Building2} label="Industries" /></Link>
              </nav>
            </aside>
          </div>
        )}

        <div className="min-w-0 flex-1">
          <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-background/95 px-4 backdrop-blur sm:px-6">
            <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setMobileOpen(true)} aria-label="Open navigation"><Menu /></Button>
            <div className="relative max-w-md flex-1"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search alerts, facilities or wards" className="pl-9" /></div>
            <div className="ml-auto hidden text-right lg:block"><div className="text-xs font-semibold">System active</div><div className="text-[10px] text-success">1,402 nodes online</div></div>
            <Button variant="ghost" size="icon" onClick={toggleSound} aria-label="Toggle alert sound">{sound ? <Volume2 /> : <VolumeX />}</Button>
            <Button variant="ghost" size="icon" onClick={() => {
              requestNotificationPermission().then(granted => {
                if (granted) toast.success("Notifications enabled", { description: "You will receive desktop alerts." });
                else toast.error("Notifications blocked", { description: "Please enable them in your browser settings." });
              });
            }} aria-label="Enable notifications"><BellRing /></Button>
            <Button variant="ghost" size="icon" onClick={() => setTheme(theme === "dark" ? "light" : "dark")} aria-label="Toggle dark mode">{theme === "dark" ? <Sun /> : <Moon />}</Button>
            <div className="grid size-9 place-items-center rounded-full bg-secondary text-xs font-bold">{initials(session.name)}</div>
            <Button variant="ghost" size="icon" onClick={() => {signOut();void navigate({ to: "/" });}} aria-label="Sign out"><LogOut /></Button>
          </header>

          <main className="mx-auto max-w-[1600px] p-4 sm:p-6">
            <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
              <div><p className="text-xs font-semibold uppercase text-primary">Municipal command center</p><h1 className="mt-1 text-2xl font-bold">{session.municipality}</h1><p className="mt-1 text-sm text-muted-foreground">{session.state}, India · jurisdiction locked to this account</p></div>
              <div className="flex items-center gap-2 rounded-md border border-success/30 bg-success/10 px-3 py-2 text-xs font-semibold text-success"><span className="status-pulse size-2 rounded-full bg-success" /> Live monitoring</div>
            </div>

            <section className="grid grid-cols-2 gap-3 xl:grid-cols-4">
              <Kpi icon={Flame} label="Active incidents" value={criticalCount} note="Require immediate action" tone="text-critical" />
              <Kpi icon={MapPinned} label="New alerts" value={alerts.filter(a => a.status === 'New' || a.status === 'PENDING').length} note="Awaiting ACK" tone="text-warning" />
              <Kpi icon={Layers3} label="Industrial facilities" value={industries.length} note={`${industries.filter(i => i.riskScore >= 65).length} high-risk`} tone="text-info" />
              <Kpi icon={ShieldCheck} label="Escalated to Fire Dept" value={alerts.filter(a => a.status === 'Escalated to state' || a.status === 'Fire-control-room notified').length} note="Currently active" tone="text-destructive" />
              <Kpi icon={Activity} label="Under investigation" value={alerts.filter(a => a.status === 'Under verification').length} note="Field team assigned" tone="text-warning" />
              <Kpi icon={BarChart3} label="Resolved incidents" value={alerts.filter(a => a.status === 'Resolved' || a.status === 'False positive').length} note="This month" tone="text-success" />
              <Kpi icon={Activity} label="Avg ACK time" value={`${Math.round(industries.reduce((s, i) => s + (i.history?.[0]?.responseMins || 0), 0) / industries.length)}m`} note="Based on facility history" tone="text-success" />
            </section>

            <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
              <section id="map-section" className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
                <div className="flex items-center justify-between border-b border-border px-4 py-3"><div><h2 className="font-semibold">Satellite fire map</h2><p className="text-xs text-muted-foreground">Focused on {session.municipality}</p></div><span className="rounded-md bg-primary/10 px-2 py-1 text-[10px] font-bold uppercase text-primary">Satellite</span></div>
                <div className="relative h-[500px] overflow-hidden bg-map-surface">
                  <Map
                    initialViewState={{ longitude: mapCenter.lng, latitude: mapCenter.lat, zoom: 13 }}
                    mapStyle={{
                      version: 8,
                      sources: {
                        'gmap-hybrid': {
                          type: 'raster',
                          tiles: ['https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}'],
                          tileSize: 256
                        }
                      },
                      layers: [{
                        id: 'satellite-layer',
                        type: 'raster',
                        source: 'gmap-hybrid',
                        minzoom: 0,
                        maxzoom: 22
                      }]
                    }}
                  >
                    {filteredAlerts.map((alert, index) => {
                      const isCritical = alert.severity === "CRITICAL";
                      const isWarning = alert.severity === "WARNING";
                      const lat = alert.lat ?? mapCenter.lat + (index % 4 - 2) * 0.05;
                      const lng = alert.lng ?? mapCenter.lng + ((index + 2) % 4 - 2) * 0.05;
                      return (
                        <Marker key={alert.id} longitude={lng} latitude={lat} anchor="center">
                          <button type="button" onClick={(e) => { e.stopPropagation(); setSelectedId(alert.id); }} aria-label={`Open ${alert.id}`} className={cn("grid size-8 place-items-center rounded-full border-2 border-primary-foreground shadow-lg transition-transform hover:scale-110", isCritical ? "bg-critical text-critical-foreground animate-pulse" : isWarning ? "bg-warning text-warning-foreground" : "bg-success text-success-foreground")}><Flame className="size-4" /></button>
                        </Marker>
                      );
                    })}
                  </Map>
                  <div className="absolute bottom-4 left-4 flex flex-wrap gap-3 rounded-md border border-map-border bg-map-overlay px-3 py-2 text-[10px] text-map-foreground shadow-lg"><Legend tone="bg-critical" label="Active fire" /><Legend tone="bg-warning" label="Hotspot" /><Legend tone="bg-success" label="Normal" /></div>
                  <div className="absolute right-4 top-4 rounded-md border border-map-border bg-map-overlay px-3 py-2 text-right text-map-foreground shadow-lg"><div className="text-[9px] uppercase text-map-muted">Viewing</div><div className="text-xs font-semibold">{session.municipality}</div></div>
                </div>
              </section>

              <aside id="alerts-section" className="rounded-lg border border-border bg-card shadow-sm">
                <div className="flex items-center justify-between border-b border-border px-4 py-3"><div><h2 className="font-semibold">Live alerts</h2><p className="text-xs text-muted-foreground">Priority queue</p></div><span className="rounded-md bg-critical/10 px-2 py-1 text-[10px] font-bold text-critical">{criticalCount} CRITICAL</span></div>
                <div className="max-h-[548px] space-y-2 overflow-y-auto p-3">
                  {filteredAlerts.map((alert) => <button key={alert.id} type="button" onClick={() => setSelectedId(alert.id)} className={cn("w-full rounded-md border p-3 text-left transition-colors", selected.id === alert.id ? "border-primary bg-primary/5" : "border-border hover:bg-secondary/60")}>
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex gap-1">
                        <span className={cn("rounded px-2 py-0.5 text-[9px] font-bold", alert.severity === "CRITICAL" ? "bg-critical/10 text-critical" : alert.severity === "WARNING" ? "bg-warning/10 text-warning" : "bg-success/10 text-success")}>{alert.severity}</span>
                        {alert.priority && <span className={cn("rounded px-2 py-0.5 text-[9px] font-bold border", alert.priority === "High" ? "border-critical text-critical" : alert.priority === "Medium" ? "border-warning text-warning" : "border-info text-info")}>{alert.priority} Priority</span>}
                      </div>
                      <span className="text-[10px] text-muted-foreground">{alert.detectionTime ? getTimeSince(alert.detectionTime) : alert.time}</span>
                    </div>
                    <div className="mt-2 text-sm font-semibold">{alert.facility}</div>
                    <div className="mt-1 text-xs text-muted-foreground">{alert.location}</div>
                    <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[9px] text-muted-foreground uppercase tracking-wider">
                      {alert.classification && <span>{alert.classification}</span>}
                      {alert.landCover && <span>• {alert.landCover}</span>}
                      {alert.assignedOfficer && <span className="text-primary font-semibold">• {alert.assignedOfficer}</span>}
                    </div>
                    <div className="mt-3 flex items-center justify-between text-[10px]">
                      <span>FRP {alert.frp} MW</span>
                      <span className="font-semibold text-primary">{alert.confidence}% confidence</span>
                    </div>
                  </button>)}
                </div>
              </aside>
            </div>

            <section className="mt-5 grid gap-5 lg:grid-cols-3">
              <Panel title="Incident activity" icon={Activity}><div className="space-y-3">{alerts.slice(0, 3).map((alert) => <div key={alert.id} className="flex gap-3"><span className={cn("mt-1 size-2 shrink-0 rounded-full", alert.severity === "CRITICAL" ? "bg-critical" : alert.severity === "WARNING" ? "bg-warning" : "bg-success")} /><div><div className="text-sm font-medium">{alert.facility}</div><div className="text-xs text-muted-foreground">{alert.time} · {alert.status}</div></div></div>)}</div></Panel>
              <Panel title="Fire-risk trend" icon={BarChart3}><ResponsiveContainer width="100%" height={145}><LineChart data={RESPONSE_TREND}><XAxis dataKey="month" axisLine={false} tickLine={false} fontSize={10} stroke="var(--color-muted-foreground)" /><Tooltip contentStyle={{ background: "var(--color-popover)", border: "1px solid var(--color-border)", borderRadius: 6, fontSize: 11 }} /><Line type="monotone" dataKey="minutes" stroke="var(--color-primary)" strokeWidth={2.5} dot={false} /></LineChart></ResponsiveContainer></Panel>
              <Panel title="Top-risk regions" icon={MapPinned}><div className="space-y-3">{[...industries].sort((a, b) => b.riskScore - a.riskScore).slice(0, 3).map((item) => <Link key={item.id} to="/industries/$industryId" params={{ industryId: item.id }} className="flex items-center justify-between rounded-md border border-border px-3 py-2 hover:bg-secondary"><div><div className="text-sm font-medium">{item.name}</div><div className="text-[10px] text-muted-foreground">{item.ward}</div></div><span className="text-sm font-bold text-critical">{item.riskScore}</span></Link>)}</div></Panel>
            </section>

            <section className="mt-5 rounded-lg border border-border bg-card p-5 shadow-sm">
              <div className="flex flex-wrap justify-between items-start border-b border-border pb-4 mb-4">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <div className="text-xs font-bold uppercase tracking-wider text-primary">Incident Brief · {selected.id}</div>
                    <span className={cn("rounded px-2 py-0.5 text-[9px] font-bold", selected.status === "Resolved" || selected.status === "False positive" ? "bg-success/10 text-success" : selected.status === "New" ? "bg-critical/10 text-critical" : "bg-warning/10 text-warning")}>{selected.status}</span>
                  </div>
                  <h2 className="text-xl font-bold">{selected.facility}</h2>
                  <div className="text-sm text-muted-foreground mt-1">{selected.location} • {selected.classification || "Unclassified"} ({selected.landCover || "Unknown"})</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    FRP {selected.frp} MW · {selected.confidence}% confidence · {selected.source} · {selected.detectionTime ? getTimeSince(selected.detectionTime) : selected.time}
                    {selected.assignedOfficer && <span className="text-primary font-semibold"> · Officer: {selected.assignedOfficer}</span>}
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 justify-end max-w-lg">
                  {actions.map((action) => {
                    const isActive = selected.status === action.status;
                    const isEscalation = action.status === "Escalated to state" || action.status === "Fire-control-room notified";
                    const industry = selected.industryId ? industries.find(i => i.id === selected.industryId) : null;
                    return (
                      <Button
                        key={action.status}
                        size="sm"
                        variant={isActive ? "default" : isEscalation ? "destructive" : "outline"}
                        disabled={isActive}
                        onClick={() => {
                          if (action.status === "Industry contacted" && industry?.contact?.phone) {
                            window.open(`tel:${industry.contact.phone}`, "_blank");
                          }
                          updateAlert(action.status, action.label);
                        }}
                      >
                        {action.label}{isActive && " ✓"}
                      </Button>
                    );
                  })}
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <div className="font-semibold text-muted-foreground text-xs uppercase mb-1">Thermal Trend</div>
                  <div>{selected.frp > 50 ? "Intensifying" : selected.frp > 20 ? "Stable" : "Cooling"} ({selected.frp > 50 ? "+" : selected.frp > 20 ? "~" : "-"}{Math.round(selected.frp * 0.18)}% FRP)</div>
                </div>
                <div>
                  <div className="font-semibold text-muted-foreground text-xs uppercase mb-1">Nearby Population</div>
                  <div>~{selected.severity === "CRITICAL" ? "12,500" : selected.severity === "WARNING" ? "8,200" : "3,400"} (within 2km)</div>
                </div>
                <div>
                  <div className="font-semibold text-muted-foreground text-xs uppercase mb-1">Downwind Direction</div>
                  <div>{selected.severity === "CRITICAL" ? "SE (towards residential zone)" : selected.severity === "WARNING" ? "NW (towards open fields)" : "E (low-impact corridor)"}</div>
                </div>
                <div>
                  <div className="font-semibold text-muted-foreground text-xs uppercase mb-1">Nearest Fire Station</div>
                  <div>{selected.industryId === "sunrise-chemicals" ? "Station 2 (1.8 km)" : selected.industryId === "coastal-refinery" ? "Station 4 (3.2 km)" : selected.industryId === "msw-yard" ? "Station 1 (2.1 km)" : "Station 3 (4.5 km)"}</div>
                </div>
                <div>
                  <div className="font-semibold text-muted-foreground text-xs uppercase mb-1">Historical Match</div>
                  <div>{selected.severity === "ROUTINE" ? "94% match (routine flare profile)" : selected.frp > 60 ? "No historical match — anomalous" : "72% match (prior waste fire pattern)"}</div>
                </div>
                <div>
                  <div className="font-semibold text-muted-foreground text-xs uppercase mb-1">SACHET Alert</div>
                  <div>{selected.severity === "CRITICAL" ? "Heat wave warning active" : "None active in this grid"}</div>
                </div>
                <div className="col-span-2">
                  <div className="font-semibold text-muted-foreground text-xs uppercase mb-1">Recommended Action</div>
                  <div className={cn("font-medium", selected.severity === "CRITICAL" ? "text-critical" : selected.severity === "WARNING" ? "text-warning" : "text-success")}>
                    {selected.severity === "CRITICAL" ? "Verify with facility supervisor immediately — high FRP for non-flare stack" : selected.severity === "WARNING" ? "Send field team for ground verification within 30 minutes" : "Monitor — likely routine industrial activity"}
                  </div>
                </div>
              </div>
            </section>
          </main>
        </div>
      </div>
    </div>);

}

function NavItem({ icon: Icon, label, active, count, collapsed }) {
  return <div title={collapsed ? label : undefined} className={cn("flex h-10 items-center gap-3 rounded-md px-3 text-sm", active ? "bg-sidebar-accent text-sidebar-foreground shadow-sm" : "text-sidebar-muted hover:bg-sidebar-accent hover:text-sidebar-foreground")}><Icon className={cn("size-4 shrink-0", active && "text-primary")} />{!collapsed && <><span className="flex-1">{label}</span>{count ? <span className="rounded bg-critical/10 px-1.5 text-[10px] font-bold text-critical">{count}</span> : null}</>}</div>;
}
function Kpi({ icon: Icon, label, value, note, tone }) {return <div className="rounded-lg border border-border bg-card p-4 shadow-sm"><div className="flex items-center justify-between"><span className="text-xs font-medium text-muted-foreground">{label}</span><Icon className={cn("size-4", tone)} /></div><div className={cn("mt-3 text-2xl font-bold", tone)}>{value}</div><div className="mt-1 text-[10px] text-muted-foreground">{note}</div></div>;}
function Panel({ title, icon: Icon, children }) {return <div className="rounded-lg border border-border bg-card p-4 shadow-sm"><div className="mb-4 flex items-center gap-2 text-sm font-semibold"><Icon className="size-4 text-primary" />{title}</div>{children}</div>;}
function Legend({ tone, label }) {return <span className="flex items-center gap-1.5"><span className={cn("size-2 rounded-full", tone)} />{label}</span>;}