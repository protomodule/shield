import { type Dayjs } from "dayjs"
import { priority } from "../utils/severity"

export interface Summary {
  count: {
    info: number
    low: number
    moderate: number
    high: number
    critical: number
  }
}

export interface Vulnerability {
  identifier: string
  module_name: string
  version: string
  severity: string
  title: string

  path?: string
  url?: string
  description?: string
  recommendation?: string
  created?: Dayjs

  vulnerable_versions?: string
  patched_versions?: string
}

export interface Report {
  auditor: string
  vulnerabilities: Vulnerability[]
  summary: Summary
}

export const summary = (summary?: Summary): Summary => {
  return {
    ...summary,
    ...{
      count: {
        info: 0,
        low: 0,
        moderate: 0,
        high: 0,
        critical: 0
      }
    }
  }
}

export const report = (report?: Report): Report => {
  return {
    auditor: "none",
    vulnerabilities: [],
    summary: summary(report?.summary)
  }
}

export const exitCode = (reports: Report[]): number => {
  return Math.ceil(reports
    .map(report => report.vulnerabilities.map(vulnerability => priority(vulnerability.severity)))
    .flat()
    .reduce((acc, prio) => Math.max(acc, prio), 0) / 10)
}
