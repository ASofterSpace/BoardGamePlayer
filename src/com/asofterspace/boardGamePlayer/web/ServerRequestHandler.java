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
import java.util.List;


public class ServerRequestHandler extends WebServerRequestHandler {

	private Database db;


	public ServerRequestHandler(WebServer server, Socket request, Directory webRoot, Database db) {

		super(server, request, webRoot);

		this.db = db;
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
							answer = new WebServerAnswerInJson("{\"token\": \"" + player.getToken() + "\"}");
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
						if (player instanceof ElfikPlayer) {
							ElfikPlayer elfikPlayer = (ElfikPlayer) player;
							switch (action.getString("action")) {
								case "chooseCharacter":
									elfikPlayer.setCharName(action.getString("charName"));
									if (Elfik.allPlayersChoseChars()) {
										Elfik.startGame();
									}
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

		/*
		// TODO :: this does not go through the whitelist
		// maybe do some sanity checking before passing this to the File API?
		// (to ensure that no maliciously crafted string can do... something? ^^)
		if (location.startsWith("/") && location.endsWith(".jpg")) {

			File result = new File(db.getDataDirectory(), location.substring(1));

			if (result.exists()) {
				return result;
			}
		}
		*/

		return super.getFileFromLocation(location, arguments);
	}
}
