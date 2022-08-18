import { cwd } from "process"
import { debug } from "../utils/log"
import { Auditor } from "./auditors/auditor"
import { Report } from "./report"

type AuditorInitializer = (cwd: string) => Auditor

interface ExecutorFunction {
  (auditor?: string): Promise<Report[]>
  register: (initializer: AuditorInitializer) => void
}

export const executor = (path: string = cwd()) => {
  var auditors: { [key: string]: Auditor } = {}
  const executor = <ExecutorFunction> async function (auditor?: string): Promise<Report[]> {
    // [ ] 🚧 TODO: select auditor automatically

    if (auditor && auditors[auditor]) {
      return [
        await auditors[auditor]()
      ]
    }

    throw Error("No auditor found")
  }

  executor.register = function (initializer: AuditorInitializer) {
    const auditor = initializer(path)
    auditors[auditor.identifier] = auditor
  }

  return executor
}