export default class Queue<T> {
  private queue: Array<T> = [];

  push(node: T): void {
    this.queue.push(node);
    this.queue.sort();
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
