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
	zindexes: 0,
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

		var card = {
			id: this.ids,
			// the DOM element that we should target with events to arrive at this card
			eventTarget: null,
			// the DOM element that we should target to remove this card again
			removalTarget: null,
			// the image that shows the front of this card
			img: null,
			backImg: null,
			imgHeight: 0,
			imgWidth: 0,
			// the cardHolder div
			div: null,
			// is this card currently flipped up or down?
			// (if it is in the player's hand, it is seen as flippedUp FOR THAT PLAYER even when flippedUp is false)
			flippedUp: flippedUp,
			// where is this card currently?
			// "deck", "hand", "table", "discard"
			location: "deck",
			// which player has this card on their hand, if it is on someone's hand?
			handPlayerId: null,
			// which deck or discard pile does this card go into? (forest, item, skill, mountain)
			origin: null,
			// which kind of a card is this (ephemere, instant, permanent)?
			kind: null,

			turnUp: function() {
				debugLog("[card " + this.id + "] turnUp");
				this.div.style.zIndex = window.game.zindexes++;
				this.flippedUp = true;
				this.img.style.display = "block";
				this.backImg.style.display = "none";
				// TODO :: tell the server about this
			},
			turnDown: function() {
				debugLog("[card " + this.id + "] turnDown");
				this.div.style.zIndex = window.game.zindexes++;
				this.flippedUp = false;
				this.img.style.display = "none";
				this.backImg.style.display = "block";
				// TODO :: tell the server about this
			},
			moveTo: function(x, y) {
				debugLog("[card " + this.id + "] moveTo(" + x + ", " + y + ")");
				this.div.style.zIndex = window.game.zindexes++;
				// TODO :: animate this movement
				this.div.style.top = ((window.game.height * y) - (this.imgHeight / 2)) + "px";
				this.div.style.left = ((window.game.width * x) - (this.imgWidth / 2)) + "px";
				// TODO :: tell the server about this
			},
		};
		this.ids++;

		// we draw the image on the canvas with a certain size and positioned so that the center of the image is
		// at the (x,y) position of the visible board game area, where x and y are on a scale from 0 to 1
		var div = document.createElement("div");
		div.id = "cardHolder" + card.id;
		div.style.zIndex = this.zindexes++;
		card.removalTarget = div;

		var img = document.createElement("img");
		img.src = this.folder + imgPath;
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
		card.img = img;
		card.imgHeight = imgHeight;
		card.imgWidth = imgWidth;

		var backImg = document.createElement("img");
		backImg.src = this.folder + backImgPath;
		backImg.id = "cardBack" + card.id;
		backImg.style.width = imgWidth + "px";
		backImg.style.borderRadius = "8pt";
		if (flippedUp) {
			backImg.style.display = "none";
		} else {
			backImg.style.display = "block";
		}
		card.backImg = backImg;

		div.style.position = "absolute";
		div.style.top = ((this.height * y) - (imgHeight / 2)) + "px";
		div.style.left = ((this.width * x) - (imgWidth / 2)) + "px";
		div.style.borderRadius = "8pt";
		card.div = div;

		var innerDiv = document.createElement("div");
		innerDiv.style.position = "absolute";
		innerDiv.style.top = "0pt";
		innerDiv.style.left = "0pt";
		innerDiv.style.height = "100%";
		innerDiv.style.width = "100%";
		innerDiv.style.boxShadow = "inset 0pt 0pt 5pt 5pt " + frameColor;
		innerDiv.style.borderRadius = "8pt";
		card.eventTarget = innerDiv;
		card.eventTarget.addEventListener("mouseover", function(e) {
			if (card.flippedUp) {
				window.game.bigCardImg.src = window.game.folder + imgPath;
			} else {
				window.game.bigCardImg.src = window.game.folder + backImgPath;
			}
			window.game.bigCardInnerDiv.style.boxShadow = "inset 0pt 0pt 10pt 10pt " + frameColor;
		}, false);

		div.appendChild(img);
		div.appendChild(backImg);
		div.appendChild(innerDiv);
		this.gameArea.appendChild(div);

		if (imgPath.startsWith("forest/") || imgPath.startsWith("item/") || imgPath.startsWith("skill/") || imgPath.startsWith("mountain/")) {

			if (imgPath.startsWith("forest/")) {
				card.origin = "forest";
			}
			if (imgPath.startsWith("item/")) {
				card.origin = "item";
			}
			if (imgPath.startsWith("skill/")) {
				card.origin = "skill";
			}
			if (imgPath.startsWith("mountain/")) {
				card.origin = "mountain";
			}

			// check what kind of a card we have, based on its name...
			card.kind = "ephemere";
			if (imgPath.startsWith("forest/forest_inst_")) {
				card.kind = "instant";
			}
			if (imgPath.startsWith("item/item_inst_")) {
				card.kind = "instant";
			}
			if (imgPath.startsWith("item/item_permanent_")) {
				card.kind = "permanent";
			}
			if (imgPath.startsWith("mountain/mountain_inst_")) {
				card.kind = "instant";
			}
			if (imgPath.startsWith("mountain/mountain_permanent_")) {
				card.kind = "permanent";
			}

			card.eventTarget.addEventListener("click", function(e) {

				debugLog("[card " + card + "] onClick");

				// first of all, check where the card actually is

				if (card.location == "deck") {

					// ... now, based on what card we have, do something with it!

					switch (card.kind) {

						// ephemere goes on your hand and gets turned face up for you, but stays face down for everyone else...
						case "ephemere":
							card.location = "hand";
							card.moveTo(0.4, 0.95);
							break;

						// permanent goes in front of you and gets turned face up...
						case "permanent":
							card.turnUp();
							card.location = "table";
							card.moveTo(0.4, 0.85);
							break;

						// instant goes in the middle and gets turned face up...
						default:
							card.turnUp();
							card.location = "table";
							card.moveTo(0.4, 0.5);
							break;
					}
				}

				// TODO consider other locations

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

// enable optional debugging
window.showDebugLog = true;
window.debugLog = function(line) {
	if (window.showDebugLog) {
		console.log(line);
	}
};
