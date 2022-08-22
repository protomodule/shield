#!/usr/bin/env node --es-module-specifier-resolution=node 

import boxen from "boxen"
import chalk from "chalk"
import { program } from "commander"
import { audit } from "./commands/audit"
import { scan } from "./commands/scan"
import { log } from "./utils/log"
import { version } from "./utils/version"

process.stdout.write(Buffer.from(`\n\n< / >            ${chalk.blue.bold("P R O T O S H I E L D")}           v${await version()}\n`));
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
