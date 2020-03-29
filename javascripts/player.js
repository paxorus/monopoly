class Player {
    constructor(name, num, spriteFileName) {
        this.name = name;
        this.num = num;
        this.spriteFileName = spriteFileName;

        this.balance = 1500;
        this.locnum = 0;// placeIdx
        this.jailDays = 0;
        this.latestRoll = null;
        this.rollCount = 0;
    }

    goToJail() {
        log("You will be in jail for 3 turns!");
        this.updateLocation(10);
        this.jailDays = 3;
        $("#loc" + this.num).text("Jail");
        $("#board .location:nth-child(11)").append($("#marker" + this.num));
    }

    getOutofJail() {
        log("You are now out of jail!");
        this.jailDays = 0;
        $("#loc" + this.name).text("Just Visiting");
    }

    updateBalance(income) {
        // Update the view with the player's balance.
        this.balance += income;
        $("#bal" + this.num).text("$" + this.balance);
    }

    updateLocation(newLocation) {
        this.locnum = newLocation;
        // Update the view with the current user's location.
        $("#loc" + this.num).text(places[this.locnum].name);
        //$("#board div:eq("+(mover.locnum+1)+")").append($("#marker"+mover.num));
        if (places[this.locnum].ho) {
            $("#board").children().eq(this.locnum).children().first().append($("#marker" + this.num));
        } else{
            $("#board").children().eq(this.locnum).append($("#marker" + this.num));
        }
    }
}
