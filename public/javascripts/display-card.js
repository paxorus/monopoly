import {places, BLACK_TEXT_COLORS, Locations} from "./location-configs.js";
import {players, slide, toggleHighlightedProperties, GlobalState} from "./startup.js";

function showCard(placeIdx) {

    const place = places[placeIdx];

    // Update name.
    $("#propname").text(place.name);

    // Update text color.
    $("#propname").css("color", BLACK_TEXT_COLORS.has(placeIdx) ? "black" : "white");

    $("#propname").css("backgroundColor", place.cardColor || place.color);

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

        case Locations.Go:
        case Locations.Jail:
        case Locations.GoToJail:
        case Locations.CommunityChest1:
        case Locations.CommunityChest2:
        case Locations.CommunityChest3:
        case Locations.Chance1:
        case Locations.Chance2:
        case Locations.Chance3:
            break;

        case Locations.ReadingRailroad:
        case Locations.PennsylvaniaRailroad:
        case Locations.BORailroad:
        case Locations.ShortLine:
            // Display railroad rents.
            $("#price").text("Price: $" + place.price);
            $("#rent0").text("Rent: $" + place.rents[0]);
            $("#rent1").text("2 railroads: $" + place.rents[1]);
            $("#rent2").text("3 railroads: $" + place.rents[2]);
            $("#rent3").text("4 railroads: $" + place.rents[3]);
            $("#rent4").text("");
            $("#rent5").text("");
            $("#mortgage-value").text("");
            $("#price-per-house").text("");
            break;
        case Locations.ElectricCompany:
        case Locations.WaterWorks:
            // Display utility rents.
            $("#price").text("Price: $" + place.price);
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
            $("#price").text("Price: $" + place.price);
            $("#rent0").text("Rent: $" + place.rents[0]);
            $("#rent1").text("With 1 House: $" + place.rents[1]);
            $("#rent2").text("With 2 Houses: $" + place.rents[2]);
            $("#rent3").text("With 3 Houses: $" + place.rents[3]);
            $("#rent4").text("With 4 Houses: $" + place.rents[4]);
            $("#rent5").text("With HOTEL: $" + place.rents[5]);

            const mortgageStatus = place.isMortgaged ? "Unmortgage" : "Mortgage";
            $("#mortgage-value").text(`${mortgageStatus} Value: $${place.price / 2}`);
            $("#price-per-house").text(`$${place.housePrice} Per House`);
            break;
    }

    // Hide price and rents for non-properties.
    $("#rent-table").css("display", place.price > 0 ? "block" : "none");

    const shouldShowTaxLine = [Locations.IncomeTax, Locations.LuxuryTax, Locations.FreeParking].includes(placeIdx);
    $("#tax-info").css("display", shouldShowTaxLine ? "block" : "none");

    $("#mortgage-margin").css("display", place.housePrice ? "block" : "none");

    if (place.price === 0) {// Unbuyable
        $("#owner-name").text("");
    } else if (place.ownerNum === -1) {
        $("#owner-name").text("Unowned");
    } else {
        const owner = players[place.ownerNum];
        $("#owner-name").text("Owned by ");
        $("#owner-name").append(buildOwnerNameDisplay(owner));
    }

    $("#location-card").css("display", "block");
}

function buildOwnerNameDisplay(owner) {
    const ownerNameDisplay = document.createElement("span");
    ownerNameDisplay.textContent = owner.name;
    ownerNameDisplay.className = "owner-name-clickable";
    ownerNameDisplay.addEventListener("mouseover", event => toggleHighlightedProperties(owner.num, true));
    ownerNameDisplay.addEventListener("mouseout", event => toggleHighlightedProperties(owner.num, false));
    ownerNameDisplay.addEventListener("click", event => slide(owner.num));
    return ownerNameDisplay;
}

function hideLocationCard() {
    $("#location-card").css("display", "none");
}

export {
    showCard,
    hideLocationCard
};