import { Report, Summary, Vulnerability } from "../report"
import Table from "cli-table"
import { out } from "../../utils/log"
import { icon } from "../../utils/severity"
import { Printer } from "./printer"

type JSONReport = {
  auditor: string
  vulnerabilities: Vulnerability[]
}

type JSONOutput = {
  msg?: string
  auditor?: string
  vulnerabilities?: Vulnerability[]
  summary?: Summary
}

const print = (output: JSONOutput) => {
  out(JSON.stringify(output))
}

export const json = <Printer> async function (report: Report): Promise<void> {
  if (!report.vulnerabilities.length) {
    return print({ msg: "No vulnerabilities found", auditor: report.auditor })
  }

  print(report)
}

json.identifier = "json"
