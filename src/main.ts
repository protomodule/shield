#!/usr/bin/env node

import boxen from "boxen"
import { CommanderError, program } from "commander"
import { audit } from "./commands/audit"
import { scan } from "./commands/scan"
import { debug, log } from "./utils/log"

process.stdout.write(Buffer.from(`\n\n< / >            P R O T O S H I E L D           v${process.env.npm_package_version}\n`));
process.stdout.write(Buffer.from(`         https://github.com/protomodule/shield\n\n\n`));

program.version(process.env.npm_package_version || "unknown")
process.on('uncaughtException', err => {
  log(boxen(err.message, {
    title: err.name,
    float: "center",
    textAlignment: "center",
    borderStyle: "round",
    borderColor: "red",
    padding: 1,
  }))
  process.exit(1)
})

audit(program)
scan(program)

program.parse(process.argv)
