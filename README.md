# @most/adapter

Mostjs emphasizes declarative event streams, which have many advantages, such as helping to avoid race conditions.  However, getting data into a mostjs event stream graph from 3rd party libraries that weren't designed with that approach in mind can be tricky.  Often, trying to force a library into that model leads to a messy solution.

Most-adapter provides a disciplined imperative API for getting external data into a mostjs stream, with the goal of making it simpler to integrate libraries that don't lend themselves to a declarative approach.

## API

### Adapter

```js
type Adapter<A, B = A> = [(event: A) => void, Stream<B>]
```

An adapter is an entangled pair of an event stream, and a function to induce
(cause) events in that stream.

### createAdapter :: () &rarr; Adapter<A>

Create an Adapter.

```js
const [induce, events] = createAdapter<string>()

induce('hello') // cause an event with value "hello" to occur in events
induce('world') // cause an event with value "world" to occur in events
```