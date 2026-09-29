import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Flame, LogIn, MapPin, ShieldAlert, UserPlus } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue } from
"@/components/ui/select";
import { INDIA_MUNICIPALITIES, INDIA_STATES } from "@/lib/india-municipalities";
import { readSession, writeSession } from "@/lib/demo-session";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
    { title: "Sign in — AGNI-VISION Municipal Watch" },
    {
      name: "description",
      content:
      "Demo sign-in for the AGNI-VISION municipal fire control console. Pick your state and municipality to enter the ward-level alert dashboard."
    },
    { property: "og:title", content: "Sign in — AGNI-VISION Municipal Watch" },
    {
      property: "og:description",
      content: "Demo access to ward-level fire alerts, industry histories and response reports."
    },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" }]

  }),
  component: AuthPage
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState("signin");
  const [name, setName] = useState("R. Kapadia");
  const [email, setEmail] = useState("control.room@municipality.gov.in");
  const [password, setPassword] = useState("demo1234");
  const [state, setState] = useState("Gujarat");
  const [municipality, setMunicipality] = useState("Jamnagar MC");
  const [error, setError] = useState("");

  useEffect(() => {
    if (readSession()) void navigate({ to: "/dashboard" });
  }, [navigate]);

  const municipalities = useMemo(() => INDIA_MUNICIPALITIES[state] ?? [], [state]);

  const submit = (event) => {
    event.preventDefault();
    if (!name.trim() || !email.trim() || !password.trim()) {
      setError("Fill in every field to continue.");
      return;
    }
    if (!state || !municipality) {
      setError("Select a state and then a municipality.");
      return;
    }
    writeSession({ name: name.trim(), email: email.trim(), state, municipality });
    void navigate({ to: "/dashboard" });
  };

  return (
    <div className="relative grid min-h-screen place-items-center overflow-hidden bg-background px-4 py-10 text-foreground">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_0%,color-mix(in_oklab,var(--color-primary)_20%,transparent),transparent_35%),radial-gradient(circle_at_95%_90%,color-mix(in_oklab,var(--color-critical)_14%,transparent),transparent_32%)]" />

      <div className="relative z-10 grid w-full max-w-4xl gap-6 lg:grid-cols-[1fr_1.1fr]">
        <div className="hidden flex-col justify-center gap-5 lg:flex">
          <div className="flex items-center gap-3">
            <div className="grid size-11 place-items-center rounded-lg bg-primary/15 text-primary ring-1 ring-primary/30">
              <ShieldAlert className="size-6" />
            </div>
            <div>
              <div className="text-base font-semibold">AGNI-VISION MUNICIPAL WATCH</div>
              <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-primary">
                Fire &amp; safety control portal
              </div>
            </div>
          </div>
          <h1 className="text-3xl font-bold leading-tight">
            Ward-level fire detection for municipal control rooms.
          </h1>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-center gap-2"><Flame className="size-4 text-critical" /> Live satellite thermal alerts by ward</li>
            <li className="flex items-center gap-2"><MapPin className="size-4 text-info" /> Industry profiles with past fire history</li>
            <li className="flex items-center gap-2"><ShieldAlert className="size-4 text-warning" /> Escalation actions, reports and alert sirens</li>
          </ul>
          <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
            Demo environment · accounts are simulated, no real login is created
          </p>
        </div>

        <form
          onSubmit={submit}
          className="rounded-xl border border-border bg-card p-5 shadow-2xl sm:p-6">
          
          <div className="mb-5 grid grid-cols-2 gap-1 rounded-lg bg-secondary/40 p-1">
            {["signin", "signup"].map((value) =>
            <button
              key={value}
              type="button"
              onClick={() => {setMode(value);setError("");}}
              className={cn(
                "cursor-pointer rounded-md px-3 py-2 text-sm font-medium transition-colors",
                mode === value ? "bg-primary/20 text-primary ring-1 ring-primary/30" : "text-muted-foreground hover:text-foreground"
              )}>
              
                {value === "signin" ? "Sign in" : "Create account"}
              </button>
            )}
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Officer name</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Official email</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@municipality.gov.in" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>State / UT</Label>
                <Select
                  value={state}
                  onValueChange={(value) => {setState(value);setMunicipality("");}}>
                  
                  <SelectTrigger><SelectValue placeholder="Select state" /></SelectTrigger>
                  <SelectContent className="max-h-72">
                    {INDIA_STATES.map((item) =>
                    <SelectItem key={item} value={item}>{item}</SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Municipality</Label>
                <Select value={municipality} onValueChange={setMunicipality} disabled={!state}>
                  <SelectTrigger>
                    <SelectValue placeholder={state ? "Select municipality" : "Pick a state first"} />
                  </SelectTrigger>
                  <SelectContent className="max-h-72">
                    {municipalities.map((item) =>
                    <SelectItem key={item} value={item}>{item}</SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {error ? <p className="mt-3 text-xs text-critical">{error}</p> : null}

          <Button type="submit" className="mt-5 w-full">
            {mode === "signin" ? <LogIn className="size-4" /> : <UserPlus className="size-4" />}
            {mode === "signin" ? "Enter control room" : "Create demo account"}
          </Button>

          <p className="mt-3 text-center font-mono text-[9px] uppercase tracking-wider text-muted-foreground">
            Demo only — any details are accepted and stored on this device
          </p>
        </form>
      </div>
    </div>);

}