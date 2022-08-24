import ejs from "ejs"
import path from "path"
import fs from "fs/promises"
import __ from "lodash"
import { Report, Vulnerability } from "../report"
import { out } from "../../utils/log"
import { color, icon } from "../../utils/severity"
import { Printer } from "./printer"
import dayjs from "dayjs"

export const html = <Printer> async function (report: Report): Promise<void> {
  const template = await fs.readFile(`${path.join(path.resolve(), "/resources/vulnerabilities.html")}`)
  out(ejs.render(template.toString(), {
    report,
    createdAt: dayjs().format("DD.MM.YYYY"),
    severities: report.vulnerabilities.reduce((acc, vulnerability) => {
      if (!acc[vulnerability.severity]) acc[vulnerability.severity] = {
        title: __.capitalize(vulnerability.severity),
        color: color(vulnerability.severity),
        icon: icon(vulnerability.severity),
        vulnerabilities: []
      }
      acc[vulnerability.severity].vulnerabilities.push(vulnerability)
      return acc
    }, {} as { [key: string]: { title: string, color: string, icon: string, vulnerabilities: Vulnerability[] } })
  }))
}

html.identifier = "html"
