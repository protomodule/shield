import __ from "lodash"
import { Command } from "commander"
import { log } from "../utils/log"
import { executor } from "../services/executor"
import { snyk } from "../services/auditors/snyk"
import { trivy } from "../services/auditors/trivy"
import { table } from "../services/printers/table"
import { exitCode } from "../services/report"
import { filterSeverity } from "../utils/severity"

export const scan = (program: Command) => {
  program
    .command("scan")
    .requiredOption("-i, --image <docker image>")
    .option("-a, --auditor <name of auditor> ")
    .option("-e, --exit", "End process with exit matching highest detected severity")
    .option("-s, --severity <severity>", "Specify minimum severity to include in report")
    .action(async (args) => {
      const exec = executor(args.image)
      exec.register(trivy)
      exec.register(snyk)
      const reports = filterSeverity(await exec(args.auditor), args.severity)

      reports.forEach(report => {
        log(__.capitalize(report.auditor))
        table(report)
      })

      if (args.exit) process.exit(exitCode(reports))
    })
}