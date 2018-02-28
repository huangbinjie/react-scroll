import { MESSAGES } from "./message"
import { generate } from "shortid"
import * as faker from "faker"

export function fetchDataWithText() {
  const data = Array(50).fill(0).map(() => ({ id: generate(), content: faker.lorem.paragraph() }))
  return Promise.resolve(data)
}

export function fetchDataWithImageAndText() {
  const content = genContent()
  const responseData = Array(100).fill(0).map(() => ({ id: generate(), content: genContent(), image: genImage(!!content) }))
  return Promise.resolve(responseData)
}

function genContent(): string | null {
  if (Math.random() > 0.2) return faker.lorem.paragraph()
  return null
}

function genImage(hasContent: boolean): string | null {
  if (hasContent) {
    if (Math.random() > 0.8) {
      const imageWidth = Math.round(Math.random() * 1000)
      const imageHeight = Math.round(Math.random() * 1000)
      const url = `https://fillmurray.com/${imageWidth}/${imageHeight}`
      return url
    }
    return null
  } else {
    return faker.image.image()
  }
}

