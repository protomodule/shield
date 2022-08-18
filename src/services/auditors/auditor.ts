import { Report } from "../report"

export interface Auditor {
  (): Promise<Report>
  identifier: string
  check: () => Promise<boolean>
}