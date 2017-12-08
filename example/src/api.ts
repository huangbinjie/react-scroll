import { MESSAGES } from "./message"
import { generate } from "shortid"
import * as faker from "faker"

export function fetchData() {
  const maxLength = MESSAGES.length
  const responseData = Array(1000).fill(0).map(() => ({ id: generate(), content: genTextOrImgage() }))
  return Promise.resolve(responseData)
}

export function fetchDataSync() {
  const responseData = Array(1000).fill(0).map(() => ({ id: generate(), content: genTextOrImgage() }))
  return responseData
}

function genTextOrImgage() {
  // if (Math.random() > 0.5) return `<image src="${faker.image.image()}"/>`
  return faker.lorem.paragraph()
}