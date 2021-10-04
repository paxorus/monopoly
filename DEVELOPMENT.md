## Code TODOs
Minor TODOs are left throughout the code as well.

#### Major
* Consider ReactJS + Redux instead of DOM API + jQuery. This ensures page-wide live updates, e.g. the location display card doesn't update the owner field if the owner changes while it's still open; it needs to be reopened.
* DB persistence (currently all state is held in-memory)
* Server error handling (currently a single bad request can send it down)

#### Medium
* Server test DI: Use proxyquire or a Pythonic with for the fickle packages, to ensure the DI is closed.
* Test coverage for GET and POST controllers
* Test coverage for obey-location.js
* Always write to MemStore; always read from MemStore, else Data

#### Minor
* Should Player ever use io.emit() (game SocketIO room) instead of emitToAll()?
* Attach all event listeners in JS, instead of setting them on the window and letting HTML find them in the global space.

## Bugs
* Player sprites should not be middle-aligned like the houses in left+right squares.
