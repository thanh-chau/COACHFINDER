const API_BASE_URL = process.env.COACHFINDER_API_URL || process.env.VITE_API_URL || "http://localhost:8080";

const roles = [
  {
    key: "learner",
    expectedRole: "TRAINEES",
    emailEnv: "COACHFINDER_LEARNER_EMAIL",
    passwordEnv: "COACHFINDER_LEARNER_PASSWORD",
    checks: [
      ["progress overview", "GET", "/api/v1/trainees/progress/overview"],
      ["my bookings", "GET", "/api/bookings/my", { raw: true }],
      ["subscription current", "GET", "/api/v1/subscriptions/me"],
      ["wallet", "GET", "/api/v1/wallets/me"],
      ["video library", "GET", "/api/v1/videos"],
      ["notifications", "GET", "/api/v1/notifications"],
      ["chat unread", "GET", "/api/v1/chat/unread-count"],
    ],
  },
  {
    key: "coach",
    expectedRole: "COACHES",
    emailEnv: "COACHFINDER_COACH_EMAIL",
    passwordEnv: "COACHFINDER_COACH_PASSWORD",
    checks: [
      ["coach calendar", "GET", "/api/coach/calendar/list", { raw: true }],
      ["coach students", "GET", "/api/v1/coach/students"],
      ["coach income overview", "GET", "/api/v1/coach/income/overview"],
      ["coach analytics overview", "GET", "/api/v1/coach/analytics/overview"],
      ["coach videos", "GET", "/api/v1/videos"],
      ["coach submissions", "GET", "/api/v1/coach/submissions"],
      ["coach subscription catalog", "GET", "/api/v1/subscriptions/coach/catalog"],
      ["notifications", "GET", "/api/v1/notifications"],
      ["chat unread", "GET", "/api/v1/chat/unread-count"],
    ],
  },
  {
    key: "admin",
    expectedRole: "ADMIN",
    emailEnv: "COACHFINDER_ADMIN_EMAIL",
    passwordEnv: "COACHFINDER_ADMIN_PASSWORD",
    checks: [
      ["admin overview", "GET", "/api/v1/admin/dashboard/overview"],
      ["admin users", "GET", "/api/v1/admin/users?page=0&size=5"],
      ["admin transactions", "GET", "/api/v1/admin/transactions?page=0&size=5"],
      ["admin subscriptions", "GET", "/api/v1/admin/subscriptions/summary"],
      ["admin finance overview", "GET", "/api/v1/admin/finance/overview"],
      ["admin platform settings", "GET", "/api/v1/admin/platform-settings"],
      ["notifications", "GET", "/api/v1/notifications"],
      ["chat unread", "GET", "/api/v1/chat/unread-count"],
    ],
  },
];

const requiredOpenApiPaths = [
  "/api/v1/auth/login",
  "/api/v1/auth/me",
  "/api/v1/notifications",
  "/api/v1/chat/unread-count",
  "/api/v1/trainees/progress/overview",
  "/api/bookings/my",
  "/api/coach/calendar/list",
  "/api/v1/coach/students",
  "/api/v1/coach/income/overview",
  "/api/v1/coach/analytics/overview",
  "/api/v1/videos",
  "/api/v1/coach/submissions",
  "/api/v1/admin/users",
  "/api/v1/admin/dashboard/overview",
];

let failures = 0;
let skipped = 0;

function log(status, label, detail = "") {
  const suffix = detail ? ` - ${detail}` : "";
  console.log(`${status.padEnd(5)} ${label}${suffix}`);
}

async function request(path, { method = "GET", token, body, raw = false } = {}) {
  const headers = new Headers();
  if (token) headers.set("Authorization", `Bearer ${token}`);
  if (body !== undefined) headers.set("Content-Type", "application/json");

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const text = await response.text();
  let payload;
  try {
    payload = text ? JSON.parse(text) : null;
  } catch {
    payload = text;
  }

  if (!response.ok) {
    const message = typeof payload === "object" && payload?.message ? payload.message : text || response.statusText;
    throw new Error(`${response.status} ${message}`);
  }
  if (raw) return payload;
  if (payload && typeof payload === "object" && "success" in payload) {
    if (payload.success === false) throw new Error(payload.message || "success=false");
    return payload.data;
  }
  return payload;
}

async function check(label, fn) {
  try {
    const detail = await fn();
    log("PASS", label, detail);
  } catch (error) {
    failures += 1;
    log("FAIL", label, error instanceof Error ? error.message : String(error));
  }
}

async function login(email, password) {
  return request("/api/v1/auth/login", {
    method: "POST",
    body: { email, password },
  });
}

await check("backend OpenAPI reachable", async () => {
  const spec = await request("/v3/api-docs", { raw: true });
  const paths = spec?.paths || {};
  const missing = requiredOpenApiPaths.filter((path) => !(path in paths));
  if (missing.length > 0) throw new Error(`missing paths: ${missing.join(", ")}`);
  return `${Object.keys(paths).length} paths`;
});

for (const role of roles) {
  const email = process.env[role.emailEnv];
  const password = process.env[role.passwordEnv];
  if (!email || !password) {
    skipped += 1;
    log("SKIP", `${role.key} role smoke`, `set ${role.emailEnv} and ${role.passwordEnv}`);
    continue;
  }

  let auth;
  await check(`${role.key} login`, async () => {
    auth = await login(email, password);
    if (!auth?.token) throw new Error("login did not return token");
    if (auth.role !== role.expectedRole) throw new Error(`expected ${role.expectedRole}, got ${auth.role}`);
    return auth.email || email;
  });
  if (!auth?.token) continue;

  await check(`${role.key} current user`, async () => {
    const me = await request("/api/v1/auth/me", { token: auth.token });
    if (me?.role !== role.expectedRole) throw new Error(`expected ${role.expectedRole}, got ${me?.role}`);
    return me.email || me.username || "ok";
  });

  for (const [label, method, path, options = {}] of role.checks) {
    await check(`${role.key}: ${label}`, async () => {
      const data = await request(path, { method, token: auth.token, ...options });
      if (Array.isArray(data)) return `${data.length} rows`;
      if (data && typeof data === "object") return "object";
      return "ok";
    });
  }

  await check(`${role.key} logout`, async () => {
    await request("/api/v1/auth/logout", { method: "POST", token: auth.token });
    return "ok";
  });
}

if (failures > 0) {
  console.error(`\nPhase 8 smoke failed: ${failures} failure(s), ${skipped} role(s) skipped.`);
  process.exit(1);
}

console.log(`\nPhase 8 smoke completed: ${skipped} role(s) skipped.`);
