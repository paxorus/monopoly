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
	{name: "Go", p: 0, col: "rgb(213, 232, 212)", cardColor: Colors.GRAY, imageName: 'images/go.svg'},
	{name: "Mediterranean Avenue", p: 60, rents: [2, 10, 30, 90, 160, 250], ho: 50, own: -1, houseCount: 0, isMortgaged: false, col: Colors.BROWN},
	{name: "Community Chest", p: 0, col: "#48C", imageName: 'images/community-chest.svg'},
	{name: "Baltic Avenue", p: 60, rents: [4, 20, 60, 180, 320, 450], ho: 50, own: -1, houseCount: 0, isMortgaged: false, col: Colors.BROWN},
	{name: "Income Tax", p: 0, col: Colors.TAX},
	{name: "Reading Railroad", p: 200, rents: [25, 50, 100, 200], own: -1, houseCount: 0, isMortgaged: false, col: Colors.RAILROAD, imageName: 'images/railroad.svg'},
	{name: "Oriental Avenue", p: 100, rents: [6, 30, 90, 270, 400, 550], ho: 50, own: -1, houseCount: 0, isMortgaged: false, col: Colors.SKY_BLUE},
	{name: "Chance", p: 0, col: "#A6A", imageName: 'images/chance-pink.svg'},
	{name: "Vermont Avenue", p: 100, rents: [6, 30, 90, 270, 400, 550], ho: 50, own: -1, houseCount: 0, isMortgaged: false, col: Colors.SKY_BLUE},
	{name: "Connecticut Avenue", p: 120, rents: [8, 40, 100, 300, 450, 600], ho: 50, own: -1, houseCount: 0, isMortgaged: false, col: Colors.SKY_BLUE},
	{name: "Just Visiting", p: 0, col: "rgb(213, 232, 212)", cardColor: Colors.GRAY},
	{name: "St. Charles Place", p: 140, rents: [10, 50, 150, 450, 625, 750], ho: 100, own: -1, houseCount: 0, isMortgaged: false, col: Colors.PINK},
	{name: "Electric Company", p: 150, rents: [0, 0, 0, 0, 0, 0], ho: 0, own: -1, houseCount: 0, isMortgaged: false, col: Colors.UTILITY, imageName: 'images/electric-company.svg'},
	{name: "States Avenue", p: 140, rents: [10, 50, 150, 450, 625, 750], ho: 100, own: -1, houseCount: 0, isMortgaged: false, col: Colors.PINK},
	{name: "Virginia Avenue", p: 160, rents: [12, 60, 180, 500, 700, 900], ho: 100, own: -1, houseCount: 0, isMortgaged: false, col: Colors.PINK},
	{name: "Pennsylvania Railroad", p: 200, rents: [25, 50, 100, 200], own: -1, houseCount: 0, isMortgaged: false, col: Colors.RAILROAD, imageName: 'images/railroad.svg'},
	{name: "St. James Place", p: 180, rents: [14, 70, 200, 550, 750, 950], ho: 100, own: -1, houseCount: 0, isMortgaged: false, col: Colors.ORANGE},
	{name: "Community Chest", p: 0, col: "#48C", imageName: 'images/community-chest.svg'},
	{name: "Tennessee Avenue", p: 180, rents: [14, 70, 200, 550, 750, 950], ho: 100, own: -1, houseCount: 0, isMortgaged: false, col: Colors.ORANGE},
	{name: "New York Avenue", p: 200, rents: [16, 80, 220, 600, 800, 1000], ho: 100, own: -1, houseCount: 0, isMortgaged: false, col: Colors.ORANGE},
	{name: "Free Parking", p: 0, col: "rgb(213, 232, 212)", cardColor: Colors.GRAY, imageName: 'images/free-parking.svg'},
	{name: "Kentucky Avenue", p: 220, rents: [18, 90, 250, 700, 875, 1050], ho: 150, own: -1, houseCount: 0, isMortgaged: false, col: Colors.RED},
	{name: "Chance", p: 0, col: "#A6A", imageName: 'images/chance-blue.svg'},
	{name: "Indiana Avenue", p: 220, rents: [18, 90, 250, 700, 875, 1050], ho: 150, own: -1, houseCount: 0, isMortgaged: false, col: Colors.RED},
	{name: "Illinois Avenue", p: 240, rents: [20, 100, 300, 750, 925, 1100], ho: 150, own: -1, houseCount: 0, isMortgaged: false, col: Colors.RED},
	{name: "B. & O. Railroad", p: 200, rents: [25, 50, 100, 200], own: -1, houseCount: 0, isMortgaged: false, col: Colors.RAILROAD, imageName: 'images/railroad.svg'},
	{name: "Atlantic Avenue", p: 260, rents: [22, 110, 330, 800, 975, 1150], ho: 150, own: -1, houseCount: 0, isMortgaged: false, col: Colors.YELLOW},
	{name: "Ventnor Avenue", p: 260, rents: [22, 110, 330, 800, 975, 1150], ho: 150, own: -1, houseCount: 0, isMortgaged: false, col: Colors.YELLOW},
	{name: "Water Works", p: 150, rents: [0, 0, 0, 0, 0, 0], ho: 0, own: -1, houseCount: 0, isMortgaged: false, col: Colors.UTILITY, imageName: 'images/water-works.svg'},
	{name: "Marvin Gardens", p: 280, rents: [24, 120, 360, 850, 1025, 1200], ho: 150, own: -1, houseCount: 0, isMortgaged: false, col: Colors.YELLOW},
	{name: "Go To Jail", p: 0, col: "rgb(213, 232, 212)", cardColor: Colors.GRAY, imageName: 'images/go-to-jail.svg'},
	{name: "Pacific Avenue", p: 300, rents: [26, 130, 390, 900, 1100, 1275], ho: 200, own: -1, houseCount: 0, isMortgaged: false, col: Colors.GREEN},
	{name: "North Carolina Avenue", p: 300, rents: [26, 130, 390, 900, 1100, 1275], ho: 200, own: -1, houseCount: 0, isMortgaged: false, col: Colors.GREEN},
	{name: "Community Chest", p: 0, col: "#48C", imageName: 'images/community-chest.svg'},
	{name: "Pennsylvania Avenue", p: 320, rents: [28, 150, 450, 1000, 1200, 1400], ho: 200, own: -1, houseCount: 0, isMortgaged: false, col: Colors.GREEN},
	{name: "Short Line", p: 200, rents: [25, 50, 100, 200], own: -1, houseCount: 0, isMortgaged: false, col: Colors.RAILROAD, imageName: 'images/railroad.svg'},
	{name: "Chance", p: 0, col: "#A6A", imageName: 'images/chance-orange.svg'},
	{name: "Park Place", p: 350, rents: [35, 175, 500, 1100, 1300, 1500], ho: 200, own: -1, houseCount: 0, isMortgaged: false, col: Colors.DEEP_BLUE},
	{name: "Luxury Tax", p: 0, col: Colors.TAX, imageName: 'images/luxury-tax.svg'},
	{name: "Boardwalk", p: 400, rents: [50, 200, 600, 1400, 1700, 2000], ho: 200, own: -1, houseCount: 0, isMortgaged: false, col: Colors.DEEP_BLUE}
];

