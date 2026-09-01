try {
  if (typeof process.loadEnvFile === "function") {
    process.loadEnvFile();
  }
} catch (error) {
  console.error("Could not load .env:", error);
}

const { createServer } = require("http");
const next = require("next");

const port = parseInt(process.env.PORT || "3000", 10);

console.log("Database:", process.env.DATABASE_NAME);
console.log("Database user:", process.env.DATABASE_USER);
console.log("Database password:", process.env.DATABASE_PASSWORD ? "SET" : "NOT SET");

const app = next({
  dev: false,
  hostname: "0.0.0.0",
});

const handle = app.getRequestHandler();

app.prepare().then(() => {
  createServer((req, res) => {
    handle(req, res);
  }).listen(port, "0.0.0.0", () => {
    console.log(`Ready on port ${port}`);
  });
});