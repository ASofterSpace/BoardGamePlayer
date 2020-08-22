/**
 * Unlicensed code created by A Softer Space, 2020
 * www.asofterspace.com/licenses/unlicense.txt
 */
package com.asofterspace.boardGamePlayer.web;

import com.asofterspace.boardGamePlayer.Database;
import com.asofterspace.boardGamePlayer.games.Elfik;
import com.asofterspace.boardGamePlayer.games.ElfikPlayer;
import com.asofterspace.boardGamePlayer.games.GameCtrl;
import com.asofterspace.boardGamePlayer.games.Player;
import com.asofterspace.toolbox.io.Directory;
import com.asofterspace.toolbox.io.File;
import com.asofterspace.toolbox.io.JSON;
import com.asofterspace.toolbox.io.JsonParseException;
import com.asofterspace.toolbox.utils.Record;
import com.asofterspace.toolbox.web.WebServer;
import com.asofterspace.toolbox.web.WebServerAnswer;
import com.asofterspace.toolbox.web.WebServerAnswerInJson;
import com.asofterspace.toolbox.web.WebServerRequestHandler;

import java.io.IOException;
import java.net.Socket;
import java.util.Collections;
import java.util.List;


public class ServerRequestHandler extends WebServerRequestHandler {

	private Database db;

	private Directory serverDir;


	public ServerRequestHandler(WebServer server, Socket request, Directory webRoot, Directory serverDir, Database db) {

		super(server, request, webRoot);

		this.db = db;

		this.serverDir = serverDir;
	}

	@Override
	protected void handlePost(String fileLocation) throws IOException {

		String jsonData = receiveJsonContent();

		if (jsonData == null) {
			respond(400);
			return;
		}


		// TODO :: catch some IO exceptions? (or make sure that none are thrown?)

		JSON json;
		try {
			json = new JSON(jsonData);
		} catch (JsonParseException e) {
			respond(400);
			return;
		}

		WebServerAnswer answer = null;

		try {

			switch (fileLocation) {

				/*
				case "/saveLostItem":
					db.saveLostItem(json);
					break;

				case "/saveFoundItem":
					db.saveFoundItem(json);
					break;

				case "/items":
					Record dbAnswer = db.getItems(json);
					if (dbAnswer == null) {
						respond(400);
						return;
					}
					JSON jsonAnswer = new JSON(dbAnswer);
					answer = new WebServerAnswerInJson(jsonAnswer);
					break;
				*/

				case "/availableGames":
					Record games = Record.emptyArray();
					games.append("Elfik");
					answer = new WebServerAnswerInJson(games);
					break;

				case "/startGame":
					switch (json.getString("gameName")) {
						case "elfik":
							Player player = Elfik.addPlayer(json.getString("playerName"));
							answer = new WebServerAnswerInJson("{\"token\": \"" + player.getToken() + "\", \"id\": " + player.getId() + "}");
							Elfik.sendMsgToPlayersExcept(new JSON("{\"action\": \"playerJoined\", \"id\": " + player.getId() + ", \"name\": \"" + player.getName() + "\"}"), player);
							String playerListStr = "";
							String sep = "";
							for (Player curPlayer : Elfik.getPlayers()) {
								playerListStr += sep + "{\"id\": " + curPlayer.getId() + ", \"name\": \"" + curPlayer.getName() + "\"}";
								sep = ",";
							}
							Elfik.sendMsgToPlayer(new JSON("{\"action\": \"playerList\", \"players\": [" + playerListStr + "]}"), player);
							break;
						default:
							respond(400);
							break;
					}
					break;

				case "/commLoop":
					Player player = GameCtrl.getPlayer(json.getString("token"));
					if (player == null) {
						respond(401);
						return;
					}
					List<Record> actions = json.getArray("actions");
					for (Record action : actions) {
						System.out.println(action);
						if (player instanceof ElfikPlayer) {
							ElfikPlayer elfikPlayer = (ElfikPlayer) player;
							switch (action.getString("action")) {

								// the player has chosen a character
								case "chooseCharacter":
									elfikPlayer.setCharName(action.getString("charName"));
									if (Elfik.allPlayersChoseChars()) {
										Elfik.startGame();
									}
									break;

								case "shuffleIntoDeck":
									List<Record> cardsToShuffle = action.getArray("cards");
									Collections.shuffle(cardsToShuffle, Elfik.getRand());
									action.set("cards", cardsToShuffle);
									Elfik.sendMsgToPlayers(action);
									break;

								// in the following cases, a player tells us something, and we forward it
								// to everyone else:
								case "draw":
								case "discard":
								case "moveToTable":
								case "grabOntoHand":
								case "setLife":
									action.set("player", player.getId());
									Elfik.sendMsgToPlayersExcept(action, player);
									break;
							}
						}
					}
					answer = new WebServerAnswerInJson(player.flushMsgs());
					break;

				default:
					respond(404);
					return;
			}

		} catch (JsonParseException e) {
			respond(403);
			return;
		}

		if (answer == null) {
			answer = new WebServerAnswerInJson("{\"success\": true}");
		}

		respond(200, answer);
	}

	@Override
	protected File getFileFromLocation(String location, String[] arguments) {

		String locEquiv = getWhitelistedLocationEquivalent(location);

		// if no root is specified, then we are just not serving any files at all
		// and if no location equivalent is found on the whitelist, we are not serving this request
		if ((webRoot != null) && (locEquiv != null)) {

			// serves images and PDFs directly from the server dir, rather than the deployed dir
			if (locEquiv.toLowerCase().endsWith(".jpg") || locEquiv.toLowerCase().endsWith(".pdf")) {
				File result = new File(serverDir, locEquiv);
				if (result.exists()) {
					return result;
				}
			}

			// actually get the file
			return webRoot.getFile(locEquiv);
		}

		// if the file was not found on the whitelist, do not return it
		// - even if it exists on the server!
		return null;
	}
}
