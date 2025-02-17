import { Room, Client } from "@colyseus/core";

import { GameState } from "./schema/GameState";
import { GameConfig } from "./schema/GameConfig";

import { GameStateType } from "./schema/enums/GameStateType";
import { ActionType } from "./schema/enums/ActionType";

export class GameRoom extends Room<GameState> {
	maxClients = 4;

	onCreate(options: any) {
		console.log("room", this.roomId, "created!");

		this.setState(
			new GameState({
				id: this.roomId,
				state: GameStateType.WAITING,
				config: new GameConfig({
					playerSpeed: 1.0,
				}),
			})
		);

		// EVENT HANDLERS

		this.onMessage(ActionType.MOVE, (client, message) => {
			console.log(client.sessionId, "moved!");
		});

		this.onMessage(ActionType.JUMP, (client, message) => {
			console.log(client.sessionId, "jumped!");
		});
	}

	onJoin(client: Client, options: any) {
		console.log(client.sessionId, "joined!");
	}

	onLeave(client: Client, consented: boolean) {
		console.log(client.sessionId, "left!");
	}

	onDispose() {
		console.log("room", this.roomId, "disposing...");
	}
}
