import __ from "lodash"
import { Command } from "commander"
import { log, debug } from "../utils/log"
import { executor } from "../services/executor"
import { snyk } from "../services/auditors/snyk"
import { table } from "../services/printers/table"
import { exitCode } from "../services/report"

export const scan = (program: Command) => {
  program
    .command("scan")
    .requiredOption("-i, --image <docker image>")
    .option("-e, --exit", "End process with exit matching highes detected severity")
    .action(async (args) => {
      const exec = executor(args.image)
      exec.register(snyk)
      const reports = await exec("snyk")

      reports.forEach(report => {
        log(__.capitalize(report.auditor))
        table(report)
      })

      if (args.exit) process.exit(exitCode(reports))
    })
}