import * as PIXI from "pixi.js";
import { Room } from "colyseus.js";

import { GameMap } from "../../../shared/map/GameMap";
import { GameState } from "../../../server/src/rooms/schema/GameState";
import { Entity as ServerEntity } from "../../../server/src/rooms/schema/Entity";
import { Player as ServerPlayerEntity } from "../../../server/src/rooms/schema/Player";
import { TileType } from "../../../server/src/rooms/schema/enums/TileType";
import { ActionType } from "../../../server/src/rooms/schema/enums/ActionType";
import { EntityType } from "../../../server/src/rooms/schema/enums/EntityType";
import { map1 } from "../static/maps";
import { Textures } from "../static/textures";
import { Entity } from "./entities/entity";
import { Player } from "./entities/player";

const container = document.getElementById("app")!;

export class Game {
	private readonly room: Room<GameState>;
	private readonly app: PIXI.Application;
	private readonly world: PIXI.Container;
	private readonly entities: Map<string, Entity> = new Map<string, Entity>();

	constructor(room: Room<GameState>) {
		this.room = room;
		this.app = new PIXI.Application();
		this.world = new PIXI.Container();
	}

	async init() {
		await this.app.init({
			width: window.innerWidth,
			height: window.innerHeight,
			resizeTo: parent,
		});
		container.appendChild(this.app.canvas);
		this.app.stage.addChild(this.world);
		this.initMap();
		this.initEventHandlers();
		this.room.onStateChange((state) => this.update(state));
		this.app.start();
	}

	// INITIALIZATION

	private initMap() {
		const map = new GameMap(map1);
		map.tiles.forEach((tile) => {
			const sprite = new PIXI.Sprite(Textures.textures.get(TileType[tile.type]));
			sprite.position.x = tile.x * map.tileWidth;
			sprite.position.y = tile.y * map.tileHeight;
			sprite.width = map.tileWidth;
			sprite.height = map.tileHeight;
			sprite.anchor.set(0.5);
			this.world.addChild(sprite);
		});
	}

	private initEventHandlers() {
		window.addEventListener("keydown", (event) => {
			switch (event.key) {
				case " ":
				case "ArrowUp":
				case "w":
					this.room.send(ActionType.JUMP);
					break;

				case "ArrowLeft":
				case "a":
					this.room.send(ActionType.LEFT);
					break;

				case "ArrowRight":
				case "d":
					this.room.send(ActionType.RIGHT);
					break;
			}
		});
	}

	// GAME LOOP

	private update(state: GameState) {
		this.removeOldEntities(state);
		this.addOrUpdateEntities(state);
		this.updateCamera(state);
	}

	private removeOldEntities(state: GameState) {
		this.entities.forEach((entity, id) => {
			if (!state.entities.has(id)) {
				this.world.removeChild(entity.spriteContainer);
				this.entities.delete(id);
			}
		});
	}

	private addOrUpdateEntities(state: GameState) {
		state.entities.forEach((entity, id) => {
			if (!this.entities.has(id)) {
				this.addNewEntity(entity, id);
			} else {
				this.updateExistingEntity(entity, id);
			}
		});
	}

	private addNewEntity(entity: ServerEntity, id: string) {
		let newEntity: Entity;
		switch (entity.type) {
			case EntityType.PLAYER:
				newEntity = new Player(entity as ServerPlayerEntity);
				break;
			default:
				throw new Error(`Unknown entity type: ${entity.type}`);
		}
		this.world.addChild(newEntity.spriteContainer);
		this.entities.set(id, newEntity);
	}

	private updateExistingEntity(entity: ServerEntity, id: string) {
		const existingEntity = this.entities.get(id);
		if (!existingEntity) return;
		switch (entity.type) {
			case EntityType.PLAYER:
				(existingEntity as Player).updatePlayer(entity as ServerPlayerEntity);
				break;
			default:
				throw new Error(`Unknown entity type: ${entity.type}`);
		}
	}

	private updateCamera(state: GameState) {
		const playerEntityId = state.clientIdToEntityId.get(this.room.sessionId);
		if (!playerEntityId) return;
		const player = this.entities.get(playerEntityId);
		if (!player) return;
		// Smoothly interpolate camera movement
		this.world.x += (this.app.screen.width / 2 - player.spriteContainer.x - this.world.x) * 0.1;
		this.world.y += (this.app.screen.height / 2 - player.spriteContainer.y - this.world.y) * 0.1;
	}
}
