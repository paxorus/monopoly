var heads,board;
$(document).ready(function(){
heads=document.getElementById("heads");
board=document.getElementById("board");
/*var locText=[" ","","CC","","Tax"," ","","?","","",
            "Just Visiting","","","",""," ","","CC","","",
            "$ 0","","?","",""," ","","","","",
            "To Jail","","","CC",""," ","?",""," "];*/

            
for(var i=0;i<=39;i++){
    var newdiv=document.createElement("div");
    newdiv.dataset.no=i;
    var indiv=document.createElement("div");
    newdiv.style.backgroundColor=places[i].col;
    if(places[i].ho){indiv.style.backgroundColor="rgb(213,232,212)"}//no text->indiv neutral
    
    switch(Math.floor(i/10)){
        case 0:
            newdiv.className="location bottom";
            newdiv.style.right=70*i+"px";
            indiv.style.bottom=0;
            indiv.className="horizontal";
            break;
        case 1:
            newdiv.className="location left";
            newdiv.style.top=680-68*(i-10)+"px";
            indiv.style.left=0;
            indiv.className="vertical";
            break;
        case 2:
            newdiv.className="location top";
            newdiv.style.right=700-70*(i-20)+"px";
            indiv.style.top=0;
            indiv.className="horizontal";
            break;
        case 3:
            newdiv.className="location right";
            newdiv.style.top=68*(i-30)+"px";
            indiv.style.right=0;
            indiv.className="vertical";
            break;
    }
    newdiv.appendChild(indiv);
    board.appendChild(newdiv);
}

board.childNodes[20].firstChild.id="alltax";board.childNodes[20].firstChild.id="alltax";

board.childNodes[0].style.background="url('go.svg') no-repeat";

for(var loop1=5;loop1<=35;loop1+=10){
    board.childNodes[loop1].style.background="url('rr.svg') no-repeat";
    board.childNodes[loop1].style.backgroundSize="68px 66px";
}


var playerCol=["#E80","#0C0","#08F","#FFF","#000"];
var imgs=[257,254,260,3,6];
for(var j=0;j<len;j++){
    var circ=document.createElement("img");    
    circ.id="marker"+j;
    circ.className="circ";
    circ.src="http://veekun.com/dex/media/pokemon/dream-world/"+imgs[j]+".svg";
    //circ.style.backgroundColor=playerCol[j];
    board.childNodes[0].appendChild(circ);

    heads.innerHTML+="<div id='head"+j+"' class='head'></div><div style='background-color:"+playerCol[j]+";height:5px'></div>";
    heads.innerHTML+="<div class='dashboard' id='user"+j+"' style='display:none'><span id='ploc"+j+"'></span></div>";




}




$("#turn").text(movers[n].name);
$("#loc").text(places[movers[n].locnum].name);
$(".location").click(function() {showCard(this.dataset.no)});

});