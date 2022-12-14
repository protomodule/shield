import { cwd } from "process"
import { debug, log } from "../utils/log"
import { Auditor } from "./auditors/auditor"
import { Report, summary } from "./report"

type AuditorInitializer = (cwd: string) => Auditor

interface ExecutorFunction {
  (auditor?: string): Promise<Report[]>
  register: (initializer: AuditorInitializer) => void
}

const summarizeReport = (auditor: string, report: Report): Report => {
  log(`🏁  Summarizing report for ${auditor}`)
  return {
    ...report,
    auditor,
    summary: {
      ...report.summary,
      count: {
        ...report.summary.count,
        ...report.vulnerabilities.reduce((count, vulnerability) => {
          return {
            ...count,
            [vulnerability.severity]: ((count as any)[vulnerability.severity] || 0) + 1
          }
        }, summary().count)
      }
    }
  }
}

export const executor = (path: string = cwd()) => {
  var auditors: { [key: string]: Auditor } = {}
  const executor = <ExecutorFunction> async function (auditor?: string): Promise<Report[]> {
    // Use auditor given as CLI argument
    if (auditor && auditors[auditor]) {
      log(`📌  Auditor has been pinned to ${auditor}`)
      return [summarizeReport(auditor, await auditors[auditor]())]
    }

    // Select auditor automatically
    for (auditor in auditors) {
      if (await auditors[auditor].check()) {
        return [summarizeReport(auditor, await auditors[auditor]())]
      }
    }

    // Throw if no auditor has been found
    throw Error("No auditor found")
  }

  executor.register = function (initializer: AuditorInitializer) {
    const auditor = initializer(path)
    auditors[auditor.identifier] = auditor
  }

  return executor
}