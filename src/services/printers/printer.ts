import { log } from "../../utils/log"
import { Report } from "../report"

export interface Printer {
  (report: Report): Promise<void>
  identifier: string
}

type PrinterInitializer = () => Printer

export interface GenericPrinter {
  (report?: Report, printer?: string): Promise<void>
  register: (printer: Printer) => void
}

export const printer = () => {
  var printers: { [key: string]: Printer } = {}

  const printer = <GenericPrinter> async function (report: Report, printer?: string): Promise<void> {
    // Use printer given as CLI argument
    if (printer && printers[printer]) {
      log(`📌  Printer has been pinned to ${printer}`)
      return await printers[printer](report)
    }

    // Fallback to first printer by default
    return await printers[Object.keys(printers)[0]](report)
  }

  printer.register = function (registeredPrinter: Printer) {
    printers[registeredPrinter.identifier] = registeredPrinter
  }

  return printer
}
