import * as Colyseus from "colyseus.js";

import { GameState } from "../../../server/src/rooms/schema/GameState";

export class APIColyseus {
	private client: Colyseus.Client;

	constructor() {
		this.client = new Colyseus.Client("ws://localhost:2567");
	}

	async joinOrCreate(): Promise<Colyseus.Room<GameState>> {
		return await this.client.joinOrCreate<GameState>("room");
	}
}
