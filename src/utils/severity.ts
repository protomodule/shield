export const icon = (severity: string): string => {
  switch (severity) {
    case "info":     return "🔵"
    case "low":      return "⚪️"
    case "moderate": return "🟡"
    case "high":     return "🟠"
    case "critical": return "🔴"
    default:         return "⚫️"
  }
}

export const priority = (severity: string): number => {
  switch (severity) {
    case "info":     return 10
    case "low":      return 20
    case "moderate": return 30
    case "high":     return 40
    case "critical": return 50
    default:         return 0
  }
}
