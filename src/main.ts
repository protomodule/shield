#! /usr/bin/env ./node_modules/.bin/ts-node

import { program } from "commander"

program.version(process.env.npm_package_version || "unknown")

program.parse(process.argv)
