class Queue {
  constructor() {
    this.items = {};
    this.head = 0;
    this.tail = 0;
  }

  enqueue(element) {
    this.items[this.tail] = element;
    this.tail++;
  }

  dequeue() {
    if (this.isEmpty()) return undefined;

    const item = this.items[this.head];
    delete this.items[this.head];
    this.head++;
    return item;
  }

  peek() {
    return this.items[this.head];
  }

  isEmpty() {
    return this.tail - this.head === 0;
  }

  size() {
    return this.tail - this.head;
  }

  clear() {
    this.items = {};
    this.head = 0;
    this.tail = 0;
  }

  remove(predicate) {
    for (let i = this.head; i < this.tail; i++) {
      if (this.items[i] && predicate(this.items[i])) {
        delete this.items[i];
        return true;
      }
    }
    return false;
  }

  find(predicate) {
    for (let i = this.head; i < this.tail; i++) {
      if (this.items[i] && predicate(this.items[i])) {
        return { index: i, item: this.items[i] };
      }
    }
    return null;
  }

  extractBy(predicate) {
    for (let i = this.head; i < this.tail; i++) {
      if (this.items[i] && predicate(this.items[i])) {
        const item = this.items[i];
        delete this.items[i];
        return item;
      }
    }
    return null;
  }
}

module.exports = { Queue };
