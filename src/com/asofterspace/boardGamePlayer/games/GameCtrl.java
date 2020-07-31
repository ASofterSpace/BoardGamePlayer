/**
 * Unlicensed code created by A Softer Space, 2020
 * www.asofterspace.com/licenses/unlicense.txt
 */
package com.asofterspace.boardGamePlayer.games;

import java.util.ArrayList;
import java.util.List;


/**
 * Meta-controller that controls and keeps track of all games and their players
 */
public class GameCtrl {

	private static List<Player> players = new ArrayList<>();


	public static void addPlayer(Player player) {

		players.add(player);
	}

	public static Player getPlayer(String token) {

		if (token == null) {
			return null;
		}

		for (Player player : players) {
			if (token.equals(player.getToken())) {
				return player;
			}
		}

		return null;
	}

}
