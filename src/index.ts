import { Disposable, Scheduler, Sink, Stream, Time } from '@most/types'

export type Adapter<A, B> = [(event: A) => void, Stream<B>, (e: Error) => void, () => void]

export const createAdapter = <A> (): Adapter<A, A> => {
  const sinks: { sink: Sink<A>, scheduler: Scheduler }[] = []
  return [
    a => broadcast(sinks, a),
    new FanoutPortStream(sinks),
    broadcastError(sinks),
    broadcastEnd(sinks)
  ]
}

const broadcast = <A> (sinks: { sink: Sink<A>, scheduler: Scheduler }[], a: A): void =>
  sinks.slice().forEach(({ sink, scheduler }) => tryEvent(scheduler.currentTime(), a, sink))

const broadcastError = <A> (sinks: { sink: Sink<A>, scheduler: Scheduler }[]) => (e: Error) : void =>
  sinks.slice().forEach(({ sink, scheduler }) => sink.error(scheduler.currentTime(), e))

const broadcastEnd = <A> (sinks: { sink: Sink<A>, scheduler: Scheduler }[]) => () : void =>
  sinks.slice().forEach(({ sink, scheduler }) => sink.end(scheduler.currentTime()))

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
