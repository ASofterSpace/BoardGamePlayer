window.game = {

	name: "",
	playerName: "",

	// a token that we got from the backend with which we authenticate our requests and are uniquely
	// identifiable, including our id and the game we are playing
	token: "",

	folder: "",
	cards: [],
	gameArea: null,
	width: 0,
	height: 0,
	ids: 0,
	bigCardImg: null,
	bigCardInnerDiv: null,
	textDiv: null,
	textDivText: "",
	rulesDiv: null,

	// messages outgoing to the server
	msgsOut: [],

	startElfik: function() {

		this.setupBoard();

		var textDiv = document.createElement("div");
		this.textDiv = textDiv;
		textDiv.style.position = "absolute";
		textDiv.style.top = "8pt";
		textDiv.style.left = "8pt";
		this.textDivText = "Choose which character you would like to play...";
		textDiv.innerHTML = this.textDivText;
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

			// TODO synchronize / atomicize the next two lines, unless that is alread guaranteed by javascript itself...
			var curMsgs = window.game.msgsOut;
			window.game.msgsOut = [];

			var loopData = {
				token: window.game.token,
				actions: curMsgs,
			};

			var request = new XMLHttpRequest();
			request.open("POST", "commLoop", false);
			request.setRequestHeader("Content-Type", "application/json");

			request.onreadystatechange = function() {
				if (request.readyState == 4 && request.status == 200) {
					console.log("commLoop response:");
					var dataArray = JSON.parse(request.response);
					console.log(dataArray);
					for (var d = 0; d < dataArray.length; d++) {
						var data = dataArray[d];
						if (data.action == "playerJoined") {
							window.game.println(data.name + " joined you!");
						}
						if (data.action == "playerList") {
							var playersStr = "";
							var sep = "";
							for (var i = 0; i < data.players.length; i++) {
								playersStr += sep + data.players[i].name;
								sep = ", ";
							}
							window.game.println("So far, these fine people are playing: " + playersStr);
						}
						if (data.action == "start") {
							window.game.println("Aaand the game is starting! Have fun! :)");
							for (var i = 0; i < data.forestCards.length; i++) {
								window.game.loadCard("forest/" + data.forestCards[i], "back_forest.jpg", 0.35, 0.35, false, "black");
							}
							for (var i = 0; i < data.itemCards.length; i++) {
								window.game.loadCard("item/" + data.itemCards[i], "back_item.jpg", 0.45, 0.35, false, "black");
							}
							for (var i = 0; i < data.skillCards.length; i++) {
								window.game.loadCard("skill/" + data.skillCards[i], "back_skill.jpg", 0.35, 0.65, false, "black");
							}
							for (var i = 0; i < data.mountainCards.length; i++) {
								window.game.loadCard("mountain/" + data.mountainCards[i], "back_mountain.jpg", 0.45, 0.65, false, "black");
							}
							window.game.loadCard("discard_forest.jpg", null, 0.25, 0.35, true, "white");
							window.game.loadCard("discard_item.jpg", null, 0.55, 0.35, true, "white");
							window.game.loadCard("discard_skill.jpg", null, 0.25, 0.65, true, "white");
							window.game.loadCard("discard_mountain.jpg", null, 0.55, 0.65, true, "white");
						}
					}

					// TODO actually handle the response - that is, the server informing us about all the things that are happening
				}
			}

			request.send(JSON.stringify(loopData));

		}, 2000);
	},

	sendToServer: function(data) {

		this.msgsOut.push(data);
	},

	println: function(str) {

		this.textDivText = str + "<br>" + this.textDivText;
		this.textDiv.innerHTML = this.textDivText;
	},

	loadCharacterToChoose: function(charName, x, y) {

		var card = this.loadCard("characters/" + charName + ".jpg", null, x, y, true, "black");
		this.cards.push(card);

		card.eventTarget.addEventListener("click", function(e) {

			window.game.println("You chose well! Now let's wait for the others...");

			for (var i = 0; i < window.game.cards.length; i++) {
				window.game.cards[i].removalTarget.style.display = "none";
			}

			window.game.cards = [];

			window.game.sendToServer({action: "chooseCharacter", charName: charName});

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
		this.bigCardInnerDiv = bigCardInnerDiv;
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

	loadCard: function(imgPath, backImgPath, x, y, flippedUp, frameColor) {

		// if the card we are loading has no backside, just use the front side as backside ;)
		if (backImgPath == null) {
			backImgPath = imgPath;
		}

		imgPath = this.folder + imgPath;
		backImgPath = this.folder + backImgPath;

		var card = {
			id: this.ids,
			// the DOM element that we should target with events to arrive at this card
			eventTarget: null,
			// the DOM element that we should target to remove this card again
			removalTarget: null,
			// is this card currently flipped up or down?
			flippedUp: flippedUp,
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
		if (flippedUp) {
			img.style.display = "block";
		} else {
			img.style.display = "none";
		}

		var backImg = document.createElement("img");
		backImg.src = backImgPath;
		backImg.id = "cardBack" + card.id;
		backImg.style.width = imgWidth + "px";
		backImg.style.borderRadius = "8pt";
		if (flippedUp) {
			backImg.style.display = "none";
		} else {
			backImg.style.display = "block";
		}

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
		innerDiv.style.boxShadow = "inset 0pt 0pt 5pt 5pt " + frameColor;
		innerDiv.style.borderRadius = "8pt";
		innerDiv.addEventListener("mouseover", function(e) {
			if (card.flippedUp) {
				window.game.bigCardImg.src = imgPath;
			} else {
				window.game.bigCardImg.src = backImgPath;
			}
			window.game.bigCardInnerDiv.style.boxShadow = "inset 0pt 0pt 10pt 10pt " + frameColor;
		}, false);
		card.eventTarget = innerDiv;

		div.appendChild(img);
		div.appendChild(backImg);
		div.appendChild(innerDiv);
		this.gameArea.appendChild(div);

		if (imgPath.startsWith("forest/") || imgPath.startsWith("skill/") || imgPath.startsWith("item/") || imgPath.startsWith("mountain/")) {

			card.eventTarget.addEventListener("click", function(e) {

				// check what kind of a card we have, based on its name...
				var kind = "ephemere";
				if (imgPath.startsWith("forest/forest_inst_")) {
					kind = "instant";
				}
				if (imgPath.startsWith("item/item_inst_")) {
					kind = "instant";
				}
				if (imgPath.startsWith("item/item_permanent_")) {
					kind = "permanent";
				}
				if (imgPath.startsWith("mountain/mountain_inst_")) {
					kind = "instant";
				}
				if (imgPath.startsWith("mountain/mountain_permanent_")) {
					kind = "permanent";
				}

				// ... now, based on what card we have, do something with it!

				// instant goes in the middle and gets turned face up...
				// TODO

				// permanent goes in front of you and gets turned face up...
				// TODO

				// ephemere goes on your hand and gets turned face up for you, but stays face down for everyone else...
				// TODO

			}, false);
		}

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
			window.game.token = result.token;
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
