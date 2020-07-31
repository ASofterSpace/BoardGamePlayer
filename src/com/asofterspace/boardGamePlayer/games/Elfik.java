/**
 * Unlicensed code created by A Softer Space, 2020
 * www.asofterspace.com/licenses/unlicense.txt
 */
package com.asofterspace.boardGamePlayer.games;

import com.asofterspace.toolbox.utils.Record;

import java.util.ArrayList;
import java.util.List;


public class Elfik {

	private static int playerNum = 0;

	private static List<ElfikPlayer> players = new ArrayList<>();


	// returns the token that identifies the player
	public static ElfikPlayer addPlayer(String playerName) {

		ElfikPlayer player = new ElfikPlayer(playerNum, playerName);

		players.add(player);

		playerNum++;

		GameCtrl.addPlayer(player);

		return player;
	}

	public static List<ElfikPlayer> getPlayers() {
		return players;
	}

	public static void sendMsgToPlayersExcept(Record msg, Player doNotSendTo) {
		for (Player player : players) {
			if (!doNotSendTo.equals(player)) {
				player.addMsg(msg);
			}
		}
	}

	public static void sendMsgToPlayer(Record msg, Player sendTo) {
		sendTo.addMsg(msg);
	}

}
