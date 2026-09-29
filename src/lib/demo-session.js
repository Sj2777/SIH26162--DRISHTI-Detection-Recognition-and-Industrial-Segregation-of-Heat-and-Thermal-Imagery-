import { useCallback, useEffect, useState } from "react";

const KEY = "agni-vision-demo-session";

export function readSession() {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function writeSession(session) {
  window.localStorage.setItem(KEY, JSON.stringify(session));
  window.dispatchEvent(new Event("demo-session-change"));
}

export function clearSession() {
  window.localStorage.removeItem(KEY);
  window.dispatchEvent(new Event("demo-session-change"));
}

/** Demo-only session: nothing is stored on a server, accounts are not real. */
export function useDemoSession() {
  const [session, setSession] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const sync = () => setSession(readSession());
    sync();
    setReady(true);
    window.addEventListener("demo-session-change", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("demo-session-change", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const signOut = useCallback(() => clearSession(), []);

  return { session, ready, signOut };
}

export function initials(name) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}
