# @most/adapter

Most.js emphasizes declarative event streams, which have many advantages such as helping to avoid race conditions. However, getting data into a Most.js event stream graph from third-party libraries designed without that approach in mind can be tricky. Often, forcing a library into that model leads to a messy solution.

## When You Should Use It

@most/adapter provides a disciplined, imperative API for getting external data into a most.js stream. The goal is to make it simpler to integrate libraries that don’t lend themselves to a declarative approach. @most/adapter works well for cases where you can’t just implement the standard `run()` interface.

If you are looking to translate Node.js streams into Most.js streams, take a look at the community-provided [most-node-streams library](https://github.com/mostjs-community/most-node-streams).

## Get It

```shell
npm install --save @most/adapter

yarn add @most/adapter
```

## API

### Adapter<A, B>

```typescript
type Adapter<A, B> = [(event: A) => void, Stream<B>]
```

An adapter is an entangled pair of an event stream, and a function to induce (cause) events in that stream.

### createAdapter :: () → Adapter<A, A>

Create an Adapter.

```typescript
const [induce, events] = createAdapter<string>()

// Cause an event with value "hello" to occur in events.
induce('hello')
// Cause an event with value "world" to occur in events.
induce('world')
```