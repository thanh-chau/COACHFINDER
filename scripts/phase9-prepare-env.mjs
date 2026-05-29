const API_BASE_URL = process.env.COACHFINDER_API_URL || process.env.VITE_API_URL || "http://localhost:8080";
const DEFAULT_PASSWORD = process.env.COACHFINDER_TEST_PASSWORD || "Coachfinder123!";

const accounts = [
  {
    key: "learner",
    role: "TRAINEES",
    emailEnv: "COACHFINDER_LEARNER_EMAIL",
    passwordEnv: "COACHFINDER_LEARNER_PASSWORD",
    defaultEmail: "phase9.learner@example.test",
    username: "phase9_learner",
    fullName: "Phase 9 Learner",
  },
  {
    key: "coach",
    role: "COACHES",
    emailEnv: "COACHFINDER_COACH_EMAIL",
    passwordEnv: "COACHFINDER_COACH_PASSWORD",
    defaultEmail: "phase9.coach@example.test",
    username: "phase9_coach",
    fullName: "Phase 9 Coach",
  },
];

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
    const error = new Error(`${response.status} ${message}`);
    error.status = response.status;
    error.payload = payload;
    throw error;
  }
  if (raw) return payload;
  if (payload && typeof payload === "object" && "success" in payload) {
    if (payload.success === false) throw new Error(payload.message || "success=false");
    return payload.data;
  }
  return payload;
}

async function login(email, password) {
  return request("/api/v1/auth/login", {
    method: "POST",
    body: { email, password },
  });
}

async function registerOrLogin(account) {
  const email = process.env[account.emailEnv] || account.defaultEmail;
  const password = process.env[account.passwordEnv] || DEFAULT_PASSWORD;

  try {
    const auth = await request("/api/v1/auth/register", {
      method: "POST",
      body: {
        username: account.username,
        fullName: account.fullName,
        email,
        phone: "",
        password,
        role: account.role,
      },
    });
    return { email, password, auth, action: "registered" };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (!message.toLowerCase().includes("already")) {
      throw error;
    }
    const auth = await login(email, password);
    return { email, password, auth, action: "existing" };
  }
}

console.log(`Phase 9 prepare using ${API_BASE_URL}`);

try {
  const spec = await request("/v3/api-docs", { raw: true });
  log("PASS", "backend OpenAPI reachable", `${Object.keys(spec?.paths || {}).length} paths`);
} catch (error) {
  log("FAIL", "backend OpenAPI reachable", error instanceof Error ? error.message : String(error));
  console.error("\nStart the backend first, or set COACHFINDER_API_URL to the running backend URL.");
  process.exit(1);
}

const prepared = [];
for (const account of accounts) {
  try {
    const result = await registerOrLogin(account);
    if (result.auth?.role !== account.role) {
      throw new Error(`expected role ${account.role}, got ${result.auth?.role}`);
    }
    const me = await request("/api/v1/auth/me", { token: result.auth.token });
    if (me?.role !== account.role) {
      throw new Error(`/me expected role ${account.role}, got ${me?.role}`);
    }
    prepared.push({ account, ...result });
    log("PASS", `${account.key} disposable account`, `${result.action}: ${result.email}`);
  } catch (error) {
    log("FAIL", `${account.key} disposable account`, error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  }
}

const adminEmail = process.env.COACHFINDER_ADMIN_EMAIL;
const adminPassword = process.env.COACHFINDER_ADMIN_PASSWORD;
if (!adminEmail || !adminPassword) {
  log("SKIP", "admin account", "backend blocks public ADMIN registration; set COACHFINDER_ADMIN_EMAIL and COACHFINDER_ADMIN_PASSWORD");
} else {
  try {
    const auth = await login(adminEmail, adminPassword);
    if (auth?.role !== "ADMIN") throw new Error(`expected ADMIN, got ${auth?.role}`);
    await request("/api/v1/auth/me", { token: auth.token });
    log("PASS", "admin account", adminEmail);
  } catch (error) {
    log("FAIL", "admin account", error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  }
}

console.log("\nPowerShell env for smoke:");
console.log(`$env:COACHFINDER_API_URL="${API_BASE_URL}"`);
for (const result of prepared) {
  console.log(`$env:${result.account.emailEnv}="${result.email}"`);
  console.log(`$env:${result.account.passwordEnv}="${result.password}"`);
}
console.log('$env:COACHFINDER_ADMIN_EMAIL="<existing-admin-email>"');
console.log('$env:COACHFINDER_ADMIN_PASSWORD="<existing-admin-password>"');
console.log("npm run smoke:phase8");
