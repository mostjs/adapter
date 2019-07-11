import { Disposable, Scheduler, Sink, Stream, Time } from '@most/types'

export type Adapter<A, B> = [(event: A) => void, Stream<B>]

export const createAdapter = <A> (): Adapter<A, A> => {
  const sinks: { sink: Sink<A>, scheduler: Scheduler }[] = []
  let locked: boolean = false
  const queue: { sink: Sink<A>, scheduler: Scheduler }[] = []
  const removeSink = (sink: { sink: Sink<A>, scheduler: Scheduler }) => {
    if (locked) {
      queue.push(sink)
    } else {
      remove(sinks, sink)
    }
  }
  return [a => {
    locked = true
    broadcast(sinks, a)
    locked = false
    if (queue.length > 0) {
      queue.forEach(sink => remove(sinks, sink))
      queue.length = 0
    }
  }, new FanoutPortStream(sinks, removeSink)]
}

const broadcast = <A> (sinks: { sink: Sink<A>, scheduler: Scheduler }[], a: A): void =>
  sinks.forEach(({ sink, scheduler }) => tryEvent(scheduler.currentTime(), a, sink))

export class FanoutPortStream<A> {
  constructor (
    private readonly sinks: { sink: Sink<A>, scheduler: Scheduler }[],
    private readonly removeSink: (sink: { sink: Sink<A>, scheduler: Scheduler }) => void
  ) {}

  run (sink: Sink<A>, scheduler: Scheduler): Disposable {
    const s = { sink, scheduler }
    this.sinks.push(s)
    return new RemovePortDisposable(s, this.removeSink)
  }
}

export class RemovePortDisposable<A> implements Disposable {
  constructor (
    private readonly sink: { sink: Sink<A>, scheduler: Scheduler },
    private readonly removeSink: (sink: { sink: Sink<A>, scheduler: Scheduler }) => void
  ) {}

  dispose () {
    this.removeSink(this.sink)
  }
}

function tryEvent <A> (t: Time, a: A, sink: Sink<A>) {
  try {
    sink.event(t, a)
  } catch(e) {
    sink.error(t, e)
  }
}

function remove <A> (arr: A[], elm: A) {
  const i = arr.indexOf(elm)
  if (i >= 0) {
    arr.splice(i, 1)
  }
}
