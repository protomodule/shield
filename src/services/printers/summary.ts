import { Report } from "../report"
import Table from "cli-table"
import __ from "lodash"
import { error, out } from "../../utils/log"
import { color, icon } from "../../utils/severity"
import { Printer } from "./printer"

export const summary = <Printer> async function (report: Report): Promise<void> {
  if (!report.vulnerabilities.length) {
    out("No vulnerabilities found\n\n")
    return
  }

  const counter = report.vulnerabilities.reduce((acc, vulnerability) => {
    if (!acc[vulnerability.severity]) acc[vulnerability.severity] = 0
    acc[vulnerability.severity] = acc[vulnerability.severity] + 1
    return acc
  }, {} as { [key: string]: number })

  const printTable = new Table({
    head: Object.keys(counter).map(title => `${icon(title)} ${__.capitalize(title)}`),
    colAligns: Object.keys(counter).map(_ => `middle`),
    style: { head: ["red"] }
  })
  printTable.push(Object.values(counter))

  error(printTable.toString())
  error("\n")
}

summary.identifier = "summary"
