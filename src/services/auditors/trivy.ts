import { Report, report, Vulnerability } from "../report"
import { Auditor } from "./auditor"
import { stream } from "../../utils/exec"
import jsonata from "jsonata"
import { byPriority, priority } from "../../utils/severity"
import dayjs from "dayjs"
import JSONStream from "JSONStream"
import ora from "ora"

const interpret = async (vulnerabilities: any): Promise<Report> => {
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

export const trivy = (image: string) => {
  const auditor = <Auditor> async function () {
    const spinner = ora(`  Performing ${auditor.identifier} audit`).start()
    try {
      const parser = JSONStream.parse("Results.*.Vulnerabilities")
      const result = await stream("docker", ["run", "--rm", "-v", "trivy-cache:/root/.cache/", "aquasec/trivy:latest", "image", "--format", "json", "--security-checks", "vuln", `${image}`])
      
      const vulnerabilities = await new Promise((resolve, reject) => {
        parser.on("data", resolve)
        parser.on("error", reject)
        result.pipe(parser)
      })

      spinner.succeed("  Audit successful")
      return interpret(vulnerabilities)
    }
    catch (err) {
      spinner.fail("  An error occured during audit")
      throw err
    }
  }

  auditor.check = async () => {
    return true
  }
  auditor.identifier = "trivy"
  return auditor
}
