import { createHotContext as __vite__createHotContext } from "/municipal/@vite/client";import.meta.hot = __vite__createHotContext("/src/routes/index.jsx?tsr-split=component");const useEffect = __vite__cjsImport2_react["useEffect"]; const useMemo = __vite__cjsImport2_react["useMemo"]; const useState = __vite__cjsImport2_react["useState"];const _jsxDEV = __vite__cjsImport10_react_jsxDevRuntime["jsxDEV"];import { useNavigate } from "/municipal/node_modules/@tanstack/react-router/dist/esm/index.dev.js?v=233c9923";
import { Flame, LogIn, MapPin, ShieldAlert, UserPlus } from "/municipal/node_modules/.vite/deps/lucide-react.js?v=233c9923";
import __vite__cjsImport2_react from "/municipal/node_modules/.vite/deps/react.js?v=233c9923";
import { Button } from "/municipal/src/components/ui/button.jsx";
import { Input } from "/municipal/src/components/ui/input.jsx";
import { Label } from "/municipal/src/components/ui/label.jsx";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "/municipal/src/components/ui/select.jsx";
import { INDIA_MUNICIPALITIES, INDIA_STATES } from "/municipal/src/lib/india-municipalities.js";
import { readSession, writeSession } from "/municipal/src/lib/demo-session.js";
import { cn } from "/municipal/src/lib/utils.js";
var _jsxFileName = "C:/Users/shrey/Desktop/SIH PS2/Landing Page/municipal-portal/src/routes/index.jsx?tsr-split=component";
import __vite__cjsImport10_react_jsxDevRuntime from "/municipal/node_modules/.vite/deps/react_jsx-dev-runtime.js?v=233c9923";
var _s = $RefreshSig$();
function AuthPage() {
	_s();
	const navigate = useNavigate();
	const [mode, setMode] = useState("signin");
	const [name, setName] = useState("R. Kapadia");
	const [email, setEmail] = useState("control.room@municipality.gov.in");
	const [password, setPassword] = useState("demo1234");
	const [state, setState] = useState("Maharashtra");
	const [municipality, setMunicipality] = useState("Pune MC");
	const [error, setError] = useState("");
	useEffect(() => {
		if (readSession()) void navigate({ to: "/dashboard" });
	}, [navigate]);
	const municipalities = useMemo(() => INDIA_MUNICIPALITIES[state] ?? [], [state]);
	const submit = async (event) => {
		event.preventDefault();
		if (!name.trim() || !email.trim() || !password.trim()) {
			setError("Fill in every field to continue.");
			return;
		}
		if (!state || !municipality) {
			setError("Select a state and then a municipality.");
			return;
		}
		try {
			const res = await fetch("http://localhost:8000/api/auth/login", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					username: email.trim(),
					password: password.trim(),
					name: name.trim(),
					municipality,
					state
				})
			});
			if (res.ok) {
				const user = await res.json();
				writeSession(user);
				void navigate({ to: "/dashboard" });
			} else {
				setError("Invalid credentials.");
			}
		} catch (e) {
			// Fallback for demo if backend is offline
			writeSession({
				name: name.trim(),
				email: email.trim(),
				state,
				municipality
			});
			void navigate({ to: "/dashboard" });
		}
	};
	return /* @__PURE__ */ _jsxDEV("div", {
		className: "relative grid min-h-screen place-items-center overflow-hidden bg-background px-4 py-10 text-foreground",
		children: [/* @__PURE__ */ _jsxDEV("div", { className: "pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_0%,color-mix(in_oklab,var(--color-primary)_20%,transparent),transparent_35%),radial-gradient(circle_at_95%_90%,color-mix(in_oklab,var(--color-critical)_14%,transparent),transparent_32%)]" }, void 0, false, {
			fileName: _jsxFileName,
			lineNumber: 73,
			columnNumber: 7
		}, this), /* @__PURE__ */ _jsxDEV("div", {
			className: "relative z-10 grid w-full max-w-4xl gap-6 lg:grid-cols-[1fr_1.1fr]",
			children: [/* @__PURE__ */ _jsxDEV("div", {
				className: "hidden flex-col justify-center gap-5 lg:flex",
				children: [
					/* @__PURE__ */ _jsxDEV("div", {
						className: "flex items-center gap-3",
						children: [/* @__PURE__ */ _jsxDEV("div", {
							className: "grid size-11 place-items-center rounded-lg bg-primary/15 text-primary ring-1 ring-primary/30",
							children: /* @__PURE__ */ _jsxDEV(ShieldAlert, { className: "size-6" }, void 0, false, {
								fileName: _jsxFileName,
								lineNumber: 79,
								columnNumber: 15
							}, this)
						}, void 0, false, {
							fileName: _jsxFileName,
							lineNumber: 78,
							columnNumber: 13
						}, this), /* @__PURE__ */ _jsxDEV("div", { children: [/* @__PURE__ */ _jsxDEV("div", {
							className: "text-base font-semibold",
							children: "AGNI-VISION MUNICIPAL WATCH"
						}, void 0, false, {
							fileName: _jsxFileName,
							lineNumber: 82,
							columnNumber: 15
						}, this), /* @__PURE__ */ _jsxDEV("div", {
							className: "font-mono text-[10px] uppercase tracking-[0.18em] text-primary",
							children: "Fire & safety control portal"
						}, void 0, false, {
							fileName: _jsxFileName,
							lineNumber: 83,
							columnNumber: 15
						}, this)] }, void 0, true, {
							fileName: _jsxFileName,
							lineNumber: 81,
							columnNumber: 13
						}, this)]
					}, void 0, true, {
						fileName: _jsxFileName,
						lineNumber: 77,
						columnNumber: 11
					}, this),
					/* @__PURE__ */ _jsxDEV("h1", {
						className: "text-3xl font-bold leading-tight",
						children: "Ward-level fire detection for municipal control rooms."
					}, void 0, false, {
						fileName: _jsxFileName,
						lineNumber: 88,
						columnNumber: 11
					}, this),
					/* @__PURE__ */ _jsxDEV("ul", {
						className: "space-y-2 text-sm text-muted-foreground",
						children: [
							/* @__PURE__ */ _jsxDEV("li", {
								className: "flex items-center gap-2",
								children: [/* @__PURE__ */ _jsxDEV(Flame, { className: "size-4 text-critical" }, void 0, false, {
									fileName: _jsxFileName,
									lineNumber: 93,
									columnNumber: 15
								}, this), " Live satellite thermal alerts by ward"]
							}, void 0, true, {
								fileName: _jsxFileName,
								lineNumber: 92,
								columnNumber: 13
							}, this),
							/* @__PURE__ */ _jsxDEV("li", {
								className: "flex items-center gap-2",
								children: [/* @__PURE__ */ _jsxDEV(MapPin, { className: "size-4 text-info" }, void 0, false, {
									fileName: _jsxFileName,
									lineNumber: 96,
									columnNumber: 15
								}, this), " Industry profiles with past fire history"]
							}, void 0, true, {
								fileName: _jsxFileName,
								lineNumber: 95,
								columnNumber: 13
							}, this),
							/* @__PURE__ */ _jsxDEV("li", {
								className: "flex items-center gap-2",
								children: [/* @__PURE__ */ _jsxDEV(ShieldAlert, { className: "size-4 text-warning" }, void 0, false, {
									fileName: _jsxFileName,
									lineNumber: 99,
									columnNumber: 15
								}, this), " Escalation actions, reports and alert sirens"]
							}, void 0, true, {
								fileName: _jsxFileName,
								lineNumber: 98,
								columnNumber: 13
							}, this)
						]
					}, void 0, true, {
						fileName: _jsxFileName,
						lineNumber: 91,
						columnNumber: 11
					}, this),
					/* @__PURE__ */ _jsxDEV("p", {
						className: "font-mono text-[10px] uppercase tracking-wider text-muted-foreground",
						children: "Demo environment Â· accounts are simulated, no real login is created"
					}, void 0, false, {
						fileName: _jsxFileName,
						lineNumber: 103,
						columnNumber: 11
					}, this)
				]
			}, void 0, true, {
				fileName: _jsxFileName,
				lineNumber: 76,
				columnNumber: 9
			}, this), /* @__PURE__ */ _jsxDEV("form", {
				onSubmit: submit,
				className: "rounded-xl border border-border bg-card p-5 shadow-2xl sm:p-6",
				children: [
					/* @__PURE__ */ _jsxDEV("div", {
						className: "mb-5 grid grid-cols-2 gap-1 rounded-lg bg-secondary/40 p-1",
						children: ["signin", "signup"].map((value) => /* @__PURE__ */ _jsxDEV("button", {
							type: "button",
							onClick: () => {
								setMode(value);
								setError("");
							},
							className: cn("cursor-pointer rounded-md px-3 py-2 text-sm font-medium transition-colors", mode === value ? "bg-primary/20 text-primary ring-1 ring-primary/30" : "text-muted-foreground hover:text-foreground"),
							children: value === "signin" ? "Sign in" : "Create account"
						}, value, false, {
							fileName: _jsxFileName,
							lineNumber: 110,
							columnNumber: 48
						}, this))
					}, void 0, false, {
						fileName: _jsxFileName,
						lineNumber: 109,
						columnNumber: 11
					}, this),
					/* @__PURE__ */ _jsxDEV("div", {
						className: "space-y-4",
						children: [
							/* @__PURE__ */ _jsxDEV("div", {
								className: "space-y-2",
								children: [/* @__PURE__ */ _jsxDEV(Label, {
									htmlFor: "name",
									children: "Officer name"
								}, void 0, false, {
									fileName: _jsxFileName,
									lineNumber: 120,
									columnNumber: 15
								}, this), /* @__PURE__ */ _jsxDEV(Input, {
									id: "name",
									value: name,
									onChange: (e) => setName(e.target.value),
									placeholder: "Full name"
								}, void 0, false, {
									fileName: _jsxFileName,
									lineNumber: 121,
									columnNumber: 15
								}, this)]
							}, void 0, true, {
								fileName: _jsxFileName,
								lineNumber: 119,
								columnNumber: 13
							}, this),
							/* @__PURE__ */ _jsxDEV("div", {
								className: "space-y-2",
								children: [/* @__PURE__ */ _jsxDEV(Label, {
									htmlFor: "email",
									children: "Official email"
								}, void 0, false, {
									fileName: _jsxFileName,
									lineNumber: 124,
									columnNumber: 15
								}, this), /* @__PURE__ */ _jsxDEV(Input, {
									id: "email",
									type: "email",
									value: email,
									onChange: (e) => setEmail(e.target.value),
									placeholder: "name@municipality.gov.in"
								}, void 0, false, {
									fileName: _jsxFileName,
									lineNumber: 125,
									columnNumber: 15
								}, this)]
							}, void 0, true, {
								fileName: _jsxFileName,
								lineNumber: 123,
								columnNumber: 13
							}, this),
							/* @__PURE__ */ _jsxDEV("div", {
								className: "space-y-2",
								children: [/* @__PURE__ */ _jsxDEV(Label, {
									htmlFor: "password",
									children: "Password"
								}, void 0, false, {
									fileName: _jsxFileName,
									lineNumber: 128,
									columnNumber: 15
								}, this), /* @__PURE__ */ _jsxDEV(Input, {
									id: "password",
									type: "password",
									value: password,
									onChange: (e) => setPassword(e.target.value),
									placeholder: "â¢â¢â¢â¢â¢â¢â¢â¢"
								}, void 0, false, {
									fileName: _jsxFileName,
									lineNumber: 129,
									columnNumber: 15
								}, this)]
							}, void 0, true, {
								fileName: _jsxFileName,
								lineNumber: 127,
								columnNumber: 13
							}, this),
							/* @__PURE__ */ _jsxDEV("div", {
								className: "grid gap-4 sm:grid-cols-2",
								children: [/* @__PURE__ */ _jsxDEV("div", {
									className: "space-y-2",
									children: [/* @__PURE__ */ _jsxDEV(Label, { children: "State / UT" }, void 0, false, {
										fileName: _jsxFileName,
										lineNumber: 134,
										columnNumber: 17
									}, this), /* @__PURE__ */ _jsxDEV(Select, {
										value: state,
										onValueChange: (value) => {
											setState(value);
											setMunicipality("");
										},
										children: [/* @__PURE__ */ _jsxDEV(SelectTrigger, { children: /* @__PURE__ */ _jsxDEV(SelectValue, { placeholder: "Select state" }, void 0, false, {
											fileName: _jsxFileName,
											lineNumber: 140,
											columnNumber: 21
										}, this) }, void 0, false, {
											fileName: _jsxFileName,
											lineNumber: 139,
											columnNumber: 19
										}, this), /* @__PURE__ */ _jsxDEV(SelectContent, {
											className: "max-h-72",
											children: INDIA_STATES.map((item) => /* @__PURE__ */ _jsxDEV(SelectItem, {
												value: item,
												children: item
											}, item, false, {
												fileName: _jsxFileName,
												lineNumber: 143,
												columnNumber: 47
											}, this))
										}, void 0, false, {
											fileName: _jsxFileName,
											lineNumber: 142,
											columnNumber: 19
										}, this)]
									}, void 0, true, {
										fileName: _jsxFileName,
										lineNumber: 135,
										columnNumber: 17
									}, this)]
								}, void 0, true, {
									fileName: _jsxFileName,
									lineNumber: 133,
									columnNumber: 15
								}, this), /* @__PURE__ */ _jsxDEV("div", {
									className: "space-y-2",
									children: [/* @__PURE__ */ _jsxDEV(Label, { children: "Municipality" }, void 0, false, {
										fileName: _jsxFileName,
										lineNumber: 150,
										columnNumber: 17
									}, this), /* @__PURE__ */ _jsxDEV(Select, {
										value: municipality,
										onValueChange: setMunicipality,
										disabled: !state,
										children: [/* @__PURE__ */ _jsxDEV(SelectTrigger, { children: /* @__PURE__ */ _jsxDEV(SelectValue, { placeholder: state ? "Select municipality" : "Pick a state first" }, void 0, false, {
											fileName: _jsxFileName,
											lineNumber: 153,
											columnNumber: 21
										}, this) }, void 0, false, {
											fileName: _jsxFileName,
											lineNumber: 152,
											columnNumber: 19
										}, this), /* @__PURE__ */ _jsxDEV(SelectContent, {
											className: "max-h-72",
											children: municipalities.map((item) => /* @__PURE__ */ _jsxDEV(SelectItem, {
												value: item,
												children: item
											}, item, false, {
												fileName: _jsxFileName,
												lineNumber: 156,
												columnNumber: 49
											}, this))
										}, void 0, false, {
											fileName: _jsxFileName,
											lineNumber: 155,
											columnNumber: 19
										}, this)]
									}, void 0, true, {
										fileName: _jsxFileName,
										lineNumber: 151,
										columnNumber: 17
									}, this)]
								}, void 0, true, {
									fileName: _jsxFileName,
									lineNumber: 149,
									columnNumber: 15
								}, this)]
							}, void 0, true, {
								fileName: _jsxFileName,
								lineNumber: 132,
								columnNumber: 13
							}, this)
						]
					}, void 0, true, {
						fileName: _jsxFileName,
						lineNumber: 118,
						columnNumber: 11
					}, this),
					error ? /* @__PURE__ */ _jsxDEV("p", {
						className: "mt-3 text-xs text-critical",
						children: error
					}, void 0, false, {
						fileName: _jsxFileName,
						lineNumber: 165,
						columnNumber: 20
					}, this) : null,
					/* @__PURE__ */ _jsxDEV(Button, {
						type: "submit",
						className: "mt-5 w-full",
						children: [mode === "signin" ? /* @__PURE__ */ _jsxDEV(LogIn, { className: "size-4" }, void 0, false, {
							fileName: _jsxFileName,
							lineNumber: 168,
							columnNumber: 34
						}, this) : /* @__PURE__ */ _jsxDEV(UserPlus, { className: "size-4" }, void 0, false, {
							fileName: _jsxFileName,
							lineNumber: 168,
							columnNumber: 65
						}, this), mode === "signin" ? "Enter control room" : "Create demo account"]
					}, void 0, true, {
						fileName: _jsxFileName,
						lineNumber: 167,
						columnNumber: 11
					}, this),
					/* @__PURE__ */ _jsxDEV("p", {
						className: "mt-3 text-center font-mono text-[9px] uppercase tracking-wider text-muted-foreground",
						children: "Demo only â any details are accepted and stored on this device"
					}, void 0, false, {
						fileName: _jsxFileName,
						lineNumber: 172,
						columnNumber: 11
					}, this)
				]
			}, void 0, true, {
				fileName: _jsxFileName,
				lineNumber: 108,
				columnNumber: 9
			}, this)]
		}, void 0, true, {
			fileName: _jsxFileName,
			lineNumber: 75,
			columnNumber: 7
		}, this)]
	}, void 0, true, {
		fileName: _jsxFileName,
		lineNumber: 72,
		columnNumber: 10
	}, this);
}
_s(AuthPage, "Y7zKsaMJoA/kt8y6S3Iqy1p+UOY=", false, function() {
	return [useNavigate];
});
_c = AuthPage;
export { AuthPage as component };
var _c;
$RefreshReg$(_c, "AuthPage");
import * as RefreshRuntime from "/municipal/@react-refresh";
const inWebWorker = typeof WorkerGlobalScope !== 'undefined' && self instanceof WorkerGlobalScope;
import * as __vite_react_currentExports from "/municipal/src/routes/index.jsx?tsr-split=component";
if (import.meta.hot && !inWebWorker) {
  if (!window.$RefreshReg$) {
    throw new Error(
      "@vitejs/plugin-react can't detect preamble. Something is wrong."
    );
  }

  const currentExports = __vite_react_currentExports;
  queueMicrotask(() => {
    RefreshRuntime.registerExportsForReactRefresh("C:/Users/shrey/Desktop/SIH PS2/Landing Page/municipal-portal/src/routes/index.jsx?tsr-split=component", currentExports);
    import.meta.hot.accept((nextExports) => {
      if (!nextExports) return;
      const invalidateMessage = RefreshRuntime.validateRefreshBoundaryAndEnqueueUpdate("C:/Users/shrey/Desktop/SIH PS2/Landing Page/municipal-portal/src/routes/index.jsx?tsr-split=component", currentExports, nextExports);
      if (invalidateMessage) import.meta.hot.invalidate(invalidateMessage);
    });
  });
}
function $RefreshReg$(type, id) { return RefreshRuntime.register(type, "C:/Users/shrey/Desktop/SIH PS2/Landing Page/municipal-portal/src/routes/index.jsx?tsr-split=component" + ' ' + id); }
function $RefreshSig$() { return RefreshRuntime.createSignatureFunctionForTransform(); }

