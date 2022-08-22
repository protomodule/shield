import fs from "fs/promises"
import path from "path"
import ora from "ora"
import { Report, report, Vulnerability } from "../report"
import { Auditor } from "./auditor"
import { exec, ExecResult, NORESULT } from "../../utils/exec"
import jsonata from "jsonata"
import { byPriority, priority } from "../../utils/severity"

const installedVersion = async (cwd: string, packageName: string): Promise<string | undefined> => {
  try {
    const filehandle = await fs.open(`${path.join(cwd, "package-lock.json")}`)
    const lock = JSON.parse(await filehandle.readFile("utf8"))
    await filehandle.close()

    return jsonata(`packages.\`node_modules/${packageName}\`.version`).evaluate(lock)
  }
  catch { /* Do nothing - return undefined */}
}

const interpretAudit = async (stdout: string, cwd: string): Promise<Report> => {
  const vulnerabilities = await Promise.all(
    Object.values(JSON.parse(stdout).vulnerabilities)
      // Filter out indirect vulnerabilities
      .filter((vulnerability: any) => !!jsonata(`via[name='${vulnerability.name}']`).evaluate(vulnerability))
      .map((advisory: any) => ({
        ...advisory,
        priority: priority(jsonata("severity").evaluate(advisory))
      }))
      .sort(byPriority)
      .map(async (vulnerability: any): Promise<Vulnerability> => {
        return {
          identifier: [...new Set([jsonata("via.url").evaluate(vulnerability)].flat().map(url => url.split("/").pop()))].join(", "),
          module_name: jsonata("name").evaluate(vulnerability),
          // version: (await exec(`npm view ${jsonata("name").evaluate(vulnerability)} version`, { cwd })).stdout.trim(),
          version: await installedVersion(cwd, jsonata("name").evaluate(vulnerability)) || "",
          severity: jsonata("severity").evaluate(vulnerability),
          title: [...new Set([jsonata("via.title").evaluate(vulnerability)].flat())].join(", "),

          path: [...new Set([jsonata("nodes").evaluate(vulnerability)].flat())].join(", "),
          url: [...new Set([jsonata("via.url").evaluate(vulnerability)].flat())].join(", "),

          vulnerable_versions: jsonata("range").evaluate(vulnerability),
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

export const npm = (cwd: string) => {
  const auditor = <Auditor> async function () {
    const spinner = ora(`  Performing ${auditor.identifier} audit`).start()
    try {
      const result = await exec("npm", [ "audit", "--json" ], { cwd })
      spinner.succeed("  Audit successful")
      return interpretAudit(result.stdout?.join() || NORESULT, cwd)
    }
    catch (err: any) {
      const error = err as ExecResult
      if (error.stderr?.length) {
        spinner.fail("  An error occured during audit")
        throw new Error(error.stderr?.join())
      }
      spinner.succeed("  Audit finished")
      return interpretAudit(error.stdout?.join() || NORESULT, cwd)
    }
  }

  auditor.check = async () => {
    try {
      (await fs.open(`${path.join(cwd, "package-lock.json")}`)).close()
      return true
    }
    catch { /* Do nothing - return false */}
    return false
  }
  auditor.identifier = "npm"
  return auditor
}
