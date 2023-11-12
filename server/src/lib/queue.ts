class Queue<T> {
  private _queue: T[] = []

  constructor() {}

  push(item: T) {
    this._queue.push(item)
  }

  get() {
    return this._queue
  }

  shift() {
    return this._queue.shift()
  }

  get length() {
    return this._queue.length
  }

  delete(item: T) {
    const index = this._queue.indexOf(item)
    if (index > -1) {
      this._queue.splice(index, 1)
    }
  }
}

export default Queue
