// Load .env so DATABASE_* / NEXT_PUBLIC_* are available at runtime.
// Native to Node >= 20.6 — no dotenv dependency needed.
try {
  if (typeof process.loadEnvFile === "function") {
    process.loadEnvFile(); // loads ./.env if present; throws if missing
  }
} catch {
  // .env not present — rely on environment vars set by the host (cPanel).
}

const { createServer } = require("http");
const next = require("next");

const port = parseInt(process.env.PORT, 10) || 3000;
const hostname = "0.0.0.0";

const app = next({
  dev: false,
  hostname,
  port,
});

const handle = app.getRequestHandler();

app.prepare().then(() => {
  createServer((req, res) => {
    handle(req, res);
  }).listen(port, hostname, () => {
    console.log(`Ready on http://${hostname}:${port}`);
  });
});