/**
 * Unlicensed code created by A Softer Space, 2020
 * www.asofterspace.com/licenses/unlicense.txt
 */
package com.asofterspace.boardGamePlayer;

import com.asofterspace.toolbox.io.Directory;
import com.asofterspace.toolbox.io.JSON;
import com.asofterspace.toolbox.io.JsonFile;
import com.asofterspace.toolbox.io.JsonParseException;
import com.asofterspace.toolbox.utils.Record;


public class Database {

	private static final String DB_FILE_NAME = "database.json";

	private Directory dataDir;

	private JsonFile dbFile;

	private JSON root;

	/* here, put something like e.g.:
	private List<Object> objects;
	*/


	public Database(Directory dataDir) {

		this.dataDir = dataDir;

		dataDir.create();

		this.dbFile = new JsonFile(dataDir, DB_FILE_NAME);
		this.dbFile.createParentDirectory();
		try {
			this.root = dbFile.getAllContents();
		} catch (JsonParseException e) {
			System.err.println("Oh no!");
			e.printStackTrace(System.err);
			System.exit(1);
		}

		/* here, put something like e.g.:

		List<Record> objectsRecs = root.getArray("objects");

		this.objects = new ArrayList<>();

		for (Record rec : objectsRecs) {
			objects.add(new Object(rec));
		}
		*/
	}

	public Record getRoot() {
		return root;
	}

	public void save() {

		root.makeObject();

		/* here, put something like e.g.:

		List<Record> objectsRecs = new ArrayList<>();

		for (Object obj : objects) {
			objectsRecs.add(obj.toRecord());
		}

		root.set("objects", objectsRecs);
		*/

		dbFile.setAllContents(root);
		dbFile.save();
	}
}
