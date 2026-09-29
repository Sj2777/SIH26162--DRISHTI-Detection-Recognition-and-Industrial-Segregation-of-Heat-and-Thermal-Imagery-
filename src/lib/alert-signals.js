const SOUND_KEY = "agni-vision-alert-sound";

export function soundEnabled() {
  if (typeof window === "undefined") return true;
  return window.localStorage.getItem(SOUND_KEY) !== "off";
}

export function setSoundEnabled(enabled) {
  window.localStorage.setItem(SOUND_KEY, enabled ? "on" : "off");
}

/** Two-tone siren beep for new critical alerts. */
export function playAlertTone(severity = "CRITICAL") {
  if (typeof window === "undefined" || !soundEnabled()) return;
  const Ctor = window.AudioContext ?? window.webkitAudioContext;
  if (!Ctor) return;
  try {
    const ctx = new Ctor();
    const now = ctx.currentTime;
    const gain = ctx.createGain();
    gain.connect(ctx.destination);
    gain.gain.setValueAtTime(0.0001, now);

    const tones =
      severity === "CRITICAL" ? [880, 660, 880, 660] : severity === "WARNING" ? [720, 540] : [520];
    tones.forEach((freq, index) => {
      const osc = ctx.createOscillator();
      osc.type = "square";
      osc.frequency.setValueAtTime(freq, now + index * 0.22);
      osc.connect(gain);
      osc.start(now + index * 0.22);
      osc.stop(now + index * 0.22 + 0.2);
    });

    const end = now + tones.length * 0.22 + 0.05;
    gain.gain.exponentialRampToValueAtTime(0.18, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, end);
    window.setTimeout(() => void ctx.close(), (end - now) * 1000 + 200);
  } catch {
    /* audio unavailable */
  }
}

export async function requestNotificationPermission() {
  if (typeof window === "undefined" || !("Notification" in window)) return "unsupported";
  if (Notification.permission === "granted") return "granted";
  if (Notification.permission === "denied") return "denied";
  return await Notification.requestPermission();
}

export function pushDesktopNotification(title, body) {
  if (typeof window === "undefined" || !("Notification" in window)) return;
  if (Notification.permission !== "granted") return;
  try {
    new Notification(title, { body });
  } catch {
    /* notification blocked */
  }
}
