function showCard(placeIdxString) {

    const placeIdx = parseInt(placeIdxString, 10);
    const place = places[placeIdx];

    // Update name.
    $("#propname").text(place.name);

    // Update text color.
    $("#propname").css("color", BLACK_TEXT_COLORS.has(placeIdx) ? "black" : "white");

    $("#propname").css("backgroundColor", place.cardColor || place.col);
    $("#propname").css("display", "block");

    // Hide price and rents for non-properties.
    $("#card").css("display", (place.p === 0) ? "none" : "block");

    // Populate price and rents.    
    switch (placeIdx) {
        case 5: case 15: case 25: case 35:
            // Display railroad rents.
            $("#price").text("$" + place.p);
            $("#rent0").html("Rent: $" + place.re0);
            $("#rent1").html("2 railroads: $" + place.re1);
            $("#rent2").html("3 railroads: $" + place.re2);
            $("#rent3").html("4 railroads: $" + place.re3);
            $("#rent4").text("");
            $("#rent5").html("");
            break;
        case 12: case 28:
            // Display utility rents.
            $("#price").text("$" + place.p);
            $("#rent0").text("One Utility: 4 times roll");
            $("#rent1").text("Both Utilities: 10 times roll");
            $("#rent2").text("");
            $("#rent3").text("");
            $("#rent4").text("");
            $("#rent5").text("");
            break;
        default:
            // Display house rents.
            $("#price").text("$" + place.p);
            $("#rent0").text("Rent: $" + place.re0);
            $("#rent1").text("With 1 House: $" + place.re1);
            $("#rent2").text("With 2 Houses: $" + place.re2);
            $("#rent3").text("With 3 Houses: $" + place.re3);
            $("#rent4").text("With 4 Houses: $" + place.re4);
            $("#rent5").text("With HOTEL: $" + place.re5);
            break;
    }
}
