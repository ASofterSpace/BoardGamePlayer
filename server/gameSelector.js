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

		// we draw the image on the canvas with a certain size and positioned so that the center of the image is
		// at the (x,y) position of the visible board game area, where x and y are on a scale from 0 to 1
		var div = document.createElement("div");
		div.id = "cardHolder" + card.id;

		var img = document.createElement("img");
		img.src = imgPath;
		img.id = "cardFront" + card.id;
		var imgWidth = (this.width / 12);
		var imgHeight = 1.53846 * imgWidth;
		img.style.width = imgWidth + "px";
		img.style.borderRadius = "8pt";
		// this line removes the whitespace below the image
		img.style.display = "block";

		div.style.position = "absolute";
		div.style.top = ((this.height * y) - (imgHeight / 2)) + "px";
		div.style.left = ((this.width * x) - (imgWidth / 2)) + "px";
		div.style.borderRadius = "8pt";

		var innerDiv = document.createElement("div");
		innerDiv.style.position = "absolute";
		innerDiv.style.top = "0pt";
		innerDiv.style.left = "0pt";
		innerDiv.style.height = "100%";
		innerDiv.style.width = "100%";
		innerDiv.style.boxShadow = "inset 0pt 0pt 5pt 5pt black";
		innerDiv.style.borderRadius = "8pt";

		div.appendChild(img);
		div.appendChild(innerDiv);
		this.gameArea.appendChild(div);

		return card;
	},

};

window.startGame = function(game) {

	var playerName = document.getElementById("our_name").value;
	if (playerName.trim() == "") {
		alert("Please enter your name before playing a game!");
		return;
	}

	window.game.name = game;
	window.game.folder = "/games/" + game + "/";

	document.getElementById("intro").style.display = "none";
	document.getElementById("nameBar").style.display = "none";
	document.getElementById("gameSelection").style.display = "none";

	window.game.height = window.innerHeight;
	window.game.gameArea = document.getElementById("gameArea");
	window.game.gameArea.style.height = window.game.height + "px";
	window.game.width = window.game.gameArea.clientWidth;

	switch (game) {
		case 'elfik':
			window.game.startElfik();
			break;
	}
}
