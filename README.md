# Monopoly Online
The backend uses Node.js and Socket.io.
The frontend is built with jQuery and a bit of Chart.js.
The backend and frontend tests use Mocha.js. The backend end tests also use proxyquire.

The Pokemon sprites are loaded from Bulbapedia.

## House Rules
* No 10% interest on mortgages: If a player mortgages a property for $50, they can unmortgage for $50.
* Houses can be built unevenly: One property may have a hotel, while another of the same color has no houses.
* Go: Landing on Go is just $200, not $400.
* Chance and Community Chest are uniformly random without replacement. In a physical game, players go through the deck before shuffling. This game is more like shuffling every time.
* Income Tax: The income tax is a fixed $200; there is no option of 10% of all assets if that is lower.
* Free Parking: Tax payments go to the Free Parking cash pool. The next player to land there collects the entire cash pool.

## Upcoming Features
#### Game Essentials
* Trades
* Going broke, being forced to sell.
* Auction
* Losing and exiting the game.

#### Kanav's User Feedback
* Center-align the board-- lots of wasted space on a large monitor.
* Display the game rules in the game.

#### Interconnectivity
* Embolden the rent that is in effect on the display card.
* Hovering over the player HUD header should highlight all of their owned properties.

#### Digital Benefits
* Compute net worths for landing page game tiles.
* Watermark owned properties with the owning player's sprite image, like the simplified cropped sketches of the legendaries on the back of the Switch Lite.
* Show logs of previous turns. Currently, a player's notifications are wiped as soon as it's their turn again.
* Historical analytics such as net worth over time.

#### Multiplayer
* Improve gameplay messages so all players are notified of all events like rent payments, with reloadability.
* Generate an expiring link so users can log in on a new device without a password (and effectively account).
* Allow user to play from multiple tabs in real-time.

#### Cosmetics
* Display the dice sides instead of the numbers.
* Enrich the logged text so it's readable. At least widen it.