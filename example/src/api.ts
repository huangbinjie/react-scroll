import { MESSAGES } from "./message"
import { generate } from "shortid"

export function fetchData() {
  const maxLength = MESSAGES.length
  const responseData = Array(1000).fill(0).map(() => ({ id: generate(), content: MESSAGES[Math.round(Math.random() * MESSAGES.length)] }))
  return Promise.resolve(responseData)
}