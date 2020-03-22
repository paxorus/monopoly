/**
n cycles through movers[],handle depletes jail[] or calls on rollMove
rollMove may call action,action/react will call rollMove

Display ids are bal/loc/ploc
*/

var movers=[{name:"Prateek",bal:1500,locnum:0,injail:0,num:0},
        {name:"Prakhar",bal:1500,locnum:0,injail:0,num:1},
        {name:"Willy",bal:1500,locnum:0,injail:0,num:2},
        {name:"Troy",bal:1500,locnum:0,injail:0,num:3},
        {name:"Poop",bal:1500,locnum:0,injail:0,num:4}
];
var len=movers.length;
var mess,ram,exmess;
$(document).ready(function(){
    mess=document.getElementById("mess");
    ram=document.getElementById("ram");
    exmess=document.getElementById("exmess");
    for(var loop1=0;loop1<len;loop1++){
        $("#head"+loop1).html(movers[loop1].name+": <span id='loc"+loop1+"'>Go</span><div style='float:right' id='bal"+loop1+"'>$1500</div>");
    }
});
var n=Math.ceil(Math.random()*len)-1;
var tax=0;

//            ,,,"rgb(219,8,40)","rgb(219,8,40)","","rgb(235,236,54)","rgb(235,236,54)"," ","rgb(235,236,54)",
//            "rgb(213,232,212)","green","green","#48C","green","","#A6A","rgb(63,101,172)","","rgb(63,101,172)"];

var cols=["rgb(129,77,38)","rgb(153,210,240)","rgb(211,40,132)","orange","rgb(219,8,40)","rgb(235,236,54)","green","rgb(63,101,172)"];
//              brown           sky blue            pink        orange          red             yellow      green       deep blue

var places=new Array(40);
places[0]={name:"Go",p:0,col:"rgb(213,232,212)"};
places[1]={name:"Mediterranean Avenue",p:60,re0:2,re1:10,re2:30,re3:90,re4:160,re5:250,ho:50,own:-1,col:cols[0]};
places[2]={name:"Community Chest",p:0,col:"#48C"};
places[3]={name:"Baltic Avenue",p:60,re0:4,re1:20,re2:60,re3:180,re4:320,re5:450,ho:50,own:-1,col:cols[0]};
places[4]={name:"Income Tax",p:0,col:""};
    places[5]={name:"Reading Railroad",p:200,re0:25,re1:50,re2:100,re3:200,own:-1,col:""};
places[6]={name:"Oriental Avenue",p:100,re0:6,re1:30,re2:90,re3:270,re4:400,re5:550,ho:50,own:-1,col:cols[1]};
places[7]={name:"Chance",p:0,col:"#A6A"};
places[8]={name:"Vermont Avenue",p:100,re0:6,re1:30,re2:90,re3:270,re4:400,re5:550,ho:50,own:-1,col:cols[1]};
places[9]={name:"Connecticut Avenue",p:120,re0:8,re1:40,re2:100,re3:300,re4:450,re5:600,ho:50,own:-1,col:cols[1]};
    places[10]={name:"Just Visiting",p:0,col:"rgb(213,232,212)"};
places[11]={name:"St. Charles Place",p:140,re0:10,re1:50,re2:150,re3:450,re4:625,re5:750,ho:100,own:-1,col:cols[2]};
places[12]={name:"Electric Company",p:150,re0:0,re1:0,re2:0,re3:0,re4:0,re5:0,ho:0,own:-1,col:""};
places[13]={name:"States Avenue",p:140,re0:10,re1:50,re2:150,re3:450,re4:625,re5:750,ho:100,own:-1,col:cols[2]};
places[14]={name:"Virginia Avenue",p:160,re0:12,re1:60,re2:180,re3:500,re4:700,re5:900,ho:100,own:-1,col:cols[2]};
    places[15]={name:"Pennsylvania Railroad",p:200,re0:25,re1:50,re2:100,re3:200,own:-1,col:""};
