import fs from "fs/promises"
import path from "path"
import { Report, report, Vulnerability } from "../report"
import { Auditor } from "./auditor"
import { exec } from "../../utils/exec"
import { debug } from "../../utils/log"
import jsonata from "jsonata"
import { byPriority, priority } from "../../utils/severity"
import dayjs from "dayjs"

const interpretAudit = async (stdout: string): Promise<Report> => {
  const result = JSON.parse(stdout)
  const error = jsonata("error").evaluate(result)

  if (error) throw new Error(error)

  const vulnerabilities = await Promise.all(
    (jsonata("vulnerabilities").evaluate(result) || [])
      .map((vulnerability: any) => ({
        ...vulnerability,
        priority: priority(jsonata("severity").evaluate(vulnerability))
      }))
      .sort(byPriority)
      .map(async (vulnerability: any): Promise<Vulnerability> => {
        const created = jsonata("disclosureTime").evaluate(vulnerability)
        return {
          module_name: jsonata("packageName").evaluate(vulnerability),
          version: jsonata("version").evaluate(vulnerability),
          severity: jsonata("severity").evaluate(vulnerability),
          title: jsonata("title").evaluate(vulnerability),

          path: [...new Set([jsonata("name").evaluate(vulnerability)].flat())].join(", "),
          url: jsonata("references[0].url").evaluate(vulnerability),
          description: jsonata("description").evaluate(vulnerability),
          created: created ? dayjs(created) : undefined,

          vulnerable_versions: [...new Set([jsonata("semver.vulnerable").evaluate(vulnerability)].flat())].join(", "),
        }
      })
  )

  const template = report()
  return {
    ...template,
    vulnerabilities: [
      ...template.vulnerabilities,
      ...vulnerabilities
    ]
  }
}

export const snyk = (image: string) => {
  const auditor = <Auditor> async function () {
    try {
      const result = await exec(`docker scan --json --group-issues ${image}`)
      return interpretAudit(result.stdout)
    }
    catch (err: any) {
      if (`${err.stderr}`.length) throw new Error(err.stderr)
      return interpretAudit(err.stdout)
    }
  }

  auditor.check = async () => {
    return false
  }
  auditor.identifier = "snyk"
  return auditor
}
