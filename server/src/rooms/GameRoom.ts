import { Room, Client } from "@colyseus/core";

import { GameMap } from "../../../shared/map/GameMap";
import { GameEngine } from "../engine/engine";
import { map1 } from "../static/maps";
import { GameState } from "./schema/GameState";
import { GameConfig } from "./schema/GameConfig";
import { Player } from "./schema/Player";
import { Vector } from "./schema/Vector";
import { EntityType } from "./schema/enums/EntityType";
import { ActionType } from "./schema/enums/ActionType";
import { PlayerSkinType } from "./schema/enums/PlayerSkinType";

export class GameRoom extends Room<GameState> {
	maxClients = 4;

	private readonly map: GameMap = new GameMap(map1);
	private readonly engine: GameEngine = new GameEngine(this.map);

	onCreate(options: any) {
		console.log("room", this.roomId, "created!");

		this.setState(
			new GameState({
				id: this.roomId,
				config: new GameConfig({
					playerSpeed: 5.0,
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
			pos: { x: spawn.x * this.map.tileWidth, y: spawn.y * this.map.tileHeight },
			vel: { x: 0, y: 0 },
			width: this.map.playerWidth,
			height: this.map.playerHeight,
		});
		this.state.clientIdToEntityId.set(client.sessionId, entityId);
		this.state.entities.set(
			entityId,
			new Player({
				id: entityId,
				type: EntityType.PLAYER,
				pos: new Vector({ x: spawn.x * this.map.tileWidth, y: spawn.y * this.map.tileHeight }),
				vel: new Vector({ x: 0, y: 0 }),
				width: this.map.playerWidth,
				height: this.map.playerHeight,
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
