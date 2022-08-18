import { Command } from "commander"
import { log, debug } from "../utils/log"
import fs from "fs/promises"
import path from "path"
import { executor } from "../services/executor"
import { yarn } from "../services/auditors/yarn"

export const audit = (program: Command) => {
  program
    .command("audit")
    .requiredOption("-p, --path <path to source code>")
    .option("-a, --auditor <name of auditor> ")
    .action(async (args) => {
      const exec = executor(args.path)
      exec.register(yarn)
      exec(args.auditor)
    })
}