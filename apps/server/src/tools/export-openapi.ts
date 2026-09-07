import "../load-env"

import { writeFileSync } from "node:fs"
import { NestFactory } from "@nestjs/core"
import { AppModule } from "../app.module"
import { AppConfigService } from "../config/app-config.service"
import { createOpenApiDocument } from "../core/openapi/openapi.options"

/**
 * Exports the OpenAPI document without starting the HTTP server or touching
 * the database. Runs from the compiled bundle so the generated spec matches
 * production exactly (including CLI-plugin-introspected DTO schemas).
 *
 * Usage: pnpm openapi:export [openapi.json]
 */
async function main(): Promise<void> {
  const app = await NestFactory.create(AppModule, { logger: false })
  const { config } = app.get(AppConfigService)
  const document = createOpenApiDocument(app, config)

  const outPath = process.argv[2] ?? "openapi.json"
  writeFileSync(outPath, `${JSON.stringify(document, null, 2)}\n`)
  await app.close()

  const operations = Object.values(document.paths).flatMap((p) => Object.keys(p)).length
  console.log(
    `OpenAPI ${document.openapi} spec written to ${outPath} (${Object.keys(document.paths).length} paths, ${operations} operations)`,
  )
}

main().catch((err) => {
  // Avoid process.exit(): pending writes to piped stderr would be truncated.
  console.error(err)
  process.exitCode = 1
})
