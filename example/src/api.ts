function* dataGenerator() {
  let index = 0
  while (true) {
    const arr: number[] = []
    for (let i = 50; i--;) {
      arr.push(index++)
    }
    yield arr
  }
}

const gen = dataGenerator()

export const fetchData = (): Promise<[number]> => new Promise((resolve, reject) => {
  setTimeout(() => {
    console.log("this is a request")
    resolve(gen.next().value)
  }, 1000)
})