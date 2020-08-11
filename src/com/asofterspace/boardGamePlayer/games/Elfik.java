/**
 * Unlicensed code created by A Softer Space, 2020
 * www.asofterspace.com/licenses/unlicense.txt
 */
package com.asofterspace.boardGamePlayer.games;

import com.asofterspace.toolbox.io.Directory;
import com.asofterspace.toolbox.io.File;
import com.asofterspace.toolbox.utils.Record;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Random;


public class Elfik {

	private static int playerNum = 0;

	private static List<ElfikPlayer> players = new ArrayList<>();

	private static Random rand = new Random();


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

	public static boolean allPlayersChoseChars() {

		for (ElfikPlayer player : players) {
			if (player.getCharName() == null) {
				return false;
			}
		}

		return true;
	}

	public static void sendMsgToPlayersExcept(Record msg, Player doNotSendTo) {
		for (Player player : players) {
			if (!doNotSendTo.equals(player)) {
				player.addMsg(msg);
			}
		}
	}

	public static void sendMsgToPlayers(Record msg) {
		for (Player player : players) {
			player.addMsg(msg);
		}
	}

	public static void sendMsgToPlayer(Record msg, Player sendTo) {
		sendTo.addMsg(msg);
	}

	private static List<String> getShuffledStack(String stackName) {

		boolean recursively = true;
		Directory dir = new Directory("deployed/games/elfik/" + stackName);
		List<File> cards = dir.getAllFiles(recursively);

		List<String> cardNames = new ArrayList<>();
		for (File card : cards) {
			cardNames.add(card.getLocalFilename());
		}

		Collections.shuffle(cardNames, rand);

		return cardNames;
	}

	public static void startGame() {

		List<String> forestCardNames = getShuffledStack("forest");
		List<String> itemCardNames = getShuffledStack("item");
		List<String> skillCardNames = getShuffledStack("skill");
		List<String> mountainCardNames = getShuffledStack("mountain");

		Record msg = Record.emptyObject();
		msg.set("action", "start");
		msg.set("forestCards", forestCardNames);
		msg.set("itemCards", itemCardNames);
		msg.set("skillCards", skillCardNames);
		msg.set("mountainCards", mountainCardNames);

		sendMsgToPlayers(msg);

		// let each player draw 8 skill cards
		int offset = 0;
		int drawAmount = 8;
		for (Player player : players) {
			msg = Record.emptyObject();
			msg.set("action", "drawSkillCards");
			msg.set("offset", offset);
			msg.set("amount", drawAmount);
			sendMsgToPlayer(msg, player);
			offset += drawAmount;
		}
	}

}
