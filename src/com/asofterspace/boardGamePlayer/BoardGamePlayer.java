/**
 * Unlicensed code created by A Softer Space, 2020
 * www.asofterspace.com/licenses/unlicense.txt
 */
package com.asofterspace.boardGamePlayer;

import com.asofterspace.boardGamePlayer.web.Server;
import com.asofterspace.toolbox.io.Directory;
import com.asofterspace.toolbox.io.JSON;
import com.asofterspace.toolbox.io.JsonFile;
import com.asofterspace.toolbox.io.JsonParseException;
import com.asofterspace.toolbox.Utils;
import com.asofterspace.toolbox.web.WebTemplateEngine;

import java.util.List;


public class BoardGamePlayer {

	public final static String DATA_DIR = "data";
	public final static String SERVER_DIR = "server";
	public final static String WEB_ROOT_DIR = "deployed";

	public final static String PROGRAM_TITLE = "BoardGamePlayer";
	public final static String VERSION_NUMBER = "0.0.0.2(" + Utils.TOOLBOX_VERSION_NUMBER + ")";
	public final static String VERSION_DATE = "19. Jul 2020 - 20. Jul 2020";

	public static void main(String[] args) {

		// let the Utils know in what program it is being used
		Utils.setProgramTitle(PROGRAM_TITLE);
		Utils.setVersionNumber(VERSION_NUMBER);
		Utils.setVersionDate(VERSION_DATE);

		if (args.length > 0) {
			if (args[0].equals("--version")) {
				System.out.println(Utils.getFullProgramIdentifierWithDate());
				return;
			}

			if (args[0].equals("--version_for_zip")) {
				System.out.println("version " + Utils.getVersionNumber());
				return;
			}
		}


		System.out.println("Looking at directories...");

		Directory dataDir = new Directory(DATA_DIR);

		Directory origDir = new Directory(SERVER_DIR);

		Directory webRoot = new Directory(WEB_ROOT_DIR);


		try {
			System.out.println("Loading database...");

			Database database = new Database(dataDir);

			JsonFile jsonConfigFile = new JsonFile(origDir, "webengine.json");
			JSON jsonConfig = jsonConfigFile.getAllContents();


			System.out.println("Templating the web application...");

			WebTemplateEngine engine = new WebTemplateEngine(origDir, jsonConfig);

			engine.compileTo(webRoot);


			System.out.println("Starting the server...");

			Server server = new Server(webRoot, database);

			List<String> whitelist = jsonConfig.getArrayAsStringList("files");

			server.setWhitelist(whitelist);

			boolean async = false;

			server.serve(async);


			System.out.println("Server done, all shut down and cleaned up! Have a nice day! :)");

		} catch (JsonParseException e) {

			System.out.println("Oh no! The input could not be parsed: " + e);
		}
	}

}
