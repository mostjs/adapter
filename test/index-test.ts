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
})