places[16]={name:"St. James Place",p:180,re0:14,re1:70,re2:200,re3:550,re4:750,re5:950,ho:100,own:-1,col:cols[3]};
places[17]={name:"Community Chest",p:0,col:"#48C"};
places[18]={name:"Tennessee Avenue",p:180,re0:14,re1:70,re2:200,re3:550,re4:750,re5:950,ho:100,own:-1,col:cols[3]};
places[19]={name:"New York Avenue",p:200,re0:16,re1:80,re2:220,re3:600,re4:800,re5:1000,ho:100,own:-1,col:cols[3]};
    places[20]={name:"Free Parking",p:0,col:"rgb(213,232,212)"};
places[21]={name:"Kentucky Avenue",p:220,re0:18,re1:90,re2:250,re3:700,re4:875,re5:1050,ho:150,own:-1,col:cols[4]};
places[22]={name:"Chance",p:0,col:"#A6A"};
places[23]={name:"Indiana Avenue",p:220,re0:18,re1:90,re2:250,re3:700,re4:875,re5:1050,ho:150,own:-1,col:cols[4]};
places[24]={name:"Illinois Avenue",p:240,re0:20,re1:100,re2:300,re3:750,re4:925,re5:1100,ho:150,own:-1,col:cols[4]};
    places[25]={name:"B. & O. Railroad",p:200,re0:25,re1:50,re2:100,re3:200,own:-1,col:""};
places[26]={name:"Atlantic Avenue",p:260,re0:22,re1:110,re2:330,re3:800,re4:975,re5:1150,ho:150,own:-1,col:cols[5]};
places[27]={name:"Ventnor Avenue",p:260,re0:22,re1:110,re2:330,re3:800,re4:975,re5:1150,ho:150,own:-1,col:cols[5]};
places[28]={name:"Water Works",p:150,re0:0,re1:0,re2:0,re3:0,re4:0,re5:0,ho:0,own:-1,col:" "};
places[29]={name:"Marvin Gardens",p:280,re0:24,re1:120,re2:360,re3:850,re4:1025,re5:1200,ho:150,own:-1,col:cols[5]};
    places[30]={name:"Go To Jail",p:0,col:"rgb(213,232,212)"};
places[31]={name:"Pacific Avenue",p:300,re0:26,re1:130,re2:390,re3:900,re4:1100,re5:1275,ho:200,own:-1,col:cols[6]};
places[32]={name:"North Carolina Avenue",p:300,re0:26,re1:130,re2:390,re3:900,re4:1100,re5:1275,ho:200,own:-1,col:cols[6]};
places[33]={name:"Community Chest",p:0,col:"#48C"};
places[34]={name:"Pennsylvania Avenue",p:320,re0:28,re1:150,re2:450,re3:1000,re4:1200,re5:1400,ho:200,own:-1,col:cols[6]};
    places[35]={name:"Short Line",p:200,re0:25,re1:50,re2:100,re3:200,own:-1,col:""};
places[36]={name:"Chance",p:0,col:"#A6A"};
places[37]={name:"Park Place",p:350,re0:35,re1:175,re2:500,re3:1100,re4:1300,re5:1500,ho:200,own:-1,col:cols[7]};
places[38]={name:"Luxury Tax",p:0,col:""};
places[39]={name:"Boardwalk",p:700000000000,re0:50,re1:200,re2:600,re3:1400,re4:1700,re5:2000,ho:200,own:-1,col:cols[7]};


