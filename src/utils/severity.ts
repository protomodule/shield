import chalk from "chalk"
import { Report } from "../services/report"
import { log } from "./log"

export const icon = (severity: string): string => {
  switch (severity) {
    case "info":     return "🔵"
    case "low":      return "⚪️"
    case "moderate": return "🟡"
    case "medium":   return "🟡"
    case "high":     return "🟠"
    case "critical": return "🔴"
    default:         return "⚫️"
  }
}

export const color = (severity: string): string => {
  switch (severity) {
    case "info":     return "#0171BA"
    case "low":      return "#3FAE49"
    case "moderate": return "#FDC431"
    case "medium":   return "#FDC431"
    case "high":     return "#EE9335"
    case "critical": return "#D53E3A"
    default:         return "#7A7A78"
  }
}

export const priority = (severity: string): number => {
  switch (severity) {
    case "info":     return 10
    case "low":      return 20
    case "moderate": return 30
    case "medium":   return 35
    case "high":     return 40
    case "critical": return 50
    default:         return 0
  }
}

export const byPriority = function(a: { priority: number }, b: { priority: number }) {
  return (a.priority > b.priority) ? -1 : (a.priority < b.priority) ? 1 : 0
}

export const filterSeverity = (reports: Report[], severity?: string) => {
  severity && log(`🚦  Filter vulnerabilities for ${chalk.red.bold(severity)} or higher`)
  return reports.map(report => {
    return {
      ...report,
      vulnerabilities: report
        .vulnerabilities
        .filter(vulnerability => !severity || priority(vulnerability.severity) >= priority(severity))
    }
  })
}
