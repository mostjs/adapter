# most-port

Mostjs emphasizes declarative event streams, which have many advantages, such as helping to avoid race conditions.  However, getting data into a mostjs event stream graph from 3rd party libraries that weren't designed with that approach in mind can be tricky.  Often, trying to force a library into that model leads to a messy solution.

Most-port provides a disciplined imperative API for getting external data into a mostjs stream, with the goal of making it simpler to integrate libraries that don't lend themselves to a declarative approach.
