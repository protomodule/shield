import util from "util"

export const debug = (data: any): void => {
  console.debug(util.inspect(data, false, 99, true))
}

export const log = (data: any): void => {
  console.log(data)
}