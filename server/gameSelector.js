window.game = {

	name: "",
	folder: "",
	cards: [],
	gameArea: null,
	width: 0,
	height: 0,
	ids: 0,

	startElfik: function() {

		this.cards.push(this.loadCard(this.folder + "characters/" + "cendrerz3.jpg", 0.5, 0.5));
	},

	loadCard: function(imgPath, x, y) {

		var card = {
			id: this.ids,
		};
		this.ids++;

		// TODO :: draw the image on the canvas with a certain size and positioned so that the center of the image is
		// at the (x,y) position of the visible board game area, where x and y are on a scale from 0 to 1
		var img = document.createElement("img");
		img.src = imgPath;
		img.id = "cardFront" + card.id;
		img.style.position = "absolute";
		img.style.top = this.height * y + "px"; // TODO: minus the half-height of the image itself, same for width
		img.style.left = this.width * x + "px";
		img.style.width = (this.width / 12) + "px";
		this.gameArea.appendChild(img);
		return card;
	},

};

window.startGame = function(game) {

	window.game.name = game;
	window.game.folder = "/games/" + game + "/";

	document.getElementById("intro").style.display = "none";
	document.getElementById("gameSelection").style.display = "none";

	// TODO :: get client height of the window
	windowClientHeight = 800;
	window.game.height = windowClientHeight - document.getElementById("nameBar").clientHeight;
	window.game.gameArea = document.getElementById("gameArea");
	window.game.gameArea.style.height = window.game.height + "px";
	window.game.width = window.game.gameArea.clientWidth;

	switch (game) {
		case 'elfik':
			window.game.startElfik();
			break;
	}
}
