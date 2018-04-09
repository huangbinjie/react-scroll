import { MESSAGES } from "./message"
import { generate } from "shortid"
import * as faker from "faker"

export function fetchDataWithText() {
  const data = Array(50).fill(0).map(() => ({ id: generate(), content: faker.lorem.paragraph() }))
  return Promise.resolve(data)
}

export function fetchDataWithImageAndText() {
  const content = genContent()
  const responseData = Array(100).fill(0).map(() => {
    const image = genImage(!!content)
    return { id: generate(), content: genContent(), image }
  })
  return Promise.resolve(responseData)
}

function genContent(): string | null {
  if (Math.random() > 0.1) return faker.lorem.paragraph()
  return null
}

function genImage(hasContent: boolean): string | null {
  if (hasContent) {
    if (Math.random() > 0.5) {
      // return faker.image.image()
      const imageWidth = Math.round(Math.random() * 375)
      const imageHeight = Math.round(Math.random() * 100)
      const url = `https://picsum.photos/${imageWidth}/${imageHeight}`
      return url
    }
    return null
  } else {
    // return faker.image.image()
    const imageWidth = Math.round(Math.random() * 375)
    const imageHeight = Math.round(Math.random() * 100)
    const url = `https://picsum.photos/${imageWidth}/${imageHeight}`
    return url
  }
}

