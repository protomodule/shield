#! /usr/bin/env ./node_modules/.bin/ts-node

import { program } from "commander"
import { audit } from "./commands/audit"

process.stdout.write(Buffer.from(`\n\n< / >            P R O T O S H I E L D           v${process.env.npm_package_version}\n`));
process.stdout.write(Buffer.from(`         https://github.com/protomodule/probe\n\n\n`));

program.version(process.env.npm_package_version || "unknown")

audit(program)

program.parse(process.argv)
