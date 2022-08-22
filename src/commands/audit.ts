import __ from "lodash"
import { Command } from "commander"
import { log } from "../utils/log"
import { executor } from "../services/executor"
import { yarn } from "../services/auditors/yarn"
import { table } from "../services/printers/table"
import { npm } from "../services/auditors/npm"
import { exitCode } from "../services/report"
import { filterSeverity } from "../utils/severity"

export const audit = (program: Command) => {
  program
    .command("audit")
    .requiredOption("-p, --path <path to source code>", "Path to JavaScript project", ".")
    .option("-a, --auditor <name of auditor> ")
    .option("-e, --exit", "End process with exit matching highest detected severity")
    .option("-s, --severity <severity>", "Specify minimum severity to include in report")
    .action(async (args) => {
      const exec = executor(args.path)
      exec.register(yarn)
      exec.register(npm)
      const reports = filterSeverity(await exec(args.auditor), args.severity)

      log(`📄  Found ${reports.length} report(s)\n\n`)
      reports.forEach(report => {
        log(__.capitalize(report.auditor))
        table(report)
      })

      if (args.exit) process.exit(exitCode(reports))
    })
}