//# sourceMappingURL=data:application/json;base64,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LFlBQU8sZUFBbUI7Ozs7bUJBQzFCLHdCQUFDLFFBQUQ7VUFBUSxPQUFPekI7VUFBYyxlQUFlQztVQUFpQixVQUFVLENBQUNIO29CQUF4RSxDQUNFLHdCQUFDLGVBQUQsWUFDRSx3QkFBQyxhQUFELEVBQ0UsYUFBYUEsUUFBUSx3QkFBd0IscUJBQXFCOzs7O21CQUV2RDs7OztvQkFDZix3QkFBQyxlQUFEO1dBQWUsV0FBVTtxQkFDdEJPLGVBQWVpQixLQUFLRyxTQUNuQix3QkFBQyxZQUFEO1lBQXVCLE9BQU9BO3NCQUMzQkE7V0FDUyxHQUZLQTs7OztrQkFFTCxDQUNiO1VBQ1k7Ozs7a0JBQ1Q7Ozs7O2lCQUNMOzs7OztnQkFDRjs7Ozs7O01BQ0Y7Ozs7OztLQUVKdkIsUUFBUSx3QkFBQyxLQUFEO01BQUcsV0FBVTtnQkFBOEJBO0tBQVM7Ozs7Z0JBQUk7S0FFakUsd0JBQUMsUUFBRDtNQUFRLE1BQUs7TUFBUyxXQUFVO2dCQUFoQyxDQUNHWixTQUFTLFdBQVcsd0JBQUMsT0FBRCxFQUFPLFdBQVUsU0FBUTs7OztpQkFBTSx3QkFBQyxVQUFELEVBQVUsV0FBVSxTQUFROzs7O2dCQUMvRUEsU0FBUyxXQUFXLHVCQUF1QixxQkFDdEM7Ozs7OztLQUVSLHdCQUFDLEtBQUQ7TUFBRyxXQUFVO2dCQUFzRjtLQUVoRzs7Ozs7SUFDQzs7Ozs7V0FDSDs7Ozs7VUFDRjs7Ozs7O0FBRVQ7Ozs7O0FBQUMsU0FBQUYsWUFBQXNDIiwibmFtZXMiOlsidXNlTmF2aWdhdGUiLCJGbGFtZSIsIkxvZ0luIiwiTWFwUGluIiwiU2hpZWxkQWxlcnQiLCJVc2VyUGx1cyIsInVzZUVmZmVjdCIsInVzZU1lbW8iLCJ1c2VTdGF0ZSIsIkJ1dHRvbiIsIklucHV0IiwiTGFiZWwiLCJTZWxlY3QiLCJTZWxlY3RDb250ZW50IiwiU2VsZWN0SXRlbSIsIlNlbGVjdFRyaWdnZXIiLCJTZWxlY3RWYWx1ZSIsIklORElBX01VTklDSVBBTElUSUVTIiwiSU5ESUFfU1RBVEVTIiwicmVhZFNlc3Npb24iLCJ3cml0ZVNlc3Npb24iLCJjbiIsIkF1dGhQYWdlIiwibmF2aWdhdGUiLCJtb2RlIiwic2V0TW9kZSIsIm5hbWUiLCJzZXROYW1lIiwiZW1haWwiLCJzZXRFbWFpbCIsInBhc3N3b3JkIiwic2V0UGFzc3dvcmQiLCJzdGF0ZSIsInNldFN0YXRlIiwibXVuaWNpcGFsaXR5Iiwic2V0TXVuaWNpcGFsaXR5IiwiZXJyb3IiLCJzZXRFcnJvciIsInRvIiwibXVuaWNpcGFsaXRpZXMiLCJzdWJtaXQiLCJldmVudCIsInByZXZlbnREZWZhdWx0IiwidHJpbSIsInJlcyIsImZldGNoIiwibWV0aG9kIiwiaGVhZGVycyIsImJvZHkiLCJKU09OIiwic3RyaW5naWZ5IiwidXNlcm5hbWUiLCJvayIsInVzZXIiLCJqc29uIiwiZSIsIm1hcCIsInZhbHVlIiwidGFyZ2V0IiwiaXRlbSIsImNvbXBvbmVudCJdLCJpZ25vcmVMaXN0IjpbXSwic291cmNlcyI6WyJpbmRleC5qc3g/dHNyLXNwbGl0PWNvbXBvbmVudCJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBjcmVhdGVGaWxlUm91dGUsIHVzZU5hdmlnYXRlIH0gZnJvbSBcIkB0YW5zdGFjay9yZWFjdC1yb3V0ZXJcIjtcbmltcG9ydCB7IEZsYW1lLCBMb2dJbiwgTWFwUGluLCBTaGllbGRBbGVydCwgVXNlclBsdXMgfSBmcm9tIFwibHVjaWRlLXJlYWN0XCI7XG5pbXBvcnQgeyB1c2VFZmZlY3QsIHVzZU1lbW8sIHVzZVN0YXRlIH0gZnJvbSBcInJlYWN0XCI7XG5cbmltcG9ydCB7IEJ1dHRvbiB9IGZyb20gXCJAL2NvbXBvbmVudHMvdWkvYnV0dG9uXCI7XG5pbXBvcnQgeyBJbnB1dCB9IGZyb20gXCJAL2NvbXBvbmVudHMvdWkvaW5wdXRcIjtcbmltcG9ydCB7IExhYmVsIH0gZnJvbSBcIkAvY29tcG9uZW50cy91aS9sYWJlbFwiO1xuaW1wb3J0IHtcbiAgU2VsZWN0LFxuICBTZWxlY3RDb250ZW50LFxuICBTZWxlY3RJdGVtLFxuICBTZWxlY3RUcmlnZ2VyLFxuICBTZWxlY3RWYWx1ZSxcbn0gZnJvbSBcIkAvY29tcG9uZW50cy91aS9zZWxlY3RcIjtcbmltcG9ydCB7IElORElBX01VTklDSVBBTElUSUVTLCBJTkRJQV9TVEFURVMgfSBmcm9tIFwiQC9saWIvaW5kaWEtbXVuaWNpcGFsaXRpZXNcIjtcbmltcG9ydCB7IHJlYWRTZXNzaW9uLCB3cml0ZVNlc3Npb24gfSBmcm9tIFwiQC9saWIvZGVtby1zZXNzaW9uXCI7XG5pbXBvcnQgeyBjbiB9IGZyb20gXCJAL2xpYi91dGlsc1wiO1xuXG5leHBvcnQgY29uc3QgUm91dGUgPSBjcmVhdGVGaWxlUm91dGUoXCIvXCIpKHtcbiAgaGVhZDogKCkgPT4gKHtcbiAgICBtZXRhOiBbXG4gICAgICB7IHRpdGxlOiBcIlNpZ24gaW4g4oCUIEFHTkktVklTSU9OIE11bmljaXBhbCBXYXRjaFwiIH0sXG4gICAgICB7XG4gICAgICAgIG5hbWU6IFwiZGVzY3JpcHRpb25cIixcbiAgICAgICAgY29udGVudDpcbiAgICAgICAgICBcIkRlbW8gc2lnbi1pbiBmb3IgdGhlIEFHTkktVklTSU9OIG11bmljaXBhbCBmaXJlIGNvbnRyb2wgY29uc29sZS4gUGljayB5b3VyIHN0YXRlIGFuZCBtdW5pY2lwYWxpdHkgdG8gZW50ZXIgdGhlIHdhcmQtbGV2ZWwgYWxlcnQgZGFzaGJvYXJkLlwiLFxuICAgICAgfSxcbiAgICAgIHsgcHJvcGVydHk6IFwib2c6dGl0bGVcIiwgY29udGVudDogXCJTaWduIGluIOKAlCBBR05JLVZJU0lPTiBNdW5pY2lwYWwgV2F0Y2hcIiB9LFxuICAgICAge1xuICAgICAgICBwcm9wZXJ0eTogXCJvZzpkZXNjcmlwdGlvblwiLFxuICAgICAgICBjb250ZW50OiBcIkRlbW8gYWNjZXNzIHRvIHdhcmQtbGV2ZWwgZmlyZSBhbGVydHMsIGluZHVzdHJ5IGhpc3RvcmllcyBhbmQgcmVzcG9uc2UgcmVwb3J0cy5cIixcbiAgICAgIH0sXG4gICAgICB7IHByb3BlcnR5OiBcIm9nOnR5cGVcIiwgY29udGVudDogXCJ3ZWJzaXRlXCIgfSxcbiAgICAgIHsgbmFtZTogXCJ0d2l0dGVyOmNhcmRcIiwgY29udGVudDogXCJzdW1tYXJ5X2xhcmdlX2ltYWdlXCIgfSxcbiAgICBdLFxuICB9KSxcbiAgY29tcG9uZW50OiBBdXRoUGFnZSxcbn0pO1xuXG5mdW5jdGlvbiBBdXRoUGFnZSgpIHtcbiAgY29uc3QgbmF2aWdhdGUgPSB1c2VOYXZpZ2F0ZSgpO1xuICBjb25zdCBbbW9kZSwgc2V0TW9kZV0gPSB1c2VTdGF0ZShcInNpZ25pblwiKTtcbiAgY29uc3QgW25hbWUsIHNldE5hbWVdID0gdXNlU3RhdGUoXCJSLiBLYXBhZGlhXCIpO1xuICBjb25zdCBbZW1haWwsIHNldEVtYWlsXSA9IHVzZVN0YXRlKFwiY29udHJvbC5yb29tQG11bmljaXBhbGl0eS5nb3YuaW5cIik7XG4gIGNvbnN0IFtwYXNzd29yZCwgc2V0UGFzc3dvcmRdID0gdXNlU3RhdGUoXCJkZW1vMTIzNFwiKTtcbiAgY29uc3QgW3N0YXRlLCBzZXRTdGF0ZV0gPSB1c2VTdGF0ZShcIk1haGFyYXNodHJhXCIpO1xuICBjb25zdCBbbXVuaWNpcGFsaXR5LCBzZXRNdW5pY2lwYWxpdHldID0gdXNlU3RhdGUoXCJQdW5lIE1DXCIpO1xuICBjb25zdCBbZXJyb3IsIHNldEVycm9yXSA9IHVzZVN0YXRlKFwiXCIpO1xuXG4gIHVzZUVmZmVjdCgoKSA9PiB7XG4gICAgaWYgKHJlYWRTZXNzaW9uKCkpIHZvaWQgbmF2aWdhdGUoeyB0bzogXCIvZGFzaGJvYXJkXCIgfSk7XG4gIH0sIFtuYXZpZ2F0ZV0pO1xuXG4gIGNvbnN0IG11bmljaXBhbGl0aWVzID0gdXNlTWVtbygoKSA9PiBJTkRJQV9NVU5JQ0lQQUxJVElFU1tzdGF0ZV0gPz8gW10sIFtzdGF0ZV0pO1xuXG4gIGNvbnN0IHN1Ym1pdCA9IGFzeW5jIChldmVudCkgPT4ge1xuICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgaWYgKCFuYW1lLnRyaW0oKSB8fCAhZW1haWwudHJpbSgpIHx8ICFwYXNzd29yZC50cmltKCkpIHtcbiAgICAgIHNldEVycm9yKFwiRmlsbCBpbiBldmVyeSBmaWVsZCB0byBjb250aW51ZS5cIik7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGlmICghc3RhdGUgfHwgIW11bmljaXBhbGl0eSkge1xuICAgICAgc2V0RXJyb3IoXCJTZWxlY3QgYSBzdGF0ZSBhbmQgdGhlbiBhIG11bmljaXBhbGl0eS5cIik7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IHJlcyA9IGF3YWl0IGZldGNoKFwiaHR0cDovL2xvY2FsaG9zdDo4MDAwL2FwaS9hdXRoL2xvZ2luXCIsIHtcbiAgICAgICAgbWV0aG9kOiBcIlBPU1RcIixcbiAgICAgICAgaGVhZGVyczogeyBcIkNvbnRlbnQtVHlwZVwiOiBcImFwcGxpY2F0aW9uL2pzb25cIiB9LFxuICAgICAgICBib2R5OiBKU09OLnN0cmluZ2lmeSh7XG4gICAgICAgICAgdXNlcm5hbWU6IGVtYWlsLnRyaW0oKSxcbiAgICAgICAgICBwYXNzd29yZDogcGFzc3dvcmQudHJpbSgpLFxuICAgICAgICAgIG5hbWU6IG5hbWUudHJpbSgpLFxuICAgICAgICAgIG11bmljaXBhbGl0eSxcbiAgICAgICAgICBzdGF0ZSxcbiAgICAgICAgfSksXG4gICAgICB9KTtcbiAgICAgIGlmIChyZXMub2spIHtcbiAgICAgICAgY29uc3QgdXNlciA9IGF3YWl0IHJlcy5qc29uKCk7XG4gICAgICAgIHdyaXRlU2Vzc2lvbih1c2VyKTtcbiAgICAgICAgdm9pZCBuYXZpZ2F0ZSh7IHRvOiBcIi9kYXNoYm9hcmRcIiB9KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHNldEVycm9yKFwiSW52YWxpZCBjcmVkZW50aWFscy5cIik7XG4gICAgICB9XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgLy8gRmFsbGJhY2sgZm9yIGRlbW8gaWYgYmFja2VuZCBpcyBvZmZsaW5lXG4gICAgICB3cml0ZVNlc3Npb24oeyBuYW1lOiBuYW1lLnRyaW0oKSwgZW1haWw6IGVtYWlsLnRyaW0oKSwgc3RhdGUsIG11bmljaXBhbGl0eSB9KTtcbiAgICAgIHZvaWQgbmF2aWdhdGUoeyB0bzogXCIvZGFzaGJvYXJkXCIgfSk7XG4gICAgfVxuICB9O1xuXG4gIHJldHVybiAoXG4gICAgPGRpdiBjbGFzc05hbWU9XCJyZWxhdGl2ZSBncmlkIG1pbi1oLXNjcmVlbiBwbGFjZS1pdGVtcy1jZW50ZXIgb3ZlcmZsb3ctaGlkZGVuIGJnLWJhY2tncm91bmQgcHgtNCBweS0xMCB0ZXh0LWZvcmVncm91bmRcIj5cbiAgICAgIDxkaXYgY2xhc3NOYW1lPVwicG9pbnRlci1ldmVudHMtbm9uZSBhYnNvbHV0ZSBpbnNldC0wIGJnLVtyYWRpYWwtZ3JhZGllbnQoY2lyY2xlX2F0XzEyJV8wJSxjb2xvci1taXgoaW5fb2tsYWIsdmFyKC0tY29sb3ItcHJpbWFyeSlfMjAlLHRyYW5zcGFyZW50KSx0cmFuc3BhcmVudF8zNSUpLHJhZGlhbC1ncmFkaWVudChjaXJjbGVfYXRfOTUlXzkwJSxjb2xvci1taXgoaW5fb2tsYWIsdmFyKC0tY29sb3ItY3JpdGljYWwpXzE0JSx0cmFuc3BhcmVudCksdHJhbnNwYXJlbnRfMzIlKV1cIiAvPlxuXG4gICAgICA8ZGl2IGNsYXNzTmFtZT1cInJlbGF0aXZlIHotMTAgZ3JpZCB3LWZ1bGwgbWF4LXctNHhsIGdhcC02IGxnOmdyaWQtY29scy1bMWZyXzEuMWZyXVwiPlxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImhpZGRlbiBmbGV4LWNvbCBqdXN0aWZ5LWNlbnRlciBnYXAtNSBsZzpmbGV4XCI+XG4gICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJmbGV4IGl0ZW1zLWNlbnRlciBnYXAtM1wiPlxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJncmlkIHNpemUtMTEgcGxhY2UtaXRlbXMtY2VudGVyIHJvdW5kZWQtbGcgYmctcHJpbWFyeS8xNSB0ZXh0LXByaW1hcnkgcmluZy0xIHJpbmctcHJpbWFyeS8zMFwiPlxuICAgICAgICAgICAgICA8U2hpZWxkQWxlcnQgY2xhc3NOYW1lPVwic2l6ZS02XCIgLz5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgPGRpdj5cbiAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJ0ZXh0LWJhc2UgZm9udC1zZW1pYm9sZFwiPkFHTkktVklTSU9OIE1VTklDSVBBTCBXQVRDSDwvZGl2PlxuICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImZvbnQtbW9ubyB0ZXh0LVsxMHB4XSB1cHBlcmNhc2UgdHJhY2tpbmctWzAuMThlbV0gdGV4dC1wcmltYXJ5XCI+XG4gICAgICAgICAgICAgICAgRmlyZSAmYW1wOyBzYWZldHkgY29udHJvbCBwb3J0YWxcbiAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICA8aDEgY2xhc3NOYW1lPVwidGV4dC0zeGwgZm9udC1ib2xkIGxlYWRpbmctdGlnaHRcIj5cbiAgICAgICAgICAgIFdhcmQtbGV2ZWwgZmlyZSBkZXRlY3Rpb24gZm9yIG11bmljaXBhbCBjb250cm9sIHJvb21zLlxuICAgICAgICAgIDwvaDE+XG4gICAgICAgICAgPHVsIGNsYXNzTmFtZT1cInNwYWNlLXktMiB0ZXh0LXNtIHRleHQtbXV0ZWQtZm9yZWdyb3VuZFwiPlxuICAgICAgICAgICAgPGxpIGNsYXNzTmFtZT1cImZsZXggaXRlbXMtY2VudGVyIGdhcC0yXCI+XG4gICAgICAgICAgICAgIDxGbGFtZSBjbGFzc05hbWU9XCJzaXplLTQgdGV4dC1jcml0aWNhbFwiIC8+IExpdmUgc2F0ZWxsaXRlIHRoZXJtYWwgYWxlcnRzIGJ5IHdhcmRcbiAgICAgICAgICAgIDwvbGk+XG4gICAgICAgICAgICA8bGkgY2xhc3NOYW1lPVwiZmxleCBpdGVtcy1jZW50ZXIgZ2FwLTJcIj5cbiAgICAgICAgICAgICAgPE1hcFBpbiBjbGFzc05hbWU9XCJzaXplLTQgdGV4dC1pbmZvXCIgLz4gSW5kdXN0cnkgcHJvZmlsZXMgd2l0aCBwYXN0IGZpcmUgaGlzdG9yeVxuICAgICAgICAgICAgPC9saT5cbiAgICAgICAgICAgIDxsaSBjbGFzc05hbWU9XCJmbGV4IGl0ZW1zLWNlbnRlciBnYXAtMlwiPlxuICAgICAgICAgICAgICA8U2hpZWxkQWxlcnQgY2xhc3NOYW1lPVwic2l6ZS00IHRleHQtd2FybmluZ1wiIC8+IEVzY2FsYXRpb24gYWN0aW9ucywgcmVwb3J0cyBhbmQgYWxlcnRcbiAgICAgICAgICAgICAgc2lyZW5zXG4gICAgICAgICAgICA8L2xpPlxuICAgICAgICAgIDwvdWw+XG4gICAgICAgICAgPHAgY2xhc3NOYW1lPVwiZm9udC1tb25vIHRleHQtWzEwcHhdIHVwcGVyY2FzZSB0cmFja2luZy13aWRlciB0ZXh0LW11dGVkLWZvcmVncm91bmRcIj5cbiAgICAgICAgICAgIERlbW8gZW52aXJvbm1lbnQgwrcgYWNjb3VudHMgYXJlIHNpbXVsYXRlZCwgbm8gcmVhbCBsb2dpbiBpcyBjcmVhdGVkXG4gICAgICAgICAgPC9wPlxuICAgICAgICA8L2Rpdj5cblxuICAgICAgICA8Zm9ybVxuICAgICAgICAgIG9uU3VibWl0PXtzdWJtaXR9XG4gICAgICAgICAgY2xhc3NOYW1lPVwicm91bmRlZC14bCBib3JkZXIgYm9yZGVyLWJvcmRlciBiZy1jYXJkIHAtNSBzaGFkb3ctMnhsIHNtOnAtNlwiXG4gICAgICAgID5cbiAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm1iLTUgZ3JpZCBncmlkLWNvbHMtMiBnYXAtMSByb3VuZGVkLWxnIGJnLXNlY29uZGFyeS80MCBwLTFcIj5cbiAgICAgICAgICAgIHtbXCJzaWduaW5cIiwgXCJzaWdudXBcIl0ubWFwKCh2YWx1ZSkgPT4gKFxuICAgICAgICAgICAgICA8YnV0dG9uXG4gICAgICAgICAgICAgICAga2V5PXt2YWx1ZX1cbiAgICAgICAgICAgICAgICB0eXBlPVwiYnV0dG9uXCJcbiAgICAgICAgICAgICAgICBvbkNsaWNrPXsoKSA9PiB7XG4gICAgICAgICAgICAgICAgICBzZXRNb2RlKHZhbHVlKTtcbiAgICAgICAgICAgICAgICAgIHNldEVycm9yKFwiXCIpO1xuICAgICAgICAgICAgICAgIH19XG4gICAgICAgICAgICAgICAgY2xhc3NOYW1lPXtjbihcbiAgICAgICAgICAgICAgICAgIFwiY3Vyc29yLXBvaW50ZXIgcm91bmRlZC1tZCBweC0zIHB5LTIgdGV4dC1zbSBmb250LW1lZGl1bSB0cmFuc2l0aW9uLWNvbG9yc1wiLFxuICAgICAgICAgICAgICAgICAgbW9kZSA9PT0gdmFsdWVcbiAgICAgICAgICAgICAgICAgICAgPyBcImJnLXByaW1hcnkvMjAgdGV4dC1wcmltYXJ5IHJpbmctMSByaW5nLXByaW1hcnkvMzBcIlxuICAgICAgICAgICAgICAgICAgICA6IFwidGV4dC1tdXRlZC1mb3JlZ3JvdW5kIGhvdmVyOnRleHQtZm9yZWdyb3VuZFwiLFxuICAgICAgICAgICAgICAgICl9XG4gICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICB7dmFsdWUgPT09IFwic2lnbmluXCIgPyBcIlNpZ24gaW5cIiA6IFwiQ3JlYXRlIGFjY291bnRcIn1cbiAgICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgICApKX1cbiAgICAgICAgICA8L2Rpdj5cblxuICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwic3BhY2UteS00XCI+XG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInNwYWNlLXktMlwiPlxuICAgICAgICAgICAgICA8TGFiZWwgaHRtbEZvcj1cIm5hbWVcIj5PZmZpY2VyIG5hbWU8L0xhYmVsPlxuICAgICAgICAgICAgICA8SW5wdXRcbiAgICAgICAgICAgICAgICBpZD1cIm5hbWVcIlxuICAgICAgICAgICAgICAgIHZhbHVlPXtuYW1lfVxuICAgICAgICAgICAgICAgIG9uQ2hhbmdlPXsoZSkgPT4gc2V0TmFtZShlLnRhcmdldC52YWx1ZSl9XG4gICAgICAgICAgICAgICAgcGxhY2Vob2xkZXI9XCJGdWxsIG5hbWVcIlxuICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInNwYWNlLXktMlwiPlxuICAgICAgICAgICAgICA8TGFiZWwgaHRtbEZvcj1cImVtYWlsXCI+T2ZmaWNpYWwgZW1haWw8L0xhYmVsPlxuICAgICAgICAgICAgICA8SW5wdXRcbiAgICAgICAgICAgICAgICBpZD1cImVtYWlsXCJcbiAgICAgICAgICAgICAgICB0eXBlPVwiZW1haWxcIlxuICAgICAgICAgICAgICAgIHZhbHVlPXtlbWFpbH1cbiAgICAgICAgICAgICAgICBvbkNoYW5nZT17KGUpID0+IHNldEVtYWlsKGUudGFyZ2V0LnZhbHVlKX1cbiAgICAgICAgICAgICAgICBwbGFjZWhvbGRlcj1cIm5hbWVAbXVuaWNpcGFsaXR5Lmdvdi5pblwiXG4gICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwic3BhY2UteS0yXCI+XG4gICAgICAgICAgICAgIDxMYWJlbCBodG1sRm9yPVwicGFzc3dvcmRcIj5QYXNzd29yZDwvTGFiZWw+XG4gICAgICAgICAgICAgIDxJbnB1dFxuICAgICAgICAgICAgICAgIGlkPVwicGFzc3dvcmRcIlxuICAgICAgICAgICAgICAgIHR5cGU9XCJwYXNzd29yZFwiXG4gICAgICAgICAgICAgICAgdmFsdWU9e3Bhc3N3b3JkfVxuICAgICAgICAgICAgICAgIG9uQ2hhbmdlPXsoZSkgPT4gc2V0UGFzc3dvcmQoZS50YXJnZXQudmFsdWUpfVxuICAgICAgICAgICAgICAgIHBsYWNlaG9sZGVyPVwi4oCi4oCi4oCi4oCi4oCi4oCi4oCi4oCiXCJcbiAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgIDwvZGl2PlxuXG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImdyaWQgZ2FwLTQgc206Z3JpZC1jb2xzLTJcIj5cbiAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJzcGFjZS15LTJcIj5cbiAgICAgICAgICAgICAgICA8TGFiZWw+U3RhdGUgLyBVVDwvTGFiZWw+XG4gICAgICAgICAgICAgICAgPFNlbGVjdFxuICAgICAgICAgICAgICAgICAgdmFsdWU9e3N0YXRlfVxuICAgICAgICAgICAgICAgICAgb25WYWx1ZUNoYW5nZT17KHZhbHVlKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHNldFN0YXRlKHZhbHVlKTtcbiAgICAgICAgICAgICAgICAgICAgc2V0TXVuaWNpcGFsaXR5KFwiXCIpO1xuICAgICAgICAgICAgICAgICAgfX1cbiAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICA8U2VsZWN0VHJpZ2dlcj5cbiAgICAgICAgICAgICAgICAgICAgPFNlbGVjdFZhbHVlIHBsYWNlaG9sZGVyPVwiU2VsZWN0IHN0YXRlXCIgLz5cbiAgICAgICAgICAgICAgICAgIDwvU2VsZWN0VHJpZ2dlcj5cbiAgICAgICAgICAgICAgICAgIDxTZWxlY3RDb250ZW50IGNsYXNzTmFtZT1cIm1heC1oLTcyXCI+XG4gICAgICAgICAgICAgICAgICAgIHtJTkRJQV9TVEFURVMubWFwKChpdGVtKSA9PiAoXG4gICAgICAgICAgICAgICAgICAgICAgPFNlbGVjdEl0ZW0ga2V5PXtpdGVtfSB2YWx1ZT17aXRlbX0+XG4gICAgICAgICAgICAgICAgICAgICAgICB7aXRlbX1cbiAgICAgICAgICAgICAgICAgICAgICA8L1NlbGVjdEl0ZW0+XG4gICAgICAgICAgICAgICAgICAgICkpfVxuICAgICAgICAgICAgICAgICAgPC9TZWxlY3RDb250ZW50PlxuICAgICAgICAgICAgICAgIDwvU2VsZWN0PlxuICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJzcGFjZS15LTJcIj5cbiAgICAgICAgICAgICAgICA8TGFiZWw+TXVuaWNpcGFsaXR5PC9MYWJlbD5cbiAgICAgICAgICAgICAgICA8U2VsZWN0IHZhbHVlPXttdW5pY2lwYWxpdHl9IG9uVmFsdWVDaGFuZ2U9e3NldE11bmljaXBhbGl0eX0gZGlzYWJsZWQ9eyFzdGF0ZX0+XG4gICAgICAgICAgICAgICAgICA8U2VsZWN0VHJpZ2dlcj5cbiAgICAgICAgICAgICAgICAgICAgPFNlbGVjdFZhbHVlXG4gICAgICAgICAgICAgICAgICAgICAgcGxhY2Vob2xkZXI9e3N0YXRlID8gXCJTZWxlY3QgbXVuaWNpcGFsaXR5XCIgOiBcIlBpY2sgYSBzdGF0ZSBmaXJzdFwifVxuICAgICAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICAgICAgPC9TZWxlY3RUcmlnZ2VyPlxuICAgICAgICAgICAgICAgICAgPFNlbGVjdENvbnRlbnQgY2xhc3NOYW1lPVwibWF4LWgtNzJcIj5cbiAgICAgICAgICAgICAgICAgICAge211bmljaXBhbGl0aWVzLm1hcCgoaXRlbSkgPT4gKFxuICAgICAgICAgICAgICAgICAgICAgIDxTZWxlY3RJdGVtIGtleT17aXRlbX0gdmFsdWU9e2l0ZW19PlxuICAgICAgICAgICAgICAgICAgICAgICAge2l0ZW19XG4gICAgICAgICAgICAgICAgICAgICAgPC9TZWxlY3RJdGVtPlxuICAgICAgICAgICAgICAgICAgICApKX1cbiAgICAgICAgICAgICAgICAgIDwvU2VsZWN0Q29udGVudD5cbiAgICAgICAgICAgICAgICA8L1NlbGVjdD5cbiAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICA8L2Rpdj5cblxuICAgICAgICAgIHtlcnJvciA/IDxwIGNsYXNzTmFtZT1cIm10LTMgdGV4dC14cyB0ZXh0LWNyaXRpY2FsXCI+e2Vycm9yfTwvcD4gOiBudWxsfVxuXG4gICAgICAgICAgPEJ1dHRvbiB0eXBlPVwic3VibWl0XCIgY2xhc3NOYW1lPVwibXQtNSB3LWZ1bGxcIj5cbiAgICAgICAgICAgIHttb2RlID09PSBcInNpZ25pblwiID8gPExvZ0luIGNsYXNzTmFtZT1cInNpemUtNFwiIC8+IDogPFVzZXJQbHVzIGNsYXNzTmFtZT1cInNpemUtNFwiIC8+fVxuICAgICAgICAgICAge21vZGUgPT09IFwic2lnbmluXCIgPyBcIkVudGVyIGNvbnRyb2wgcm9vbVwiIDogXCJDcmVhdGUgZGVtbyBhY2NvdW50XCJ9XG4gICAgICAgICAgPC9CdXR0b24+XG5cbiAgICAgICAgICA8cCBjbGFzc05hbWU9XCJtdC0zIHRleHQtY2VudGVyIGZvbnQtbW9ubyB0ZXh0LVs5cHhdIHVwcGVyY2FzZSB0cmFja2luZy13aWRlciB0ZXh0LW11dGVkLWZvcmVncm91bmRcIj5cbiAgICAgICAgICAgIERlbW8gb25seSDigJQgYW55IGRldGFpbHMgYXJlIGFjY2VwdGVkIGFuZCBzdG9yZWQgb24gdGhpcyBkZXZpY2VcbiAgICAgICAgICA8L3A+XG4gICAgICAgIDwvZm9ybT5cbiAgICAgIDwvZGl2PlxuICAgIDwvZGl2PlxuICApO1xufVxuIl0sImZpbGUiOiJDOi9Vc2Vycy9zaHJleS9EZXNrdG9wL1NJSCBQUzIvTGFuZGluZyBQYWdlL211bmljaXBhbC1wb3J0YWwvc3JjL3JvdXRlcy9pbmRleC5qc3gifQ==
