function open_panel()
{
slideIt();
var a=document.getElementById("sidebar");
a.setAttribute("id","sidebar1");
a.setAttribute("onclick","close_panel()");
}

function open_panel_left()
{
slideIt_left();
var a=document.getElementById("sidebar-left");
a.setAttribute("id","sidebar1-left");
a.setAttribute("onclick","close_panel_left()");
}

function slideIt()
{
	var slidingDiv = document.getElementById("slider");
	var stopPosition = 0;
	
	if (parseInt(slidingDiv.style.right) < stopPosition )
	{
		slidingDiv.style.right = parseInt(slidingDiv.style.right) + 4 + "px";
		setTimeout(slideIt, 1);	
	}
}

function slideIt_left()
{
	var slidingDiv = document.getElementById("slider-left");
	var stopPosition = 0;
	
	if (parseInt(slidingDiv.style.left) < stopPosition )
	{
		slidingDiv.style.left = parseInt(slidingDiv.style.left) + 4 + "px";
		setTimeout(slideIt_left, 1);	
	}
}
	
function close_panel(){
slideIn();
a=document.getElementById("sidebar1");
a.setAttribute("id","sidebar");
a.setAttribute("onclick","open_panel()");
}

function close_panel_left(){
slideIn_left();
a=document.getElementById("sidebar1-left");
a.setAttribute("id","sidebar-left");
a.setAttribute("onclick","open_panel_left()");
}

function slideIn()
{
	var slidingDiv = document.getElementById("slider");
	var stopPosition = -442;
	
	if (parseInt(slidingDiv.style.right) > stopPosition )
	{
		slidingDiv.style.right = parseInt(slidingDiv.style.right) - 4 + "px";
		setTimeout(slideIn, 1);	
	}
}

function slideIn_left()
{
	var slidingDiv = document.getElementById("slider-left");
	var stopPosition = -342;
	
	if (parseInt(slidingDiv.style.left) > stopPosition )
	{
		slidingDiv.style.left = parseInt(slidingDiv.style.left) - 2 + "px";
		setTimeout(slideIn_left, 1);	
	}
}