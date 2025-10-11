export default class Queue<T> {
  private queue: Array<T> = [];

  private readonly compareFn: (a: T, b: T) => number;

  constructor(compareFn: (a: T, b: T) => number) {
    this.compareFn = compareFn;
  }

  push(node: T): void {
    this.queue.push(node);
    this.queue.sort(this.compareFn);
  }

  pop(): T | undefined {
    return this.queue.shift();
  }

  isEmpty(): boolean {
    return this.queue.length === 0;
  }

  pushFront(node: T): void {
    this.queue.unshift(node);
  }

  pushBack(node: T): void {
    this.queue.push(node);
  }
}
