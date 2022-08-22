import { Report } from "../report"
import Table from "cli-table"
import { log } from "../../utils/log"
import { icon } from "../../utils/severity"

export const table = async (report: Report) => {
  if (!report.vulnerabilities.length) {
    log("No vulnerabilities found")
    return
  }

  const printTable = new Table({
    head: [ "", "Severity", "Module", "Installed", "Affected", "Fixed", "Vulnerability", "CVE" ]
  })

  report.vulnerabilities.forEach(vulnerability => printTable.push([
    icon(vulnerability.severity),
    vulnerability.severity,
    vulnerability.module_name,
    vulnerability.version,
    vulnerability.vulnerable_versions || "",
    vulnerability.patched_versions || "",
    vulnerability.title,
    vulnerability.identifier
  ]))

  log(printTable.toString())
}
