## Setup
1. Clone the GitHub repo: `git clone https://github.com/paxorus/monopoly.git`
1. Install NPM dependencies: `npm install`
1. Start the Babel daemon: `npm run babel`
1. Start the Node server: `npm run server`
1. Open: `localhost:5000`

## Testing
* Run server unit tests: `npm test`
* Run browser unit tests: `npm run server` then open `localhost:5000/test`

## Code TODOs
Minor TODOs are left throughout the code as well.

#### Major
* DB persistence (currently all state is held in-memory)
* Server error handling (currently a single bad request can send it down)
* Implement a JS Option to replace all JS nulls

#### Medium
* Test coverage for obey-location.js.
* Test coverage for React game and lobby.
* Convert the landing page to React.
* Bring sprite URLs and colors to frontend, and only keep the player sprite ID in the backend.

#### Minor
* Should Player ever use io.emit() (game SocketIO room) instead of emitToAll()?