function showCard(locnum) {
var a;//text color,bg color
$("#propname").text(places[locnum].name);
switch(parseInt(locnum,10)){
   case 5:case 15:case 25:case 35:a=["#000","white"];break;
    case 1:case 3:a=["brown","white"];break;
    case 6:case 8:case 9:a=["#CCF","black"];break;
    case 11:case 13:case 14:a=["pink","black"];break;
    case 16:case 18:case 19:a=["orange","black"];break;
    case 21:case 23:case 24:a=["red","white"];break;
    case 26:case 27:case 29:a=["yellow","black"];break;
    case 31:case 32:case 34:a=["green","white"];break;
    case 37:case 39:a=["blue","white"];break;
    default:a=["#777","white"];break;
}

var b=document.getElementById("card").style;
switch(parseInt(locnum,10)){
    case 0:case 2:case 4:case 7:case 10:case 17:case 20:case 22:case 30:case 33:case 36:case 38://non-property
    b.display="none";
    break;
    case 5:case 15:case 25:case 35:
    a=["#000","white"];
    $("#price").text("$"+places[locnum].p);
    $("#rent0").html("Rent: $"+places[locnum].re0);
    $("#rent1").html("2 railroads $"+places[locnum].re1);
    $("#rent2").html("3 railroads $"+places[locnum].re2);
    $("#rent3").html("4 railroads $"+places[locnum].re3);
    $("#rent4").text("");
    $("#rent5").html("");
    b.display="block";    
    break;
    case 12:case 28://utility
    $("#price").text("$150");
    $("#rent0").text("One Utility: 4 times roll");
    $("#rent1").text("Both Utilities: 10 times roll");
    $("#rent2").text("");
    $("#rent3").text("");
    $("#rent4").text("");
    $("#rent5").text("");
    b.display="block";
    break;
    default://houses
    $("#price").text("$"+places[locnum].p);
    $("#rent0").text("Rent: $"+places[locnum].re0);
    $("#rent1").text("With 1 House: $"+places[locnum].re1);
    $("#rent2").text("With 2 Houses: $"+places[locnum].re2);
    $("#rent3").text("With 3 Houses: $"+places[locnum].re3);
    $("#rent4").text("With 4 Houses: $"+places[locnum].re4);
    $("#rent5").text("With HOTEL : $"+places[locnum].re5);
    b.display="block";break;
}
$("#propname").css("color",a[1]);
$("#propname").css("backgroundColor",places[locnum].col);
$("#propname").css("display","block");
}

function upB(){$("#bal"+mover.num).text("$"+mover.bal)}
function upL(){$("#loc"+mover.num).text(places[mover.locnum].name);
    //$("#board div:eq("+(mover.locnum+1)+")").append($("#marker"+mover.num));
    if(places[mover.locnum].ho){$("#board").children().eq(mover.locnum).children().first().append($("#marker"+mover.num));}
    else{$("#board").children().eq(mover.locnum).append($("#marker"+mover.num));}
    }
function rand(){return Math.ceil(6*Math.random())}
var roll1;var roll2;var rollnum;
var mover;

function handle(){
    mover=movers[n];n++;n%=len;
    $("#turn").text(mover.name);
    $("#exmess").append($("#ram"));
    mess.textContent="";
    $("#roll").text("");
    if (mover.injail>0) {
        roll1=rand();roll2=rand();
        $("#roll").text(roll1+" "+roll2);
        if (roll1==roll2) {mess.textContent+="A double! You're free!\n";getOutofJail()}
        else {
            mover.injail--;
            if (mover.injail===0) {getOutofJail();}
            else {mess.textContent+="No double..." + mover.name + ", you have "+mover.injail+" turn(s) remaining on your sentence.\n";}
        }
        $("#mess").append($("#ram"));
    }
    else {
        rollnum=0;//count to 3
        if(mover.injail===0){rollMove()}
    }
}

function goAgain(){
    if(roll1!=roll2){$("#mess").append($("#ram"));return false}
    else if(rollnum==3){mess.textContent+="A 3rd double! Troll alert! You're going to jail.\n";goToJail();$("#mess").append($("#ram"));return false}
    else if(mover.injail>0){$("#mess").append($("#ram"));return false}
    return true;
}



function rollMove() {
    roll1=rand();roll2=rand();
    $("#roll").text($("#roll").text()+roll1+" "+roll2+" ");
    console.log(roll1+" "+roll2);
    mover.locnum+=roll1+roll2;
    if (mover.locnum>39) {mover.locnum-=40;mover.bal+=200;}
    mess.textContent+="You landed on "+places[mover.locnum].name+".\n";
    upB();upL();
    rollnum++;
    action();
}


/**
If buyable+unowned-->ask and react
If buyable+owned-->pay rent if not you
If chance/com chest/tax/parking/jail-->settle
*/

function react(ifbuy){
    mess.removeChild(mess.getElementsByClassName("button")[0]);
    mess.removeChild(mess.getElementsByClassName("button")[0]);    
    if (ifbuy) {
        mover.bal-=places[mover.locnum].p;upB();
        $("#ploc"+mover.num).append("<br>"+places[mover.locnum].name);
        places[mover.locnum].own=mover.num;
        mess.textContent+="Congratulations, "+mover.name+"! You now own "+places[mover.locnum].name+"!\n";
    }
    else{mess.textContent+=places[mover.locnum].name+" went unsold.\n"}
    if(goAgain()){mess.innerText+="A double!\n";rollMove()}
}

