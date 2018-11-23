import { Disposable, Scheduler, Sink, Stream, Time } from '@most/types'

export type Adapter<A, B = A> = [(event: A) => void, Stream<B>]

export const createAdapter = <A> (): Adapter<A> => {
  const sinks: { sink: Sink<A>, scheduler: Scheduler }[] = []
  return [a => broadcast(sinks, a), new FanoutPortStream(sinks)]
}

const broadcast = <A> (sinks: { sink: Sink<A>, scheduler: Scheduler }[], a: A): void =>
  sinks.forEach(({ sink, scheduler }) => tryEvent(scheduler.currentTime(), a, sink))

export class FanoutPortStream<A> {
  constructor (private readonly sinks: { sink: Sink<A>, scheduler: Scheduler }[]) {}

  run (sink: Sink<A>, scheduler: Scheduler): Disposable {
    const s = { sink, scheduler }
    this.sinks.push(s)
    return new RemovePortDisposable(s, this.sinks)
  }
}

export class RemovePortDisposable<A> implements Disposable {
  constructor (private readonly sink: { sink: Sink<A>, scheduler: Scheduler }, private readonly sinks: { sink: Sink<A>, scheduler: Scheduler }[]) {}

  dispose () {
    const i = this.sinks.indexOf(this.sink)
    if(i >= 0) {
      this.sinks.splice(i, 1)
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

