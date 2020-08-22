/**
 * Unlicensed code created by A Softer Space, 2020
 * www.asofterspace.com/licenses/unlicense.txt
 */
package com.asofterspace.boardGamePlayer.games;

import com.asofterspace.toolbox.utils.Record;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;


public class Player {

	// the player's id
	private int id;

	// a unique token that maps to a particular player playing a particular game
	private String token;

	// the self-given name of the player
	private String name;

	// the messages that are waiting for this player to consume
	private List<Record> msgs;


	public Player(int id, String name) {
		this.id = id;
		this.name = name;
		this.token = "" + UUID.randomUUID();
		this.msgs = new ArrayList<>();
	}

	public int getId() {
		return id;
	}

	public void setId(int id) {
		this.id = id;
	}

	public String getToken() {
		return token;
	}

	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}

	public synchronized void addMsg(Record msg) {
		this.msgs.add(msg);
	}

	public synchronized Record flushMsgs() {
		List<Record> result = this.msgs;
		this.msgs = new ArrayList<>();
		return Record.fromAnything(result);
	}

	public void awaitNothingOngoing() {
		while (this.msgs.size() > 0) {
			try {
				Thread.sleep(1000);
			} catch (InterruptedException e) {
				// whoops
			}
		}
	}

	@Override
	public boolean equals(Object other) {
		if (other == null) {
			return false;
		}
		if (other instanceof Player) {
			Player otherPlayer = (Player) other;
			if (this.id == otherPlayer.id) {
				return true;
			}
		}
		return false;
	}

	@Override
	public int hashCode() {
		return this.id;
	}

}
