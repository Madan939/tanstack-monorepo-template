import { config } from "dotenv"

/**
 * Loads .env into process.env before anything else runs, so that module
 * decorators and logger factories can safely read configuration. Shell
 * environment variables always take precedence over file values.
 *
 * Import this as the FIRST import of every entrypoint (main.ts, tests).
 */
config()
