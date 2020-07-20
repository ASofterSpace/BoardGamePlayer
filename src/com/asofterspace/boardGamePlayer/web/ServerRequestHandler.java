/**
 * Unlicensed code created by A Softer Space, 2020
 * www.asofterspace.com/licenses/unlicense.txt
 */
package com.asofterspace.boardGamePlayer.web;

import com.asofterspace.boardGamePlayer.Database;
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

			default:
				respond(404);
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
