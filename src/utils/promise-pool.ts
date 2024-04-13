function mapList<T, U>(list: Array<T>, concurrentLimit: number, processorFn: (a0: T) => Promise<U>, preserveOrder: boolean): Promise<Array<U>> {
  return new Promise(async (accept, reject) => {
    const outputList: Array<U> = [];

    let finalPromiseResolved = false;

    let cursor = 0;
    let inProgressCount = 0;
    let completedCount = 0;

    function process(input: T) {
      const localCursor = cursor;
      console.log("ENTRY", { cursor, localCursor, inProgressCount });
      inProgressCount += 1;
      processorFn(input)
        .then((res) => {
          outputList.push(res);
          if (finalPromiseResolved) return;
          completedCount += 1;
          inProgressCount -= 1;

          console.log("FIN", { localCursor, completedCount, inProgressCount });

          if (completedCount === list.length) {
            console.log("ALL DONE", outputList);
            if (!finalPromiseResolved) {
              finalPromiseResolved = true;
              accept(outputList);
            }
            return;
          }

          if (inProgressCount < concurrentLimit && cursor < list.length) {
            process(list[cursor]);
            cursor += 1;
          }
        })
        .catch((ex) => {
          if (!finalPromiseResolved) {
            finalPromiseResolved = true;
            reject(ex);
          }
        });
    }

    for (let i = 0; i < Math.min(concurrentLimit, list.length); i++) {
      process(list[i]);
      cursor += 1;
    }

    return outputList;
  });
}

export default { mapList };
