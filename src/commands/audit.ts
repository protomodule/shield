import __ from "lodash"
import { Command } from "commander"
import { log, debug } from "../utils/log"
import fs from "fs/promises"
import path from "path"
import { executor } from "../services/executor"
import { yarn } from "../services/auditors/yarn"
import { table } from "../services/printers/table"
import { npm } from "../services/auditors/npm"
import { exitCode } from "../services/report"

export const audit = (program: Command) => {
  program
    .command("audit")
    .requiredOption("-p, --path <path to source code>")
    .option("-a, --auditor <name of auditor> ")
    .option("-e, --exit", "End process with exit matching highest detected severity")
    .action(async (args) => {
      const exec = executor(args.path)
      exec.register(yarn)
      exec.register(npm)
      const reports = await exec(args.auditor)

      reports.forEach(report => {
        log(__.capitalize(report.auditor))
        table(report)
      })

      if (args.exit) process.exit(exitCode(reports))
    })
}