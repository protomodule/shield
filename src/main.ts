#!/usr/bin/env node --es-module-specifier-resolution=node 

import boxen from "boxen"
import chalk from "chalk"
import { program } from "commander"
import { audit } from "./commands/audit"
import { scan } from "./commands/scan"
import { json } from "./services/printers/json"
import { table } from "./services/printers/table"
import { printer } from "./services/printers/printer"
import { log } from "./utils/log"
import { version } from "./utils/version"
import { html } from "./services/printers/html"

process.stderr.write(Buffer.from(`\n\n< / >            ${chalk.blue.bold("P R O T O S H I E L D")}           v${await version()}\n`));
process.stderr.write(Buffer.from(`         https://github.com/protomodule/shield\n\n\n`));

const print = printer()
print.register(table)
print.register(json)
print.register(html)

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

audit(program, print)
scan(program, print)

program.parse(process.argv)
