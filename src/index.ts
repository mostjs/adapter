import { Disposable, Scheduler, Sink, Stream, Time } from '@most/types'

export type Port<A> = (event: A) => void

export const createPort = <A> (): [Port<A>, Stream<A>] => {
  const ports: Port<A>[] = []
  return [a => broadcast(ports, a), new FanoutPortStream(ports)]
}

const broadcast = <A> (ports: Port<A>[], a: A): void =>
  ports.forEach(port => port(a))

export class FanoutPortStream<A> {
  constructor (private readonly ports: Port<A>[]) {}

  run (sink: Sink<A>, scheduler: Scheduler): Disposable {
    const s = (a: A) => tryEvent(scheduler.currentTime(), a, sink)
    this.ports.push(s)
    return new RemovePortDisposable(s, this.ports)
  }
}

export class RemovePortDisposable<A> implements Disposable {
  constructor (private readonly port: Port<A>, private readonly ports: Port<A>[]) {}

  dispose () {
    const i = this.ports.indexOf(this.port)
    if(i >= 0) {
      this.ports.splice(i, 1)
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

