window.startGame = function(game) {

	window.gameFolder = "/games/" + game + "/";

	document.getElementById("intro").style.display = "none";
	document.getElementById("gameSelection").style.display = "none";

	// TODO :: get client height of the window
	windowClientHeight = 800;
	gameAreaHeight = windowClientHeight - document.getElementById("nameBar").clientHeight;
	document.getElementById("gameArea").style.height = gameAreaHeight + "px";

	switch (game) {
		case 'elfik':
			startElfik();
			break;
	}
}

startElfik = function() {

	loadCard(gameFolder + "characters/" + "cendrerz3.jpg", 0.5, 0.5);
}

loadCard = function(imgPath, x, y) {

	// TODO :: draw the image on the canvas with a certain size and positioned so that the center of the image is
	// at the (x,y) position of the visible board game area, where x and y are on a scale from 0 to 1
}