function pay(guy,rent){
    mover.bal-=rent;upB();
    guy.bal+=rent;$("#bal"+guy.num).text("$"+guy.bal);
    mess.textContent+="You paid $"+rent+" in rent to "+guy.name+".\n";
}

var waitForReact;
function action() {//properties or non-properties
    waitForReact=false;
    if (places[mover.locnum].p!==0) {//properties
        var place=places[mover.locnum];
        if (place.own==-1) {
            mess.textContent+=mover.name+", would you like to buy " + place.name + " for $" + place.p + "?\n";
            mess.innerHTML+="<div class='button' onclick='react(true)'>Buy "+place.name+"</div><div class='button' onclick='react(false)'>No</div>";
            waitForReact=true;
        }
        else if (place.own!=mover.num) {//rent for prop,train,or utility
            var guy=movers[place.own];
            var rent;
            switch(mover.locnum){
                case 12:case 28:rent=4*(roll1+roll2);break;
                //case 5:case 15:case 25:case 35:rent=;break;
                default:rent=place.re0;
            }
            pay(guy,rent);
        }
    }
    else {//non-properties
        switch(mover.locnum){
            case 7:case 22:case 36:chance(mover);break;
            case 2:case 17:case 33:comChest(mover);break;
            case 4:mover.bal-=200;tax+=200;upB();mess.textContent+="You paid $200 income tax.\n";$("#alltax").text("$ " + tax);break;
            case 38:mover.bal-=100;tax+=100;upB();mess.textContent+="You paid $100 luxury tax.\n";$("#alltax").html("$ " + tax);break;
            case 20:mover.bal+=tax;tax=0;$("#alltax").text("$0");upB();break;
            case 30:goToJail();break;
        }
    }
    
    if(!waitForReact && goAgain()){mess.innerText+="A double!\n";rollMove()}
}

function chance(mover) {
    var newl=true;//new-line 
    mess.textContent+="Chance: ";
    switch(Math.floor(Math.random()*16)) {
    case 0:mess.textContent+="Advance to Boardwalk.";mover.locnum=39;upL();action();break;
    case 1:mess.textContent+='Advance to "Go". (Collect $200)';mover.locnum=0;mover.bal+=200;break;
    case 2:mess.textContent+="Make general repairs on all your property: For each house pay $25, for each hotel pay $100.";break;
    case 3:mess.textContent+="Speeding fine $15.";mover.locnum-=15;upL();action();break;
    case 4:mess.textContent+='Advance to St. Charles Place. If you pass "Go" collect $200.';if (mover.locnum>11) {mover.bal+=200;upB()}mover.locnum=11;action();break;
    case 5:mess.textContent+="Your building loan matures. Collect $150.";mover.bal+=150;break;
    case 6:mess.textContent+="Go back three spaces.";mover.locnum-=3;action();break;
    case 7:mess.textContent+="GET OUT OF JAIL FREE. This card may be kept until needed or traded.";break;
    case 8:mess.textContent+="Bank pays you dividend of $50.";mover.bal+=50;break;
    case 9:mess.textContent+='Advance to Illinois Avenue. If you pass "Go" collect $200.';if (mover.locnum>24) {mover.bal+=200}mover.locnum=24;action();break;
    case 10:mess.textContent+="You have been elected chairman of the board. Pay each player $50.";for(var c=0;c<len;c++){movers[c].bal+=50}mover.bal-=50*len;break;
    case 11:mess.textContent+='Go to jail. Go directly to jail, do not pass "Go", do not collect $200.';goToJail();break;
    case 12:mess.textContent+="Advance to the nearest utility. If Unowned, you may buy it from the bank. If Owned, pay owner a total ten times amount thrown on dice.";
            if(mover.locnum>12 && mover.locnum<28){mover.locnum=28}else{mover.locnum=12}
            if(places[mover.locnum].own==-1){action()}
            else if(places[mover.locnum].own!=mover.num){
                pay(movers[places[mover.locnum].own],10*(roll1+roll2));
            }
            newl=false;
    break;
    case 13:mess.textContent+='Take a trip to Reading Railroad. If you pass "Go" collect $200.';if (mover.locnum>5) {mover.bal+=200}mover.locnum=5;break;
    case 14: case 15: mess.textContent+="Advance to the nearest railroad. If Unowned, you may buy it from the bank. If Owned, pay owner twice the rental to which they are otherwise entitled.";
            mover.locnum=5*Math.floor(mover.locnum/5);
            if(places[mover.locnum].own==-1){action()}
            else if(places[mover.locnum].own!=mover.num){
                var place=places[mover.locnum];
                pay(movers[place.own],2*place.re0);
            }
            newl=false;
    break;

    }
    mess.innerHTML+="\n";
    upB();if(mover.injail===0){upL()}
}

