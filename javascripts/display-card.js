function showCard(placeIdxString) {

    const placeIdx = parseInt(placeIdxString, 10);
    const place = places[placeIdx];

    // Update name.
    $("#propname").text(place.name);

    // Update text color.
    $("#propname").css("color", BLACK_TEXT_COLORS.has(placeIdx) ? "black" : "white");

    $("#propname").css("backgroundColor", place.cardColor || place.col);

    let shouldShowRentTable = true;
    // Populate price and rents.
    switch (placeIdx) {
        case 4:// Income tax
            $("#price").text("Tax: $100");
            $("#rent0").text("");
            $("#rent1").text("");
            $("#rent2").text("");
            $("#rent3").text("");
            $("#rent4").text("");
            $("#rent5").text("");
            break;
        case 38:// Luxury tax.
            $("#price").text("Tax: $200");
            $("#rent0").text("");
            $("#rent1").text("");
            $("#rent2").text("");
            $("#rent3").text("");
            $("#rent4").text("");
            $("#rent5").text("");
            break;

        case 20:
            $("#price").text("Cash pool: $" + GlobalState.tax);
            $("#rent0").text("");
            $("#rent1").text("");
            $("#rent2").text("");
            $("#rent3").text("");
            $("#rent4").text("");
            $("#rent5").text("");
            break;

        case 0:// Go
        case 10:// Jail
        case 30:// Go to Jail
        case 2: case 17: case 33:// Community Chest
        case 7: case 22: case 36:// Chance
            shouldShowRentTable = false;
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
            break;
    }

    // Hide price and rents for non-properties.
    $("#rent-table").css("display", shouldShowRentTable ? "block" : "none");

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