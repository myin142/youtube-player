export interface MusicQueueConfig {
  random?: boolean;
  max_queue: number;
  max_index: number;
}

export class MusicQueue {
  constructor(
    private config: MusicQueueConfig,
    public readonly queue: number[] = []
  ) {
    this.fill();
  }

  updateConfig(config: Partial<MusicQueueConfig>) {
    this.config = {
      ...this.config,
      ...config,
    };
  }

  peek(): number {
    return this.queue[0];
  }

  pop(): number {
    const value = this.queue.shift();
    return value == null ? -1 : value;
  }

  popAndFill(): number {
    const value = this.pop();
    this.fill();
    return value;
  }

  private fill() {
    while (this.queue.length < this.config.max_queue) {
      this.queue.push(this.nextQueueIndex());
    }
  }

  private nextQueueIndex() {
    const randomVideoIdx = () =>
      Math.floor(Math.random() * this.config.max_index);
    const nextVideoIdx = () => {
      let idx =
        this.queue.length === 0 ? 0 : this.queue[this.queue.length - 1] + 1;
      if (idx >= this.config.max_index) {
        idx = 0;
      }
      return idx;
    };

    let idx = -1;
    do {
      idx = this.config.random ? randomVideoIdx() : nextVideoIdx();
    } while (
      this.queue.includes(idx) &&
      this.config.max_index >= this.config.max_queue
    );

    return idx;
  }
}