function comChest(mover) {
    mess.textContent+="Community Chest: ";
    switch(Math.floor(Math.random()*16)) {
    case 0: mess.textContent+="GET OUT OF JAIL FREE. This card may be kept until needed or traded.";break; 
    case 1: mess.textContent+="You have won second prize in a beauty contest. Collect $10.";mover.bal+=10;break;
    case 2: mess.textContent+="Holiday fund matures. Receive $100.";mover.bal+=100;break;
    case 3: mess.textContent+="Bank error in your favor. Collect $200.";mover.bal+=200;break;
    case 4: mess.textContent+='Go to jail. Go directly to jail, do not pass "Go", do not collect $200.';goToJail();break;
    case 5: mess.textContent+="It is your birthday. Collect $10 from every player.";mover.bal+=10*len;for(var c=0;c<len;c++){movers[c].bal-=10;$("bal"+c).text("$"+movers[c].bal)}break;
    case 6: mess.textContent+="Doctor's fees. Pay $50.";mover.bal-=50;break;
    case 7: mess.textContent+="Pay hospital fees of $100.";mover.bal-=100;break;
    case 8: mess.textContent+="You inherit $100.";mover.bal+=100;break;
    case 9: mess.textContent+="From sale of stock you get $50.";mover.bal+=50;break; 
    case 10: mess.textContent+="You are assessed for street repairs: $40 per house, $115 per hotel.";break; 
    case 11: mess.textContent+='Advance to "Go". (Collect $200)';mover.locnum=0;mover.bal+=200;break;
    case 12: mess.textContent+="Income tax refund. Collect $20.";mover.bal+=20;break; 
    case 13: mess.textContent+="Pay school fees of $50.";mover.bal-=50;break;
    case 14: mess.textContent+="Life insurance matures. Collect $100.";mover.bal+=100;break; 
    case 15: mess.textContent+="Receive $25. Consultancy fee.";mover.bal+=25;break;
    }
    mess.textContent+="\n";
    upB();if(mover.injail===0){upL()}
}

function goToJail() {
    mess.textContent+="You will be in jail for 3 turns!";
    mover.locnum=10;
    mover.injail=3;
    $("#loc"+mover.num).text("Jail");
    $("#board div:nth-child(10)").append($("#marker"+mover.num));
}

function getOutofJail() {
    mess.textContent+="You are now out of jail!";
    mover.injail=0;
    $("#loc"+mover.name).text("Just Visiting");    
}


function transaction() {
    var amount=prompt("Enter the volume of the transaction below.");
    var recip=prompt("Enter the recipient.");
    var giver=prompt("Enter the sender.");
    
    switch(recip){
        case movers[0].name:movers[0].bal+=parseInt(amount,10);break;
        case movers[1].name:movers[1].bal+=parseInt(amount,10);break;
        case movers[2].name:movers[2].bal+=parseInt(amount,10);break;
        default:mess.textContent+="Transaction error! Invalid recipient!";giver="anything invalid";
    }
    
    switch(giver){
        case movers[0].name:movers[0].bal-=amount;break;
        case movers[1].name:movers[1].bal-=amount;break;
        case movers[2].name:movers[2].bal-=amount;break;
        case "anything invalid":break;
        default:mess.textContent+="Transaction error! Invalid sender!";
    }
    $("#bal0").text("$"+movers[0].bal);
    $("#bal1").text("$"+movers[1].bal);
    $("#bal2").text("$"+movers[2].bal);
}
