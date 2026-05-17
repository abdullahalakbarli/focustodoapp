import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const envPaths = [
  path.resolve(process.cwd(), ".env"),
  path.resolve(process.cwd(), "../../.env"),
  path.resolve(__dirname, "../../.env"),
];

for (const envPath of envPaths) {
  dotenv.config({ path: envPath, override: false });
}

const required = [
  "SUPABASE_URL",
  "SUPABASE_SERVICE_ROLE_KEY",
  "DATABASE_URL",
];

const missing = required.filter((key) => !process.env[key]?.trim());

if (missing.length > 0) {
  console.error(`[config] Missing required environment variables: ${missing.join(", ")}`);
  console.error("[config] Copy services/api/.env.example to services/api/.env (or use project root .env).");
  process.exit(1);
}

if (!process.env.ADMIN_CODE?.trim()) {
  console.warn("[config] ADMIN_CODE is not set. POST /admin/elevate will be disabled.");
}
