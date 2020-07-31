/**
 * Unlicensed code created by A Softer Space, 2020
 * www.asofterspace.com/licenses/unlicense.txt
 */
package com.asofterspace.boardGamePlayer.games;



public class ElfikPlayer extends Player {

	// the name of the character the player chose
	private String charName;


	public ElfikPlayer(int id, String name) {
		super(id, name);
	}

	public String getCharName() {
		return charName;
	}

	public void setCharName(String charName) {
		this.charName = charName;
	}
}
