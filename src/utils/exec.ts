import { spawn } from "child_process"
import { Readable } from "stream"

// export const exec = util.promisify(require("child_process").exec)

export const NORESULT = "{}"

export type ExecResult = {
  stdout?: string[]
  stderr?: string[]
  code?: number
}

export const stream = async (cmd: string, args: string[], options: { cwd?: string } = {}) => {
  return new Promise<Readable>((resolve, reject) => {
    const proc = spawn(cmd, args, options)
    resolve(proc.stdout)
  })
}

export const exec = async (cmd: string, args: string[], options: { cwd?: string } = {}) => {
  const result: ExecResult = {}
  return new Promise<ExecResult>((resolve, reject) => {
    const proc = spawn(cmd, args, options)
    proc.stdout.on("data", function(data) {
      if (!result.stdout) result.stdout = []
      result.stdout.push(data.toString())
    })
    proc.stderr.on("data", function(data) {
      if (!result.stderr) result.stderr = []
      result.stderr.push(data.toString())
    })

    proc.on("exit", function(code) {
      result.code = parseInt(`${code}`)
      if (code != 0) reject(result)
      else resolve(result)
    })
  })
}
