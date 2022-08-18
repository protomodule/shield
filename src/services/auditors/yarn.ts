import __ from "lodash"
import fs from "fs/promises"
import { Auditor } from "./auditor"
import { Report, report } from "../report"
import jsonata from "jsonata"
import dayjs from "dayjs"
import path from "path"
import { priority } from "../../utils/severity"
import { exec } from "../../utils/exec"

const interpretAudit = (stdout: string): Report => {
  return __.uniqBy(
      stdout.split("\n")
        .filter(line => `${line}`.length)
        .map(line => JSON.parse(line))
        .map(advisory => ({
          ...advisory,
          priority: priority(jsonata("data.advisory.severity").evaluate(advisory))
        }))
        .sort(function(a, b) {
          return (a.priority > b.priority) ? -1 : (a.priority < b.priority) ? 1 : 0
        }),
      "data.advisory.id"
    )
    .reduce((acc: Report, output): Report => {
      switch (output.type) {
        case "auditAdvisory":
          const created = jsonata("data.advisory.created").evaluate(output)
          return {
            ...acc,
            vulnerabilities: [
              ...acc.vulnerabilities,
              {
                module_name: jsonata("data.advisory.module_name").evaluate(output),
                version: [...new Set([jsonata("data.advisory.findings.version").evaluate(output)].flat())].join(", "),
                severity: jsonata("data.advisory.severity").evaluate(output),
                title: jsonata("data.advisory.title").evaluate(output),
                path: jsonata("data.resolution.path").evaluate(output),
                url: jsonata("data.advisory.url").evaluate(output),
                description: jsonata("data.advisory.overview").evaluate(output),
                recommendation: jsonata("data.advisory.recommendation").evaluate(output),
                created: created ? dayjs(created) : undefined,
                vulnerable_versions: jsonata("data.advisory.vulnerable_versions").evaluate(output),
                patched_versions: jsonata("data.advisory.patched_versions").evaluate(output),
              }
            ]
          }
        default:
          return acc
      }
    }, report())
}

export const yarn = (cwd: string) => {
  const auditor = <Auditor> async function () {
    try {
      const result = await exec("yarn audit --json", { cwd })
      return interpretAudit(result.stdout)
    }
    catch (err: any) {
      return interpretAudit(err.stdout)
    }
  }

  auditor.check = async () => {
    try {
      (await fs.open(`${path.join(cwd, "yarn.lock")}`)).close()
      return true
    }
    catch { /* Do nothing - return false */}
    return false
  }
  auditor.identifier = "yarn"
  return auditor
}
