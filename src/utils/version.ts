import { findUp } from "find-up"
import fs from "fs/promises"

export const version = async (): Promise<string> => {
  const path = await findUp("package.json")
  if (!path) return "0.0.0"

  return JSON.parse((await fs.readFile(path)).toString()).version
}
