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
	CERULEAN_BLUE: "#48C",
	JAIL_BLACK: "black"
};

// Light-colored house-able properties need a darker text color on the display card.
const BLACK_TEXT_COLORS = new Set([
	6, 8, 9, // sky blue
	16, 18, 19, // orange
	26, 27, 29 // yellow
]);

const PlaceConfigs = [
	{name: "Go", price: 0, color: Colors.CERULEAN_BLUE, imageName: "/images/go.svg"},
	{name: "Mediterranean Avenue", shortName: "Mediterr.", price: 60, rents: [2, 10, 30, 90, 160, 250], housePrice: 50, color: Colors.BROWN},
	{name: "Community Chest", price: 0, color: Colors.CERULEAN_BLUE, imageName: "/images/community-chest.svg"},
	{name: "Baltic Avenue", price: 60, rents: [4, 20, 60, 180, 320, 450], housePrice: 50, color: Colors.BROWN},
	{name: "Income Tax", price: 0, color: Colors.TAX, imageName: "/images/income-tax.svg"},
	{name: "Reading Railroad", price: 200, rents: [25, 50, 100, 200], color: Colors.RAILROAD, imageName: "/images/railroad.svg"},
	{name: "Oriental Avenue", shortName: "Oriental", price: 100, rents: [6, 30, 90, 270, 400, 550], housePrice: 50, color: Colors.SKY_BLUE},
	{name: "Chance", price: 0, color: "#A6A", imageName: "/images/chance-pink.svg"},
	{name: "Vermont Avenue", shortName: "Vermont", price: 100, rents: [6, 30, 90, 270, 400, 550], housePrice: 50, color: Colors.SKY_BLUE},
	{name: "Connecticut Avenue", shortName: "Conn. Ave", price: 120, rents: [8, 40, 100, 300, 450, 600], housePrice: 50, color: Colors.SKY_BLUE},
	{name: "Just Visiting/Jail", price: 0, color: "rgb(213, 232, 212)", cardColor: Colors.JAIL_BLACK},
	{name: "St. Charles Place", shortName: "St.Charles", price: 140, rents: [10, 50, 150, 450, 625, 750], housePrice: 100, color: Colors.PINK},
	{name: "Electric Company", price: 150, rents: [0, 0, 0, 0, 0, 0], housePrice: 0, color: Colors.UTILITY, imageName: "/images/electric-company.svg"},
	{name: "States Avenue", shortName: "States", price: 140, rents: [10, 50, 150, 450, 625, 750], housePrice: 100, color: Colors.PINK},
	{name: "Virginia Avenue", shortName: "Virginia", price: 160, rents: [12, 60, 180, 500, 700, 900], housePrice: 100, color: Colors.PINK},
	{name: "Pennsylvania Railroad", shortName: "Penn. Railroad", price: 200, rents: [25, 50, 100, 200], color: Colors.RAILROAD, imageName: "/images/railroad.svg"},
	{name: "St. James Place", shortName: "St. James", price: 180, rents: [14, 70, 200, 550, 750, 950], housePrice: 100, color: Colors.ORANGE},
	{name: "Community Chest", price: 0, color: Colors.CERULEAN_BLUE, imageName: "/images/community-chest.svg"},
	{name: "Tennessee Avenue", shortName: "Tennessee", price: 180, rents: [14, 70, 200, 550, 750, 950], housePrice: 100, color: Colors.ORANGE},
	{name: "New York Avenue", shortName: "New York", price: 200, rents: [16, 80, 220, 600, 800, 1000], housePrice: 100, color: Colors.ORANGE},
	{name: "Free Parking", price: 0, color: "rgb(213, 232, 212)", cardColor: Colors.CERULEAN_BLUE, imageName: "/images/free-parking.svg"},
	{name: "Kentucky Avenue", shortName: "Kentucky", price: 220, rents: [18, 90, 250, 700, 875, 1050], housePrice: 150, color: Colors.RED},
	{name: "Chance", price: 0, color: "#A6A", imageName: "/images/chance-blue.svg"},
	{name: "Indiana Avenue", shortName: "Indiana", price: 220, rents: [18, 90, 250, 700, 875, 1050], housePrice: 150, color: Colors.RED},
	{name: "Illinois Avenue", shortName: "Illinois", price: 240, rents: [20, 100, 300, 750, 925, 1100], housePrice: 150, color: Colors.RED},
	{name: "B. & O. Railroad", price: 200, rents: [25, 50, 100, 200], color: Colors.RAILROAD, imageName: "/images/railroad.svg"},
	{name: "Atlantic Avenue", shortName: "Atlantic", price: 260, rents: [22, 110, 330, 800, 975, 1150], housePrice: 150, color: Colors.YELLOW},
	{name: "Ventnor Avenue", shortName: "Ventnor", price: 260, rents: [22, 110, 330, 800, 975, 1150], housePrice: 150, color: Colors.YELLOW},
	{name: "Water Works", price: 150, rents: [0, 0, 0, 0, 0, 0], housePrice: 0, color: Colors.UTILITY, imageName: "/images/water-works.svg"},
	{name: "Marvin Gardens", shortName: "Marvin", price: 280, rents: [24, 120, 360, 850, 1025, 1200], housePrice: 150, color: Colors.YELLOW},
	{name: "Go To Jail", price: 0, color: "rgb(213, 232, 212)", cardColor: Colors.JAIL_BLACK, imageName: "/images/go-to-jail.svg"},
	{name: "Pacific Avenue", shortName: "Pacific", price: 300, rents: [26, 130, 390, 900, 1100, 1275], housePrice: 200, color: Colors.GREEN},
	{name: "North Carolina Avenue", shortName: "N.Carolina", price: 300, rents: [26, 130, 390, 900, 1100, 1275], housePrice: 200, color: Colors.GREEN},
	{name: "Community Chest", price: 0, color: Colors.CERULEAN_BLUE, imageName: "/images/community-chest.svg"},
	{name: "Pennsylvania Avenue", shortName: "Penn. Ave", price: 320, rents: [28, 150, 450, 1000, 1200, 1400], housePrice: 200, color: Colors.GREEN},
	{name: "Short Line", price: 200, rents: [25, 50, 100, 200], color: Colors.RAILROAD, imageName: "/images/railroad.svg"},
	{name: "Chance", price: 0, color: "#A6A", imageName: "/images/chance-orange.svg"},
	{name: "Park Place", price: 350, rents: [35, 175, 500, 1100, 1300, 1500], housePrice: 200, color: Colors.DEEP_BLUE},
	{name: "Luxury Tax", price: 0, color: Colors.TAX, imageName: "/images/luxury-tax.svg"},
	{name: "Boardwalk", price: 400, rents: [50, 200, 600, 1400, 1700, 2000], housePrice: 200, color: Colors.DEEP_BLUE}
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
	PlaceConfigs,
	propertyComparator,
	BLACK_TEXT_COLORS,
	Locations,
	MONOPOLIES,
	Railroads,
	Utilities
};