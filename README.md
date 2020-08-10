# Online Monopoly
===
The Pokemon sprites are loaded from Bulbapedia.

## House Rules
* No 10% interest on mortgages: If a player mortgages a property for $50, they can unmortgage for $50.
* Houses can be built unevenly: One property may have a hotel, while another of the same color has no houses.
* Go: Landing on Go is just $200, not $400.
* Chance and Community Chest are uniformly random without replacement. In a physical game, players go through the deck before shuffling. This game is more like shuffling every time.
* Income Tax: The income tax is a fixed $200; there is no option of 10% of all assets if that is lower.
* Free Parking: Tax payments go to the Free Parking cash pool. Whoever lands there collects the entire cash pool.

## Upcoming Features
#### Game Essentials
* Going broke, being forced to sell.
* Losing and exiting the game.

#### App Essentials
* Registration page
* Rooms (currently only one game at a time is supported)
* Auction
* Trades
* DB persistence (currently all state is held in-memory)
* Server error handling (currently a single bad request sends it down)

## Improvements
#### Cosmetics
* Customizing (name/sprite)
* Adjust number of players

#### Interconnectivity
* Embolden the rent that is in effect on the display card.
* Hovering over the player HUD header should highlight all of their owned properties.
* Historical logs such as inter-player rent and all tenants for a property.

#### Security
* Authenticate and authorize users on every server request.
* Hide the secret key (currently in the URL) as a UUID as a cookie or localStorage.
* Generate an expiring link for users to log in on a new device.

#### Code
* Consider ReactJS instead of DOM API + jQuery.
* Server-side unit tests.


## Bugs
* Player sprites should not be middle-aligned like the houses in left+right squares.
* Does the server use GlobalState.currentPlayer or can I delete it?
* Attach all event listeners in JS, instead of setting them on the window and letting HTML find them in the global space.