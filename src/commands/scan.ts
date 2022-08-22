import __ from "lodash"
import { Command } from "commander"
import { log } from "../utils/log"
import { executor } from "../services/executor"
import { snyk } from "../services/auditors/snyk"
import { trivy } from "../services/auditors/trivy"
import { exitCode } from "../services/report"
import { filterSeverity } from "../utils/severity"
import chalk from "chalk"
import { GenericPrinter } from "../services/printers/printer"

export const scan = (program: Command, print: GenericPrinter) => {
  program
    .command("scan")
    .requiredOption("-i, --image <docker image>")
    .option("-a, --auditor <name of auditor> ")
    .option("-e, --exit", "End process with exit matching highest detected severity")
    .option("-s, --severity <severity>", "Specify minimum severity to include in report")
    .option("-o, --output <format>", "Specify format of output (table, json is supported)")
    .action(async (args) => {
      const exec = executor(args.image)
      exec.register(trivy)
      exec.register(snyk)
      const reports = filterSeverity(await exec(args.auditor), args.severity)

      reports.forEach(report => {
        log(chalk.bgBlue.white.bold(`   ${__.capitalize(report.auditor)}   `))
        print(report, args.output)
      })

      if (args.exit) process.exit(exitCode(reports))
    })
}