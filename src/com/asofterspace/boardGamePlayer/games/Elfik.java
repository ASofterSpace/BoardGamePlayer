/**
 * Unlicensed code created by A Softer Space, 2020
 * www.asofterspace.com/licenses/unlicense.txt
 */
package com.asofterspace.boardGamePlayer.games;

import java.util.ArrayList;
import java.util.List;


public class Elfik {

	private static int playerNum = 0;

	private static List<Player> players = new ArrayList<>();


	public static int addPlayer(String playerName) {

		Player player = new Player(playerNum, playerName);

		players.add(player);

		playerNum++;

		return player.getId();
	}

	public static void setCharacter(int playerId, String charName) {

		for (int i = 0; i < playerNum; i++) {
			if (players.get(i).getId() == playerId) {
				players.get(i).setCharName(charName);
			}
		}
	}

}
