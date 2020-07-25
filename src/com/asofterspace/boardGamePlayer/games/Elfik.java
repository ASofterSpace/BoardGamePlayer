/**
 * Unlicensed code created by A Softer Space, 2020
 * www.asofterspace.com/licenses/unlicense.txt
 */
package com.asofterspace.boardGamePlayer.games;

import java.util.ArrayList;
import java.util.List;


public class Elfik {

	private static int playerNum = -1;

	private static List<String> players = new ArrayList<>();


	public static int addPlayer(String playerName) {

		playerNum++;

		players.add(playerName);

		return playerNum;
	}

}
