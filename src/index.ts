import { Disposable, Scheduler, Sink, Stream, Time } from '@most/types'

export interface Port<A> {
  event (value: A): void
  close (e?: Error): void
}

export const createPort = <A> (): [Port<A>, Stream<A>] => {
  const ports: Port<A>[] = []
  return [new FanoutPort(ports), new FanoutPortStream(ports)]
}

export class FanoutPort<A> implements Port<A> {
  constructor (private readonly ports: Port<A>[]) {}

  event (a: A): void {
    this.ports.forEach(p => p.event(a))
  }

  close (e?: Error): void {
    this.ports.forEach(p => p.close(e))
  }
}

export class FanoutPortStream<A> {
  constructor (private readonly ports: Port<A>[]) {}

  run (sink: Sink<A>, scheduler: Scheduler): Disposable {
    const s = new SinkPort(sink, scheduler)
    this.ports.push(s)
    return new RemovePortDisposable(s, this.ports)
  }
}

export class RemovePortDisposable<A> {
  constructor (private readonly port: Port<A>, private readonly ports: Port<A>[]) {}

  dispose () {
    const i = this.ports.indexOf(this.port)
    if(i >= 0) {
      this.ports.splice(i, 1)
    }
  }
}

export class SinkPort<A> implements Port<A> {
  constructor (public readonly sink: Sink<A>, public readonly scheduler: Scheduler) {}

  event (a: A): void {
    tryEvent(this.scheduler.currentTime(), a, this.sink)
  }

  close (e?: Error): void {
    if (e) {
      this.sink.error(this.scheduler.currentTime(), e)
    } else {
      tryEnd(this.scheduler.currentTime(), this.sink)
    }
  }
}

function tryEvent <A> (t: Time, a: A, sink: Sink<A>) {
  try {
    sink.event(t, a)
  } catch(e) {
    sink.error(t, e)
  }
}

function tryEnd <A> (t: Time, sink: Sink<A>) {
  try {
    sink.end(t)
  } catch(e) {
    sink.error(t, e)
  }
}