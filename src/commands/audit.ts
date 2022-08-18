import __ from "lodash"
import { Command } from "commander"
import { log, debug } from "../utils/log"
import fs from "fs/promises"
import path from "path"
import { executor } from "../services/executor"
import { yarn } from "../services/auditors/yarn"
import { table } from "../services/printers/table"

export const audit = (program: Command) => {
  program
    .command("audit")
    .requiredOption("-p, --path <path to source code>")
    .option("-a, --auditor <name of auditor> ")
    .action(async (args) => {
      const exec = executor(args.path)
      exec.register(yarn)
      const reports = await exec(args.auditor)

      reports.forEach(report => {
        log(__.capitalize(report.auditor))
        table(report)
      })
    })
}