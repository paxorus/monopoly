## Setup
1. Clone the GitHub repo: `git clone https://github.com/paxorus/monopoly.git`
1. Install NPM dependencies: `npm install`
1. Start the Babel daemon: `npm run babel`
1. Start the Node server: `npm start`

## Code TODOs
Minor TODOs are left throughout the code as well.

#### Major
* Consider React/Redux for the game and landing pages.
* DB persistence (currently all state is held in-memory)
* Server error handling (currently a single bad request can send it down)

#### Medium
* Test coverage for GET and Lobby controllers
* Test coverage for obey-location.js and remainder of execute-turn.js

#### Minor
* Should Player ever use io.emit() (game SocketIO room) instead of emitToAll()?
* Attach all event listeners in JS, instead of setting them on the window and letting HTML find them in the global space.

## Bugs
* Player sprites should not be middle-aligned like the houses in left+right squares.
