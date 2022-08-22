import util from "util"

export const debug = (data: any): void => {
  console.debug(util.inspect(data, false, 99, true))
}

export const error = (data: any): void => {
  console.error(data)
}

export const log = (data: any): void => {
  console.error(data)
}

export const out = (data: any): void => {
  console.log(data)
}
