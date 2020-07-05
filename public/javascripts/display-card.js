import {places, BLACK_TEXT_COLORS, Locations} from "./location-configs.js";
import {players, GlobalState} from "./startup.js";

function showCard(placeIdx) {

    const place = places[placeIdx];

    // Update name.
    $("#propname").text(place.name);

    // Update text color.
    $("#propname").css("color", BLACK_TEXT_COLORS.has(placeIdx) ? "black" : "white");

    $("#propname").css("backgroundColor", place.cardColor || place.col);

    // Populate price and rents.
    switch (placeIdx) {
        case Locations.IncomeTax:
            $("#tax-info").text("Tax: $200");
            break;
        case Locations.LuxuryTax:
            $("#tax-info").text("Tax: $100");
            break;

        case Locations.FreeParking:
            $("#tax-info").text("Cash pool: $" + GlobalState.tax);
            break;

        case 0:// Go
        case 10:// Jail
        case 30:// Go to Jail
        case 2: case 17: case 33:// Community Chest
        case 7: case 22: case 36:// Chance
            break;

        case 5: case 15: case 25: case 35:
            // Display railroad rents.
            $("#price").text("Price: $" + place.p);
            $("#rent0").text("Rent: $" + place.re0);
            $("#rent1").text("2 railroads: $" + place.re1);
            $("#rent2").text("3 railroads: $" + place.re2);
            $("#rent3").text("4 railroads: $" + place.re3);
            $("#rent4").text("");
            $("#rent5").text("");
            $("#mortgage-value").text("");
            $("#price-per-house").text("");
            break;
        case 12: case 28:
            // Display utility rents.
            $("#price").text("Price: $" + place.p);
            $("#rent0").text("One Utility: 4 times roll");
            $("#rent1").text("Both Utilities: 10 times roll");
            $("#rent2").text("");
            $("#rent3").text("");
            $("#rent4").text("");
            $("#rent5").text("");
            $("#mortgage-value").text("");
            $("#price-per-house").text("");
            break;
        default:
            // Display house rents.
            $("#price").text("Price: $" + place.p);
            $("#rent0").text("Rent: $" + place.re0);
            $("#rent1").text("With 1 House: $" + place.re1);
            $("#rent2").text("With 2 Houses: $" + place.re2);
            $("#rent3").text("With 3 Houses: $" + place.re3);
            $("#rent4").text("With 4 Houses: $" + place.re4);
            $("#rent5").text("With HOTEL: $" + place.re5);
            $("#mortgage-value").text("Mortgage Value: $" + place.p / 2);
            $("#price-per-house").text(`$${place.ho} Per House`);
            break;
    }

    // Hide price and rents for non-properties.
    $("#rent-table").css("display", place.p > 0 ? "block" : "none");

    const shouldShowTaxLine = [Locations.IncomeTax, Locations.LuxuryTax, Locations.FreeParking].includes(placeIdx);
    $("#tax-info").css("display", shouldShowTaxLine ? "block" : "none");

    if (place.p === 0) {// Unbuyable
        $("#owner-name").text("");
    } else if (place.own === -1) {
        $("#owner-name").text("Unowned");
    } else {
        const ownerName = players[place.own].name;
        $("#owner-name").text("Owner: " + ownerName);
    }

    $("#location-card").css("display", "block");
}

function hideLocationCard() {
    $("#location-card").css("display", "none");
}

export {
    showCard,
    hideLocationCard
};