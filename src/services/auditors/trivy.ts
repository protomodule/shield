import fs from "fs/promises"
import path, { parse } from "path"
import { Report, report, Vulnerability } from "../report"
import { Auditor } from "./auditor"
import { ExecResult, exec, NORESULT, stream } from "../../utils/exec"
import { debug, log } from "../../utils/log"
import jsonata from "jsonata"
import { byPriority, priority } from "../../utils/severity"
import dayjs from "dayjs"
import JSONStream from "JSONStream"
import { pipeline } from "stream/promises"

const interpret = async (vulnerabilities: any): Promise<Report> => {
  debug(vulnerabilities)
  const interpreted = await Promise.all(
    vulnerabilities
      .map((vulnerability: any) => ({
        ...vulnerability,
        priority: priority(`${jsonata("Severity").evaluate(vulnerability)}`.toLowerCase())
      }))
      .sort(byPriority)
      .map(async (vulnerability: any): Promise<Vulnerability> => {
        const created = jsonata("PublishedDate").evaluate(vulnerability)
        return {
          identifier: jsonata("VulnerabilityID").evaluate(vulnerability),
          module_name: jsonata("PkgName").evaluate(vulnerability),
          version: jsonata("InstalledVersion").evaluate(vulnerability),
          severity: `${jsonata("Severity").evaluate(vulnerability)}`.toLowerCase(),
          title: jsonata("Title").evaluate(vulnerability),

          // path: [...new Set([jsonata("name").evaluate(vulnerability)].flat())].join(", "),
          url: jsonata("References[0]").evaluate(vulnerability),
          description: jsonata("Description").evaluate(vulnerability),
          created: created ? dayjs(created) : undefined,

          vulnerable_versions: [...new Set([jsonata("InstalledVersion").evaluate(vulnerability)].flat())].join(", "),
          patched_versions: [...new Set([jsonata("FixedVersion").evaluate(vulnerability)].flat())].join(", ")
        }
      })
  )

  const template = report()
  return {
    ...template,
    vulnerabilities: [
      ...template.vulnerabilities,
      ...interpreted
    ]
  }
}

const interpretAudit = async (stdout: string): Promise<Report> => {
  const result = JSON.parse(stdout)

  // const error = jsonata("error").evaluate(result)
  // if (error) throw new Error(error)

  const vulnerabilities = await Promise.all(
    (jsonata("Results.Vulnerabilities").evaluate(result) || [])
      .map((vulnerability: any) => ({
        ...vulnerability,
        priority: priority(`${jsonata("Severity").evaluate(vulnerability)}`.toLowerCase())
      }))
      .sort(byPriority)
      .map(async (vulnerability: any): Promise<Vulnerability> => {
        const created = jsonata("PublishedDate").evaluate(vulnerability)
        return {
          identifier: jsonata("VulnerabilityID").evaluate(vulnerability),
          module_name: jsonata("PkgName").evaluate(vulnerability),
          version: jsonata("InstalledVersion").evaluate(vulnerability),
          severity: `${jsonata("Severity").evaluate(vulnerability)}`.toLowerCase(),
          title: jsonata("Title").evaluate(vulnerability),

          // path: [...new Set([jsonata("name").evaluate(vulnerability)].flat())].join(", "),
          url: jsonata("References[0]").evaluate(vulnerability),
          description: jsonata("Description").evaluate(vulnerability),
          created: created ? dayjs(created) : undefined,

          vulnerable_versions: [...new Set([jsonata("InstalledVersion").evaluate(vulnerability)].flat())].join(", "),
          patched_versions: [...new Set([jsonata("FixedVersion").evaluate(vulnerability)].flat())].join(", ")
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

export const trivy = (image: string) => {
  const auditor = <Auditor> async function () {
    try {
      const parser = JSONStream.parse("Results.*.Vulnerabilities")
      const result = await stream("docker", ["run", "--rm", "-v", "trivy-cache:/root/.cache/", "aquasec/trivy:latest", "image", "--format", "json", "--security-checks", "vuln", `${image}`])
      
      const vulnerabilities = await new Promise((resolve, reject) => {
        parser.on("data", resolve)
        parser.on("error", reject)
        result.pipe(parser)
      })

      return interpret(vulnerabilities)
      // return interpretAudit(result.stdout?.join() || NORESULT)
    }
    catch (err) {
      const error = err as ExecResult
      if (error.stderr?.length) throw new Error(error.stderr?.join())
      return interpretAudit(error.stderr?.join() || NORESULT)
    }
  }

  auditor.check = async () => {
    return true
  }
  auditor.identifier = "trivy"
  return auditor
}
