const Colors = {
    BROWN: "rgb(129,77,38)",
    SKY_BLUE: "rgb(153,210,240)",
    PINK: "rgb(211,40,132)",
    ORANGE: "orange",
    RED: "rgb(219,8,40)",
    YELLOW: "rgb(235,236,54)",
    GREEN: "green",
    DEEP_BLUE: "rgb(63,101,172)",

    RAILROAD: "black",
    UTILITY: "#777",
    TAX: "#777",
    GRAY: "#777"
};

// Light-colored house-able properties need a darker text color on the display card.
const BLACK_TEXT_COLORS = new Set([
	6, 8, 9, // sky blue
    11, 13, 14, // pink
    16, 18, 19, // orange
    26, 27, 29 // yellow
]);

const places = [
	{name: "Go", p: 0, col: "rgb(213, 232, 212)", cardColor: Colors.GRAY},
	{name: "Mediterranean Avenue", p: 60, re0: 2, re1: 10, re2: 30, re3: 90, re4: 160, re5: 250, ho: 50, own: -1, houseCount: 0, isMortgaged: false, col: Colors.BROWN},
	{name: "Community Chest", p: 0, col: "#48C"},
	{name: "Baltic Avenue", p: 60, re0: 4, re1: 20, re2: 60, re3: 180, re4: 320, re5: 450, ho: 50, own: -1, houseCount: 0, isMortgaged: false, col: Colors.BROWN},
	{name: "Income Tax", p: 0, col: Colors.TAX},
	{name: "Reading Railroad", p: 200, re0: 25, re1: 50, re2: 100, re3: 200, own: -1, houseCount: 0, isMortgaged: false, col: Colors.RAILROAD},
	{name: "Oriental Avenue", p: 100, re0: 6, re1: 30, re2: 90, re3: 270, re4: 400, re5: 550, ho: 50, own: -1, houseCount: 0, isMortgaged: false, col: Colors.SKY_BLUE},
	{name: "Chance", p: 0, col: "#A6A"},
	{name: "Vermont Avenue", p: 100, re0: 6, re1: 30, re2: 90, re3: 270, re4: 400, re5: 550, ho: 50, own: -1, houseCount: 0, isMortgaged: false, col: Colors.SKY_BLUE},
	{name: "Connecticut Avenue", p: 120, re0: 8, re1: 40, re2: 100, re3: 300, re4: 450, re5: 600, ho: 50, own: -1, houseCount: 0, isMortgaged: false, col: Colors.SKY_BLUE},
	{name: "Just Visiting", p: 0, col: "rgb(213, 232, 212)", cardColor: Colors.GRAY},
	{name: "St. Charles Place", p: 140, re0: 10, re1: 50, re2: 150, re3: 450, re4: 625, re5: 750, ho: 100, own: -1, houseCount: 0, isMortgaged: false, col: Colors.PINK},
	{name: "Electric Company", p: 150, re0: 0, re1: 0, re2: 0, re3: 0, re4: 0, re5: 0, ho: 0, own: -1, houseCount: 0, isMortgaged: false, col: Colors.UTILITY},
	{name: "States Avenue", p: 140, re0: 10, re1: 50, re2: 150, re3: 450, re4: 625, re5: 750, ho: 100, own: -1, houseCount: 0, isMortgaged: false, col: Colors.PINK},
	{name: "Virginia Avenue", p: 160, re0: 12, re1: 60, re2: 180, re3: 500, re4: 700, re5: 900, ho: 100, own: -1, houseCount: 0, isMortgaged: false, col: Colors.PINK},
	{name: "Pennsylvania Railroad", p: 200, re0: 25, re1: 50, re2: 100, re3: 200, own: -1, houseCount: 0, isMortgaged: false, col: Colors.RAILROAD},
	{name: "St. James Place", p: 180, re0: 14, re1: 70, re2: 200, re3: 550, re4: 750, re5: 950, ho: 100, own: -1, houseCount: 0, isMortgaged: false, col: Colors.ORANGE},
	{name: "Community Chest", p: 0, col: "#48C"},
	{name: "Tennessee Avenue", p: 180, re0: 14, re1: 70, re2: 200, re3: 550, re4: 750, re5: 950, ho: 100, own: -1, houseCount: 0, isMortgaged: false, col: Colors.ORANGE},
	{name: "New York Avenue", p: 200, re0: 16, re1: 80, re2: 220, re3: 600, re4: 800, re5: 1000, ho: 100, own: -1, houseCount: 0, isMortgaged: false, col: Colors.ORANGE},
	{name: "Free Parking", p: 0, col: "rgb(213, 232, 212)", cardColor: Colors.GRAY},
	{name: "Kentucky Avenue", p: 220, re0: 18, re1: 90, re2: 250, re3: 700, re4: 875, re5: 1050, ho: 150, own: -1, houseCount: 0, isMortgaged: false, col: Colors.RED},
	{name: "Chance", p: 0, col: "#A6A"},
	{name: "Indiana Avenue", p: 220, re0: 18, re1: 90, re2: 250, re3: 700, re4: 875, re5: 1050, ho: 150, own: -1, houseCount: 0, isMortgaged: false, col: Colors.RED},
	{name: "Illinois Avenue", p: 240, re0: 20, re1: 100, re2: 300, re3: 750, re4: 925, re5: 1100, ho: 150, own: -1, houseCount: 0, isMortgaged: false, col: Colors.RED},
	{name: "B. & O. Railroad", p: 200, re0: 25, re1: 50, re2: 100, re3: 200, own: -1, houseCount: 0, isMortgaged: false, col: Colors.RAILROAD},
	{name: "Atlantic Avenue", p: 260, re0: 22, re1: 110, re2: 330, re3: 800, re4: 975, re5: 1150, ho: 150, own: -1, houseCount: 0, isMortgaged: false, col: Colors.YELLOW},
	{name: "Ventnor Avenue", p: 260, re0: 22, re1: 110, re2: 330, re3: 800, re4: 975, re5: 1150, ho: 150, own: -1, houseCount: 0, isMortgaged: false, col: Colors.YELLOW},
	{name: "Water Works", p: 150, re0: 0, re1: 0, re2: 0, re3: 0, re4: 0, re5: 0, ho: 0, own: -1, houseCount: 0, isMortgaged: false, col: Colors.UTILITY},
	{name: "Marvin Gardens", p: 280, re0: 24, re1: 120, re2: 360, re3: 850, re4: 1025, re5: 1200, ho: 150, own: -1, houseCount: 0, isMortgaged: false, col: Colors.YELLOW},
	{name: "Go To Jail", p: 0, col: "rgb(213, 232, 212)", cardColor: Colors.GRAY},
	{name: "Pacific Avenue", p: 300, re0: 26, re1: 130, re2: 390, re3: 900, re4: 1100, re5: 1275, ho: 200, own: -1, houseCount: 0, isMortgaged: false, col: Colors.GREEN},
	{name: "North Carolina Avenue", p: 300, re0: 26, re1: 130, re2: 390, re3: 900, re4: 1100, re5: 1275, ho: 200, own: -1, houseCount: 0, isMortgaged: false, col: Colors.GREEN},
	{name: "Community Chest", p: 0, col: "#48C"},
	{name: "Pennsylvania Avenue", p: 320, re0: 28, re1: 150, re2: 450, re3: 1000, re4: 1200, re5: 1400, ho: 200, own: -1, houseCount: 0, isMortgaged: false, col: Colors.GREEN},
	{name: "Short Line", p: 200, re0: 25, re1: 50, re2: 100, re3: 200, own: -1, houseCount: 0, isMortgaged: false, col: Colors.RAILROAD},
	{name: "Chance", p: 0, col: "#A6A"},
	{name: "Park Place", p: 350, re0: 35, re1: 175, re2: 500, re3: 1100, re4: 1300, re5: 1500, ho: 200, own: -1, houseCount: 0, isMortgaged: false, col: Colors.DEEP_BLUE},
	{name: "Luxury Tax", p: 0, col: Colors.TAX},
	{name: "Boardwalk", p: 400, re0: 50, re1: 200, re2: 600, re3: 1400, re4: 1700, re5: 2000, ho: 200, own: -1, houseCount: 0, isMortgaged: false, col: Colors.DEEP_BLUE}
];

const Locations = {
	IncomeTax: 4,
	LuxuryTax: 38,
	FreeParking: 20
};

const MONOPOLIES = [
	[1, 3],
	[6, 8, 9],
	[11, 13, 14],
	[16, 18, 19],
	[21, 23, 24],
	[26, 27, 29],
	[31, 32, 34],
	[37, 39],
	[5, 15, 25, 35], // Railroads
	[12, 28] // Utilities
];

export {
	places,
	BLACK_TEXT_COLORS,
	Locations,
	MONOPOLIES
};