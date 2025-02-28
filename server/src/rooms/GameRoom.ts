import { Room, Client } from "@colyseus/core";

import * as constants from "../../../shared/constants/constants";
import { MapType } from "../../../shared/types/map";

import { GameEngine } from "../engine/engine";

import { EntityType } from "./schema/enums/EntityType";
import { ActionType } from "./schema/enums/ActionType";
import { PlayerSkinType } from "./schema/enums/PlayerSkinType";
import { GameState } from "./schema/GameState";
import { GameConfig } from "./schema/GameConfig";
import { Player } from "./schema/Player";
import { Vector } from "./schema/Vector";

export class GameRoom extends Room<GameState> {
	maxClients = 4;

	private readonly map: MapType = constants.map1;
	private readonly engine: GameEngine = new GameEngine(this.map);

	onCreate(options: any) {
		console.log("room", this.roomId, "created!");

		this.setState(
			new GameState({
				id: this.roomId,
				config: new GameConfig({
					playerSpeed: 0.2,
				}),
			})
		);
		this.setPatchRate(1000 / 60);
		this.onBeforePatch = () => {
			this.engine.update(this.clock.deltaTime, this.state.entities);
		};

		// EVENT HANDLERS

		this.onMessage(ActionType.JUMP, (client, message) => {
			// console.log(client.sessionId, "jumped!");
			const entityId = this.state.clientIdToEntityId.get(client.sessionId);
			if (!entityId) return;
			this.engine.handleJump(entityId, this.state.config.playerSpeed);
		});

		this.onMessage(ActionType.LEFT, (client, message) => {
			// console.log(client.sessionId, "moved left!");
			const entityId = this.state.clientIdToEntityId.get(client.sessionId);
			if (!entityId) return;
			this.engine.handleLeft(entityId, this.state.config.playerSpeed);
		});

		this.onMessage(ActionType.RIGHT, (client, message) => {
			// console.log(client.sessionId, "moved right!");
			const entityId = this.state.clientIdToEntityId.get(client.sessionId);
			if (!entityId) return;
			this.engine.handleRight(entityId, this.state.config.playerSpeed);
		});
	}

	onJoin(client: Client, options: any) {
		console.log(client.sessionId, "joined!");
		const spawn = this.engine.getRandomSpawn();
		const entityId = this.engine.addPlayer({
			x: spawn.x,
			y: spawn.y,
			width: this.map.meta.playerWidth,
			height: this.map.meta.playerHeight,
		});
		this.state.clientIdToEntityId.set(client.sessionId, entityId);
		this.state.entities.set(
			entityId,
			new Player({
				id: entityId,
				type: EntityType.PLAYER,
				pos: new Vector({ x: spawn.x, y: spawn.y }),
				vel: new Vector({ x: 0, y: 0 }),
				width: this.map.meta.playerWidth,
				height: this.map.meta.playerHeight,
				angle: 0,
				clientId: client.sessionId,
				skin: PlayerSkinType.PURPLE,
			})
		);
	}

	onLeave(client: Client, consented: boolean) {
		console.log(client.sessionId, "left!");
		const entityId = this.state.clientIdToEntityId.get(client.sessionId);
		if (!entityId) return;
		this.engine.removeEntity(entityId);
		this.state.entities.delete(entityId);
		this.state.clientIdToEntityId.delete(client.sessionId);
	}

	onDispose() {
		console.log("room", this.roomId, "disposing...");
		this.engine.dispose();
	}
}
