import { tap, take, runEffects } from '@most/core'
import { newDefaultScheduler } from '@most/scheduler'
import { describe, it } from 'mocha'
import { assert } from '@briancavalier/assert'
import { createAdapter } from '../src/index'
import { fake } from 'sinon'

describe('createAdapter', () => {
  it('broadcasts to all sinks even when the sinks are removed while broadcasting', () => {
    const [induce, events] = createAdapter()
    const f1 = fake()
    const f2 = fake()
    const s1 = take(1, tap(f1, events))
    const s2 = take(1, tap(f2, events))
    const scheduler = newDefaultScheduler()
    runEffects(s1, scheduler)
    runEffects(s2, scheduler)
    induce(undefined)
    assert(f1.called)
    assert(f2.called)
  })

  it ('broadcasts an error event', () :Promise<any> => {
    const [induce, s, induceError] = createAdapter()
    const sampleError = new Error("sample error")
    const f1 = fake()
    const f2 = fake()
    const s1 = tap(f1, s)
    const s2 = tap(f2, s)
    const scheduler = newDefaultScheduler()
    const retVal = Promise.all([
      runEffects(s1, scheduler)
      .then(
        () => { assert(false); },
        (e: Error) => {
          assert(e === sampleError);
          assert(f1.notCalled);
        }
      ),
      runEffects(s2, scheduler)
      .then(
        () => { assert(false); },
        (e: Error) => {
          assert(e === sampleError);
          assert(f2.notCalled);
        }
      )
    ])

    induceError(sampleError);
    induce(undefined);

    return retVal
  })

  it ('ends all observers after emitting an event', () => {
    const [induce, s, , induceEnd] = createAdapter()
    const sampleEvent = { foo: 'bar' }
    const f1 = fake()
    const f2 = fake()
    const s1 = tap(f1, s)
    const s2 = tap(f2, s)
    const scheduler = newDefaultScheduler()
    const retVal = Promise.all([
      runEffects(s1, scheduler)
      .then(() => { assert(f1.calledOnceWith(sampleEvent)) }),
      runEffects(s2, scheduler)
      .then(() => { assert(f2.calledOnceWith(sampleEvent)) })
    ])

    induce(sampleEvent);
    induceEnd();

    return retVal
  })

})