const Locations = {
	Go: 0,
	CommunityChest1: 2,
	IncomeTax: 4,
	ReadingRailroad: 5,
	Chance1: 7,
	Jail: 10,
	StCharlesPlace: 11,
	ElectricCompany: 12,
	PennsylvaniaRailroad: 15,
	CommunityChest2: 17,
	FreeParking: 20,
	Chance2: 22,
	IllinoisAvenue: 24,
	BORailroad: 25,
	WaterWorks: 28,
	GoToJail: 30,
	CommunityChest3: 33,
	ShortLine: 35,
	Chance3: 36,
	LuxuryTax: 38,
	Boardwalk: 39
};

const Railroads = [5, 15, 25, 35];
const Utilities = [12, 28];

const MONOPOLIES = [
	[1, 3],
	[6, 8, 9],
	[11, 13, 14],
	[16, 18, 19],
	[21, 23, 24],
	[26, 27, 29],
	[31, 32, 34],
	[37, 39],
	Railroads,
	Utilities
];

/**
 * Helps order properties by their group, when they appear in a list.
 */
function propertyComparator(idx1, idx2) {
	function _computeWeight(idx) {
		// Order: properties by location, then utilities, then railroads.
		if (Railroads.includes(idx)) {
			return idx + 200;
		}
		if (Utilities.includes(idx)) {
			return idx + 100;
		}
		return idx;
	}

	return _computeWeight(idx1) - _computeWeight(idx2);
}

export {
	places,
	propertyComparator,
	BLACK_TEXT_COLORS,
	Locations,
	MONOPOLIES
};