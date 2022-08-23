import __ from "lodash"
import { Command } from "commander"
import { log } from "../utils/log"
import { executor } from "../services/executor"
import { yarn } from "../services/auditors/yarn"
import { npm } from "../services/auditors/npm"
import { exitCode } from "../services/report"
import { filterSeverity } from "../utils/severity"
import chalk from "chalk"
import { GenericPrinter } from "../services/printers/printer"

export const audit = (program: Command, print: GenericPrinter) => {
  program
    .command("audit")
    .requiredOption("-p, --path <path to source code>", "Path to JavaScript project", ".")
    .option("-a, --auditor <name of auditor> ")
    .option("-e, --exit", "End process with exit matching highest detected severity")
    .option("-s, --severity <severity>", "Specify minimum severity to include in report")
    .option("-o, --output <format>", "Specify format of output (table, json, html is supported)")
    .action(async (args) => {
      const exec = executor(args.path)
      exec.register(yarn)
      exec.register(npm)
      const reports = filterSeverity(await exec(args.auditor), args.severity)

      log(`📄  Found ${reports.length} report(s)\n\n`)
      reports.forEach(report => {
        log(chalk.bgBlue.white.bold(`   ${__.capitalize(report.auditor)}   `))
        print(report, args.output)
      })

      if (args.exit) process.exit(exitCode(reports))
    })
}