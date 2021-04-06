window.game = {

	name: "",
	playerName: "",
	playerId: 0,
	playerLife: 4,
	players: [],

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
	cardWidthFactor: 1/12,
	cardHeightRatio: 1.53846,

	// the four possible origins of cards
	origins: ["forest", "item", "skill", "mountain"],

	// which card is currently selected (contains the actual card object)
	selectedCard: null,

	// where is the middle of the game board?
	midX: 0.4,
	midY: 0.35,

	// messages outgoing to the server
	msgsOut: [],

	// the hands of all players as array of arrays of card ids
	hands: [],

	// all the cards that we have
	cards: [],

	// all the moves that are currently happening (objects containing cards and their targets)
	moves: [],

	// all the rotations just like all the moves
	rotations: [],

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

		var sizeDiv = document.createElement("div");
		this.sizeDiv = sizeDiv;
		sizeDiv.style.position = "absolute";
		sizeDiv.style.top = "8pt";
		sizeDiv.style.right = "8pt";
		sizeDiv.innerHTML = "<span class='clickable' onclick='window.game.resizeCardsDown();'>(-)</span> Card Size <span class='clickable' onclick='window.game.resizeCardsUp();'>(+)</span>";
		this.gameArea.append(sizeDiv);

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

		this.startMoveLoop();
	},

	startMoveLoop: function() {

		// every 50 ms, set the positions of cards that are currently moving around
		window.setInterval(function() {
			for (var i = window.game.moves.length - 1; i >= 0; i--) {
				var move = window.game.moves[i];
				var card = move.card;
				var newX = (move.x + (2 * card.curX)) / 3;
				var newY = (move.y + (2 * card.curY)) / 3;
				if ((Math.abs(card.curX - newX) < 1) && (Math.abs(card.curY - newY) < 1)) {
					card.curX = move.x;
					card.curY = move.y;
					// remove this move, as we have done the move by successfully moving to the target
					window.game.moves.splice(i, 1);
				} else {
					card.curX = newX;
					card.curY = newY;
				}
				card.div.style.left = card.curX + "px";
				card.div.style.top = card.curY + "px";
			}

			for (var i = window.game.rotations.length - 1; i >= 0; i--) {
				var rotation = window.game.rotations[i];
				var card = rotation.card;
				var newRot = (rotation.rot + (3 * card.curRot)) / 4;
				if (Math.abs(card.curRot - newRot) < 1) {
					card.curRot = rotation.rot;
					// remove this rotation
					window.game.rotations.splice(i, 1);
				} else {
					card.curRot = newRot;
				}
				card.div.style.transform = "rotate(" + card.curRot + "deg)";
			}
		}, 50);
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
			request.open("POST", "commLoop", true);
			request.setRequestHeader("Content-Type", "application/json");

			//# actually handle the response - that is, the server informing us about all the things that are happening
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
							window.game.clearOutput();
							for (var i = 0; i < data.forestCards.length; i++) {
								window.game.loadCard("forest/" + data.forestCards[i], "back_forest.jpg", window.game.deckOriginToX("forest"), window.game.deckOriginToY("forest"), false, "black");
							}
							for (var i = 0; i < data.itemCards.length; i++) {
								window.game.loadCard("item/" + data.itemCards[i], "back_item.jpg", window.game.deckOriginToX("item"), window.game.deckOriginToY("item"), false, "black");
							}
							for (var i = 0; i < data.skillCards.length; i++) {
								window.game.loadCard("skill/" + data.skillCards[i], "back_skill.jpg", window.game.deckOriginToX("skill"), window.game.deckOriginToY("skill"), false, "black");
							}
							for (var i = 0; i < data.mountainCards.length; i++) {
								window.game.loadCard("mountain/" + data.mountainCards[i], "back_mountain.jpg", window.game.deckOriginToX("mountain"), window.game.deckOriginToY("mountain"), false, "black");
							}
							// discard piles (one per origin)
							for (var i = 0; i < window.game.origins.length; i++) {
								var orig = window.game.origins[i];
								var card = window.game.loadCard("discard_"+orig+".jpg", null, window.game.discardOriginToX(orig), window.game.discardOriginToY(orig), true, "white");
								card.location = "discard";
								card.eventTarget.addEventListener("click", function(e) {
									window.game.discardSelectedCardAndTellServer();
								}, false);
							}
							// when a player clicks on the table...
							window.game.gameArea.addEventListener("click", function(e) {

								debugLog("[table] onClick");

								if (e.target.id != window.game.gameArea.id) {
									// prevent table bubbling when actually a card is clicked
									return;
								}

								// ... if a card has currently been selected ...
								if (window.game.selectedCard != null) {

									// ... and if it is on their hand ...
									if (window.game.selectedCard.location == "hand") {

										// ... move it off their hand ...
										window.game.selectedCard.removeFromHand();
									}

									// when a card is moved onto the table turn it face up!
									card.location = "table";
									window.game.selectedCard.turnUp();

									var x = e.clientX / window.game.gameArea.clientWidth;
									var y = e.clientY / window.game.gameArea.clientHeight;

									// ... then, move it to this position on the table
									window.game.selectedCard.moveTo(x, y);

									// tell the server (and the other players) about this
									window.game.sendToServer({action: "moveToTable", card: window.game.selectedCard.id, x: x, y: y});

									// we soft-select it in the end so that the selection is "clear" again
									window.game.selectedCard.softSelect();
								}
							}, false);
						}
						if (data.action == "info") {
							window.game.players = data.players;
							for (var i = 0; i < data.players.length; i++) {
								var newPos = window.game.playerPosToOurPos(0.7, 0.8, data.players[i].id);
								var charCard = window.game.loadCard("characters/" + data.players[i].char + ".jpg", null, newPos.x, newPos.y, true, "black");
								charCard.rotate(newPos.rot);
								var labelText = data.players[i].name + ": <span id='player" + data.players[i].id + "Life'>" + data.players[i].life + "</span>";
								if (data.players[i].id == window.game.playerId) {
									window.game.playerLife = data.players[i].life;
									labelText += " <span class='clickable' onclick='window.game.addLife()'>(+)</span> <span class='clickable' onclick='window.game.subtractLife()'>(-)</span>";
								}
								charCard.addLabel(labelText);
								charCard.location = "table";
								window.game.addCharCardOnClick(charCard);
							}
						}
						if (data.action == "drawSkillCards") {
							var skillCards = [];
							for (var i = 0; i < window.game.cards.length; i++) {
								if (window.game.cards[i].origin == "skill") {
									skillCards.push(window.game.cards[i]);
								}
							}
							for (var i = data.offset; i < data.offset + data.amount; i++) {

								skillCards[i].draw();

								// tell the server (and the other players) about this
								window.game.sendToServer({action: "draw", card: skillCards[i].id});
							}
							window.game.deselectCard();
						}
						if (data.action == "draw") {

							var card = window.game.getCard(data.card);

							// ... now, based on what card we have, do something with it!

							switch (card.kind) {

								// ephemere goes on your hand and gets turned face up for you, but stays face down for everyone else...
								case "ephemere":
									card.putOntoHand(data.player);
									break;

								// permanent goes in front of you and gets turned face up...
								case "permanent":
									card.turnUp();
									card.location = "table";
									var newPos = window.game.playerPosToOurPos(window.game.midX, 0.8, data.player);
									card.moveAndRotate(newPos);
									break;

								// instant goes in the middle and gets turned face up...
								default:
									card.turnUp();
									card.location = "table";
									var newPos = window.game.playerPosToOurPos(window.game.midX, window.game.midY, data.player);
									card.moveTo(window.game.midX, window.game.midY);
									card.rotate(newPos.rot);
									break;
							}

							// we also-select it so that this player knows another player did this
							card.alsoSelect();
						}
						if (data.action == "discard") {

							var card = window.game.getCard(data.card);

							// if this card is currently on someone's hand, remove it from there
							if (card.location == "hand") {
								card.removeFromHand();
							}

							card.turnUp();

							// ... and assign its location to discard
							card.location = "discard";
							card.moveTo(
								window.game.discardOriginToX(card.origin),
								window.game.discardOriginToY(card.origin)
							);

							// we also-select it so that this player knows another player did this
							card.alsoSelect();
						}
						if (data.action == "moveToTable") {

							var card = window.game.getCard(data.card);

							// if it is on their hand ...
							if (card.location == "hand") {

								// ... move it off their hand ...
								card.removeFromHand();
							}

							// when a card is moved onto the table, turn it face up
							card.location = "table";
							card.turnUp();

							// convert positions
							var newPos = window.game.playerPosToOurPos(data.x, data.y, data.player);

							// ... then, move it to this position on the table
							card.moveAndRotate(newPos);

							// we also-select it so that this player knows another player did this
							card.alsoSelect();
						}
						if (data.action == "grabOntoHand") {

							var card = window.game.getCard(data.card);

							card.turnDown();
							card.putOntoHand(data.player);

							// we also-select it so that this player knows another player did this
							card.alsoSelect();
						}
						if (data.action == "shuffleIntoDeck") {

							// we here assume that only cards are shuffled into the deck from the discard pile,
							// not e.g. from hand (where we would need to explicitly remove them from a hand first)
							for (var i = 0; i < data.cards.length; i++) {
								var card = window.game.getCard(data.cards[i]);
								card.location = "deck";
								card.turnDown();
								card.moveTo(window.game.deckOriginToX(card.origin), window.game.deckOriginToY(card.origin));
							}
						}
						if (data.action == "setLife") {
							document.getElementById("player" + data.player + "Life").innerHTML = data.life;
						}
						if (data.action == "reuniteForestCards") {

							// get all forest cards from all hands
							for (var i = 0; i < window.game.players.length; i++) {
								var hand = window.game.hands[window.game.players[i].id];
								if (hand) {
									for (var j = 0; j < hand.length; j++) {
										for (var n = 0; n < data.newOrder.length; n++) {
											for (var c = 0; c < data.newOrder[n].length; c++) {
												if (data.newOrder[n][c] == hand[j]) {
													window.game.getCard(hand[j]).turnDown();
													window.game.hands[window.game.players[i].id].splice(j, 1);
													j--
												}
											}
										}
									}
								}
							}

							// put them back onto everyone's hands
							for (var i = 0; i < data.newOrder.length; i++) {
								for (var j = 0; j < window.game.players.length; j++) {
									// TODO :: this here is a bit dirty: we know that player ids go from 0 up, so we can just use them as array indices indexing data.newOrder here...
									if (window.game.players[j].id == i) {
										for (var c = 0; c < data.newOrder[i].length; c++) {
											window.game.getCard(data.newOrder[i][c]).location = "notHandYet";
											window.game.getCard(data.newOrder[i][c]).putOntoHand(window.game.players[j].id);
										}
									}
								}
							}

							// reorganize everyone's hands
							for (var i = 0; i < window.game.players.length; i++) {
								window.game.refreshHand(window.game.players[i].id);
							}
						}
					}
				}
			}

			request.send(JSON.stringify(loopData));

		}, 2000);
	},

	addLife: function() {

		this.playerLife++;
		this.changeOurLifeTo(this.playerLife);
	},

	subtractLife: function() {

		this.playerLife--;
		this.changeOurLifeTo(this.playerLife);
	},

	changeOurLifeTo: function(newLife) {

		this.playerLife = newLife;

		window.game.sendToServer({action: "setLife", life: newLife});

		document.getElementById("player" + this.playerId + "Life").innerHTML = newLife;
	},

	// get X position of the deck with the given origin
	deckOriginToX: function(origin) {
		switch (origin) {
			case "forest":
				return this.midX - 0.05;
			case "item":
				return this.midX + 0.05;
			case "skill":
				return this.midX - 0.05;
			case "mountain":
				return this.midX + 0.05;
		}
		return this.midX;
	},

	// get Y position of the deck with the given origin
	deckOriginToY: function(origin) {
		switch (origin) {
			case "forest":
				return this.midY - 0.15;
			case "item":
				return this.midY - 0.15;
			case "skill":
				return this.midY + 0.15;
			case "mountain":
				return this.midY + 0.15;
		}
		return this.midY;
	},

	// get X position of the discard pile with the given origin
	discardOriginToX: function(origin) {
		switch (origin) {
			case "forest":
				return this.midX - 0.15;
			case "item":
				return this.midX + 0.15;
			case "skill":
				return this.midX - 0.15;
			case "mountain":
				return this.midX + 0.15;
		}
		return this.midX;
	},

	// get Y position of the discard pile with the given origin
	discardOriginToY: function(origin) {
		return this.deckOriginToY(origin);
	},

	// convert this X from player with playerId to an X in our reference frame
	playerPosToOurPos: function(x, y, playerId) {

		var playerPos = 0;
		for (var i = 0; i < window.game.players.length; i++) {

			// if the current one is not us, increase the playerPos to perform a different rotation of cards
			if (window.game.players[i].id != window.game.playerId) {
				playerPos++;
			}

			// if the current one is not the player we are looking for, continue looking!
			if (window.game.players[i].id != playerId) {
				continue;
			}

			// if the player is us...
			if (window.game.players[i].id == window.game.playerId) {
				// ... do nothing!
				return {x: x, y: y, rot: 0};
			} else {
				if (playerPos == 1) {
					// left player
					return {x: (1 - y) / 2, y: x, rot: 90};
				}
				if (playerPos == 2) {
					// right player (whose stuff is even a bit more compressed)
					return {x: (0.6 + y) / 2, y: x * 0.8, rot: -90};
				}
				// more than three players are not being considered, they would get playerPos above 2
				// (below 1 cannot occur as we start counting at 0 and immediately do playerPos++)
				if (playerPos > 2) {
					console.log("Too many players, oh noooo!");
					return {x: x, y: -y, rot: 180};
				}
			}
		}
	},

	onResize: function() {
		window.game.height = window.innerHeight;
		window.game.gameArea = document.getElementById("gameArea");
		window.game.gameArea.style.height = window.game.height + "px";
		window.game.width = window.game.gameArea.clientWidth;

		window.game.moves = [];
		for (var i = 0; i < window.game.cards.length; i++) {
			var curCard = window.game.cards[i];

			curCard.imgWidth = window.game.width * window.game.cardWidthFactor;
			curCard.imgHeight = window.game.cardHeightRatio * curCard.imgWidth;
			curCard.img.style.width = curCard.imgWidth + "px";
			curCard.backImg.style.width = curCard.imgWidth + "px";

			window.game.moves.push({
				card: curCard,
				x: ((window.game.width * curCard.targetRelativeX) - (curCard.imgWidth / 2)),
				y: ((window.game.height * curCard.targetRelativeY) - (curCard.imgHeight / 2)),
			});
		}

		var bigCardImgWidth = (window.game.width / 4);
		var bigCardImgHeight = 1.53846 * bigCardImgWidth;
		if (window.game.bigCardImg) {
			window.game.bigCardImg.style.width = bigCardImgWidth + "px";
		}
		if (window.game.bigCardDiv) {
			window.game.bigCardDiv.style.top = ((window.game.height / 2) - (bigCardImgHeight / 2)) + "px";
		}
	},

	sendToServer: function(data) {

		this.msgsOut.push(data);
	},

	clearOutput: function() {
		this.textDivText = "";
		this.textDiv.innerHTML = this.textDivText;
	},

	println: function(str) {

		this.textDivText = str + "<br>" + this.textDivText;
		this.textDiv.innerHTML = this.textDivText;
	},

	resizeCardsDown: function() {
		this.cardWidthFactor -= 0.01;
		this.resizeCards();
	},

	resizeCardsUp: function() {
		this.cardWidthFactor += 0.01;
		this.resizeCards();
	},

	resizeCards: function() {

		var imgWidth = this.width * this.cardWidthFactor;

		for (var i = 0; i < this.cards.length; i++) {
			this.cards[i].img.style.width = imgWidth + "px";
			this.cards[i].backImg.style.width = imgWidth + "px";
		}
	},

	getCard: function(cardId) {
		for (var i = 0; i < this.cards.length; i++) {
			if (this.cards[i].id == cardId) {
				return this.cards[i];
			}
		}
		return null;
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
		this.bigCardDiv = bigCardDiv;
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
		bigCardDiv.style.zIndex = 2000000;
		this.gameArea.appendChild(bigCardDiv);
	},

	discardSelectedCardAndTellServer: function() {

		// move it to this discard pile...
		if (window.game.selectedCard != null) {

			// if this card is currently on someone's hand, remove it from there
			if (window.game.selectedCard.location == "hand") {
				window.game.selectedCard.removeFromHand();
			}

			window.game.selectedCard.turnUp();
			// ... and assign its location to discard
			window.game.selectedCard.location = "discard";
			window.game.selectedCard.moveTo(
				window.game.discardOriginToX(window.game.selectedCard.origin),
				window.game.discardOriginToY(window.game.selectedCard.origin)
			);

			// tell the server (and the other players) about this
			window.game.sendToServer({action: "discard", card: window.game.selectedCard.id});

			// we soft-select it in the end so that the selection is "clear" again
			window.game.selectedCard.softSelect();
		}
	},

	refreshHand: function(playerId) {
		var len = window.game.hands[playerId].length;
		for (var i = 0; i < len; i++) {
			var curCard = window.game.getCard(window.game.hands[playerId][i]);
			if (curCard != null) {
				var newPos = window.game.playerPosToOurPos(
					0.4 + ((i - ((len - 1) / 2)) / 50),
					0.98 + Math.abs((i - ((len - 1) / 2)) / 200),
					playerId);
				curCard.moveAndRotate(newPos);
			}
		}
	},

	// deselect the currently selected or soft-selected card
	deselectCard: function() {
		window.game.selectedCard = null;
		for (var i = 0; i < window.game.cards.length; i++) {
			window.game.cards[i].div.style.boxShadow = "none";
		}
	},

	addCharCardOnClick: function(charCard) {

		charCard.eventTarget.addEventListener("click", function(e) {

			debugLog("[char card " + charCard.id + "] onClick");

			if (window.game.selectedCard != null) {
				if (window.game.selectedCard.id == charCard.id) {
					window.game.deselectCard();
					return;
				}
			}

			charCard.select();
		}, false);
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
			// the filename of this card, e.g. forest/forest_inst_reunis.jpg
			filename: imgPath,
			// current position, in absolute pixels
			curX: 0,
			curY: 0,
			// target position, in relative units from 0.0 to 1.0
			targetRelativeX: x,
			targetRelativeY: y,
			curRot: 0,

			turnUp: function() {
				debugLog("[card " + this.id + "] turnUp");
				this.div.style.zIndex = window.game.zindexes++;
				this.flippedUp = true;
				this.refreshCardFace();
			},
			turnDown: function() {
				debugLog("[card " + this.id + "] turnDown");
				this.div.style.zIndex = window.game.zindexes++;
				this.flippedUp = false;
				this.refreshCardFace();
			},
			moveAndRotate: function(pos) {
				this.moveTo(pos.x, pos.y);
				this.rotate(pos.rot);
			},
			moveTo: function(x, y) {
				debugLog("[card " + this.id + "] moveTo(" + x + ", " + y + ")");
				this.div.style.zIndex = window.game.zindexes++;
				if (this.location == "hand") {
					this.div.style.zIndex = window.game.zindexes + 1000000;
				}
				// we animate this movement by just adding the move to the moves array, where it will be picked up
				// ... but first we remove this card's move if there is a previous move
				for (var i = window.game.moves.length - 1; i >= 0; i--) {
					if (window.game.moves[i].card.id == this.id) {
						window.game.moves.splice(i, 1);
					}
				}
				card.targetRelativeX = x;
				card.targetRelativeY = y;
				window.game.moves.push({
					card: this,
					x: ((window.game.width * x) - (this.imgWidth / 2)),
					y: ((window.game.height * y) - (this.imgHeight / 2)),
				});
				// reset the rotation (which will be right in almost any case, and if not, then we have been called by moveAndRotate which rotates correctly again immediately)
				this.rotate(0);
			},
			rotate: function(rot) {
				for (var i = window.game.rotations.length - 1; i >= 0; i--) {
					if (window.game.rotations[i].card.id == this.id) {
						window.game.rotations.splice(i, 1);
					}
				}
				window.game.rotations.push({
					card: this,
					rot: rot,
				});
			},
			putOntoHand: function(playerId) {
				// if this card is already on our hand, don't do anything!
				if (this.location == "hand") {
					return;
				}
				debugLog("[card " + this.id + "] putOntoHand(" + playerId + ")");
				this.location = "hand";
				this.handPlayerId = playerId;
				if (!window.game.hands[playerId]) {
					window.game.hands[playerId] = [];
				}
				window.game.hands[playerId].push(this.id);
				window.game.refreshHand(playerId);
				this.refreshCardFace();
			},
			removeFromHand: function() {
				debugLog("[card " + this.id + "] removeFromHand()");
				for (var i = window.game.hands[this.handPlayerId].length - 1; i >= 0; i--) {
					if (window.game.hands[this.handPlayerId][i] == this.id) {
						window.game.hands[this.handPlayerId].splice(i, 1);
					}
				}
				window.game.refreshHand(this.handPlayerId);
				this.location = "table";
				this.turnUp();
			},
			isFaceVisible: function() {
				if ((this.location == "hand") && (this.handPlayerId == window.game.playerId)) {
					return true;
				}
				return this.flippedUp;
			},
			refreshCardFace: function() {
				if (this.isFaceVisible()) {
					this.img.style.display = "block";
					this.backImg.style.display = "none";
				} else {
					this.img.style.display = "none";
					this.backImg.style.display = "block";
				}
			},
			// show a selection shadow around this card so that it is clear it was active, but do not
			// even deselect other cards, as this one might have been moved by another player at the same time
			alsoSelect: function() {
				this.div.style.boxShadow = "rgba(32, 128, 255, 0.75) 0pt 0pt 5pt 5pt";
			},
			// show a selection shadow around this card so that it is clear which card was active last,
			// but do NOT actually fully select it
			softSelect: function() {
				window.game.deselectCard();
				this.div.style.boxShadow = "rgba(255, 196, 32, 0.5) 0pt 0pt 5pt 5pt";
			},
			// actually fully select this card
			select: function() {
				window.game.deselectCard();
				window.game.selectedCard = this;
				this.div.style.boxShadow = "rgba(255, 196, 32, 1) 0pt 0pt 5pt 5pt";
			},
			// draw this card from the deck
			draw: function() {
				// ... now, based on what card we have, do something with it!

				switch (this.kind) {

					// ephemere goes on your hand and gets turned face up for you, but stays face down for everyone else...
					case "ephemere":
						this.putOntoHand(window.game.playerId);
						break;

					// permanent goes in front of you and gets turned face up...
					case "permanent":
						this.turnUp();
						this.location = "table";
						this.moveTo(window.game.midX, 0.8);
						break;

					// instant goes in the middle and gets turned face up...
					default:
						this.turnUp();
						this.location = "table";
						this.moveTo(window.game.midX, window.game.midY);

						// re-unify all forest cards from all players, shuffle them, and redistribute
						if (this.filename == "forest/forest_inst_reunis.jpg") {

							// get all forest cards from all hands
							var forestCards = [];
							for (var i = 0; i < window.game.players.length; i++) {
								var hand = window.game.hands[window.game.players[i].id];
								if (hand) {
									for (var j = 0; j < hand.length; j++) {
										if (window.game.getCard(hand[j]).origin == "forest") {
											forestCards.push(hand[j]);
											window.game.getCard(hand[j]).turnDown();
											window.game.hands[window.game.players[i].id].splice(j, 1);
											j--;
										}
									}
								}
							}

							// shuffle them
							var shuffledForestCards = toolbox.utils.SortUtils.shuffle(forestCards);

							// put them back onto everyone's hands
							var curPlayer = 0;
							var newOrder = [];
							for (var i = 0; i < shuffledForestCards.length; i++) {
								var giveCardTo = window.game.players[curPlayer].id;
								if (!newOrder[giveCardTo]) {
									newOrder[giveCardTo] = [];
								}
								window.game.getCard(shuffledForestCards[i]).location = "notHandYet";
								window.game.getCard(shuffledForestCards[i]).putOntoHand(giveCardTo);
								newOrder[giveCardTo].push(shuffledForestCards[i]);
								curPlayer++;
								if (curPlayer >= window.game.players.length) {
									curPlayer = 0;
								}
							}

							// reorganize everyone's hands
							for (var i = 0; i < window.game.players.length; i++) {
								window.game.refreshHand(window.game.players[i].id);
							}

							// tell the server and the other players about this happening
							window.game.sendToServer({action: "reuniteForestCards", newOrder: newOrder});
						}
						break;
				}

				this.softSelect();
			},
			addLabel: function(caption) {
				var label = document.createElement("div");
				label.innerHTML = caption;
				label.style.position = "absolute";
				label.style.top = "-16pt";
				// we make the label thrice as wide as the card it is on so that we have space for longer names
				label.style.left = "-100%";
				label.style.width = "300%";
				label.style.textAlign = "center";
				this.label = label;
				this.div.appendChild(label);
			},
		};
		this.ids++;
		this.cards.push(card);

		// we draw the image on the canvas with a certain size and positioned so that the center of the image is
		// at the (x,y) position of the visible board game area, where x and y are on a scale from 0 to 1
		var div = document.createElement("div");
		div.id = "cardHolder" + card.id;
		div.style.zIndex = this.zindexes++;
		card.removalTarget = div;

		var img = document.createElement("img");
		img.src = this.folder + imgPath;
		img.id = "cardFront" + card.id;
		var imgWidth = this.width * window.game.cardWidthFactor;
		var imgHeight = window.game.cardHeightRatio * imgWidth;
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
		card.curY = ((this.height * y) - (imgHeight / 2));
		card.curX = ((this.width * x) - (imgWidth / 2));
		div.style.top = card.curY + "px";
		div.style.left = card.curX + "px";
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
			if (card.isFaceVisible()) {
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

				debugLog("[card " + card.id + "] onClick");

				// first of all, if we click an already selected card, de-select it again
				if (window.game.selectedCard != null) {
					if (window.game.selectedCard.id == card.id) {
						window.game.deselectCard();
						return;
					}
				}

				// first of all, check where the card actually is

				switch (card.location) {

					case "deck":
						card.draw();

						// tell the server (and the other players) about this
						window.game.sendToServer({action: "draw", card: card.id});

						// if this deck would now be empty, automagically shuffle the discard pile and put it back as deck
						// (but let the server shuffle and tell everyone about it! don't let every player shuffle for themselves xD)
						var deckIsEmpty = true;
						var discardedCards = [];
						for (var i = 0; i < window.game.cards.length; i++) {
							if (window.game.cards[i].origin == card.origin) {
								if (window.game.cards[i].location == "deck") {
									deckIsEmpty = false;
								}
								if (window.game.cards[i].location == "discard") {
									discardedCards.push(window.game.cards[i].id);
								}
							}
						}
						if (deckIsEmpty) {
							window.game.sendToServer({action: "shuffleIntoDeck", cards: discardedCards, origin: card.origin});
						}

						break;

					case "table":
						card.select();
						// when you click on the table after this, we move the selected card there
						// through the click event listener on the gameArea table
						break;

					case "hand":
						// if a card is currently selected,
						if (window.game.selectedCard != null) {
							// ... and is not already on your hand ...
							if (window.game.selectedCard.location != "hand") {
								// ... move it to your hand!
								window.game.selectedCard.putOntoHand(window.game.playerId);

								// remove the hard selection from this card, as we usually do not want to keep
								// doing stuff with the card we just put on our hand, but keep it soft selected
								// so that it is clear that this is the card we last used
								window.game.selectedCard.softSelect();

								// tell the server (and the other players) about this
								window.game.sendToServer({action: "grabOntoHand", card: window.game.selectedCard.id});
							} else {
								// otherwise, select this clicked card
								card.select();
							}
						} else {
							// otherwise, select this clicked card
							card.select();
						}
						break;

					case "discard":
						// if a card is currently selected,
						if (window.game.selectedCard != null) {
							// move it to this discard pile...
							window.game.discardSelectedCardAndTellServer();
						} else {
							// otherwise, select this clicked card
							card.select();
						}
						break;
				}

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
	request.open("POST", "startGame", true);
	request.setRequestHeader("Content-Type", "application/json");

	request.onreadystatechange = function() {
		if (request.readyState == 4 && request.status == 200) {
			var result = JSON.parse(request.response);
			window.game.token = result.token;
			window.game.playerId = result.id;
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
	window.game.folder = "games/" + game + "/";

	document.getElementById("intro").style.display = "none";
	document.getElementById("nameBar").style.display = "none";
	document.getElementById("gameSelection").style.display = "none";

	window.addEventListener("resize", window.game.onResize);
	window.game.onResize();

	request.send(JSON.stringify(data));
};


// enable optional debugging
window.showDebugLog = true;
window.debugLog = function(line) {
	if (window.showDebugLog) {
		console.log(line);
	}
};
