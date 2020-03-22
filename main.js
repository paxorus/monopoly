$(document).ready(function(){
    $("#head0").click(function(){
    if(document.getElementById("user0").style.display=="none"){slide(0)}
  });
    $("#head1").click(function(){
    if(document.getElementById("user1").style.display=="none"){slide(1)}
  });
    $("#head2").click(function(){
    if(document.getElementById("user2").style.display=="none"){slide(2)}
  });
    $("#head3").click(function(){
    if(document.getElementById("user2").style.display=="none"){slide(3)}
  });
    $("#head4").click(function(){
    if(document.getElementById("user2").style.display=="none"){slide(4)}
  });
});

function slide(user){
    for(var loop1=0;loop1<len;loop1++){
        if(loop1!=user){$("#user"+loop1).slideUp();}
    }
    $("#user"+user).slideDown();
}


/**
How do I display 1/2/.../n at once?


*/