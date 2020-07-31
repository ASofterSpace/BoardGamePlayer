window.game = {

	name: "",
	playerName: "",
	playerId: 0,
	folder: "",
	cards: [],
	gameArea: null,
	width: 0,
	height: 0,
	ids: 0,
	bigCardImg: null,
	textDiv: null,
	rulesDiv: null,

	startElfik: function() {

		this.setupBoard();

		var textDiv = document.createElement("div");
		this.textDiv = textDiv;
		textDiv.style.position = "absolute";
		textDiv.style.top = "8pt";
		textDiv.style.left = "8pt";
		textDiv.innerHTML = "Choose which character you would like to play...";
		this.gameArea.append(textDiv);

		var rulesDiv = document.createElement("div");
		this.rulesDiv = rulesDiv;
		rulesDiv.style.position = "absolute";
		rulesDiv.style.bottom = "8pt";
		rulesDiv.style.right = "8pt";
		rulesDiv.innerHTML = "<a href=\"games/elfik/rules.pdf\" target=\"_blank\">Rule Book</a>";
		this.gameArea.append(rulesDiv);

		this.loadCharacterToChoose("cendre", 0.55, 0.35);
		this.loadCharacterToChoose("rayin", 0.55, 0.65);
		this.loadCharacterToChoose("eloen", 0.45, 0.35);
		this.loadCharacterToChoose("zelfirden", 0.45, 0.65);
		this.loadCharacterToChoose("ludmila", 0.35, 0.35);
		this.loadCharacterToChoose("elrun", 0.35, 0.65);
		this.loadCharacterToChoose("shaya", 0.25, 0.35);
		this.loadCharacterToChoose("terkan", 0.25, 0.65);

		// we start the communication loop with the server,
		// which will be our main way of interacting with it from now on
		this.startServerCommLoop();
	},

	startServerCommLoop: function() {

		// every two seconds we tell the server what is going on, and we hear
		// from it what is going on with the other players
		window.setInterval(function() {

			// TODO - put character choice also in here, and waiting for everyone else to choose their characters, and the actual playing of the game!

			// TODO - do this with token that we get from the server (can just be a uuid for now that we get when we first tell it we want to play this game!)

		}, 2000);
	},

	loadCharacterToChoose: function(charName, x, y) {

		var card = this.loadCard(this.folder + "characters/" + charName + ".jpg", x, y);
		this.cards.push(card);

		card.eventTarget.addEventListener("click", function(e) {

			window.game.textDiv.innerHTML = "You chose well! Now let's wait for the others...";

			for (var i = 0; i < window.game.cards.length; i++) {
				window.game.cards[i].removalTarget.style.display = "none";
			}

			window.game.cards = [];

			var request = new XMLHttpRequest();
			request.open("POST", "chooseCharacter", false);
			request.setRequestHeader("Content-Type", "application/json");

			request.onreadystatechange = function() {
				if (request.readyState == 4 && request.status == 200) {
					// TODO :: start the game loop (in which we call the server once a second asking for updates)
				}
			}

			var data = {
				playerId: window.game.playerId,
				gameName: window.game.name,
				charName: charName,
			};

			request.send(JSON.stringify(data));

		}, false);
	},

	setupBoard: function() {

		var bigCardImg = document.createElement("img");
		this.bigCardImg = bigCardImg;
		var bigCardImgWidth = (this.width / 4);
		var bigCardImgHeight = 1.53846 * bigCardImgWidth;
		bigCardImg.style.width = bigCardImgWidth + "px";
		bigCardImg.style.borderRadius = "16pt";
		bigCardImg.style.display = "block";
		var bigCardDiv = document.createElement("div");
		var bigCardInnerDiv = document.createElement("div");
		bigCardInnerDiv.style.position = "absolute";
		bigCardInnerDiv.style.top = "0pt";
		bigCardInnerDiv.style.left = "0pt";
		bigCardInnerDiv.style.height = "100%";
		bigCardInnerDiv.style.width = "100%";
		bigCardInnerDiv.style.boxShadow = "inset 0pt 0pt 10pt 10pt black";
		bigCardInnerDiv.style.borderRadius = "16pt";
		bigCardDiv.appendChild(bigCardImg);
		bigCardDiv.appendChild(bigCardInnerDiv);
		bigCardDiv.style.position = "absolute";
		bigCardDiv.style.top = ((this.height / 2) - (bigCardImgHeight / 2)) + "px";
		bigCardDiv.style.right = "2px";
		bigCardDiv.style.borderRadius = "16pt";
		this.gameArea.appendChild(bigCardDiv);
	},

	loadCard: function(imgPath, x, y) {

		var card = {
			id: this.ids,
			// the DOM element that we should target with events to arrive at this card
			eventTarget: null,
			// the DOM element that we should target to remove this card again
			removalTarget: null,
		};
		this.ids++;

		// we draw the image on the canvas with a certain size and positioned so that the center of the image is
		// at the (x,y) position of the visible board game area, where x and y are on a scale from 0 to 1
		var div = document.createElement("div");
		div.id = "cardHolder" + card.id;
		card.removalTarget = div;

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
		innerDiv.addEventListener("mouseover", function(e) {
			window.game.bigCardImg.src = imgPath;
		}, false);
		card.eventTarget = innerDiv;

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

	var request = new XMLHttpRequest();
	request.open("POST", "startGame", false);
	request.setRequestHeader("Content-Type", "application/json");

	request.onreadystatechange = function() {
		if (request.readyState == 4 && request.status == 200) {
			var result = JSON.parse(request.response);
			window.game.playerId = result.playerId;
			switch (window.game.name) {
				case 'elfik':
					window.game.startElfik();
					break;
			}
		}
	}

	var data = {
		playerName: playerName,
		gameName: game,
	};

	window.game.name = game;
	window.game.playerName = playerName;
	window.game.folder = "/games/" + game + "/";

	document.getElementById("intro").style.display = "none";
	document.getElementById("nameBar").style.display = "none";
	document.getElementById("gameSelection").style.display = "none";

	window.game.height = window.innerHeight;
	window.game.gameArea = document.getElementById("gameArea");
	window.game.gameArea.style.height = window.game.height + "px";
	window.game.width = window.game.gameArea.clientWidth;

	request.send(JSON.stringify(data));
};
