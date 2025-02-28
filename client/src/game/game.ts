import * as PIXI from "pixi.js";
import { Room } from "colyseus.js";

import { MapEntityType } from "../../../server/src/rooms/schema/enums/MapEntityType";
import { ActionType } from "../../../server/src/rooms/schema/enums/ActionType";
import { EntityType } from "../../../server/src/rooms/schema/enums/EntityType";
import { GameState as ServerGameState } from "../../../server/src/rooms/schema/GameState";
import { Entity as ServerEntity } from "../../../server/src/rooms/schema/Entity";
import { Player as ServerPlayerEntity } from "../../../server/src/rooms/schema/Player";

import * as constants from "../../../shared/constants/constants";
import { MapType } from "../../../shared/types/map";

import { Textures } from "../static/textures";

import { Entity } from "./entities/entity";
import { Player } from "./entities/player";

const container = document.getElementById("app")!;

export class Game {
	private readonly room: Room<ServerGameState>;
	private readonly app: PIXI.Application;
	private readonly world: PIXI.Container;
	private readonly entities: Map<string, Entity> = new Map<string, Entity>();
	private readonly keys: Set<string> = new Set<string>();

	constructor(room: Room<ServerGameState>) {
		this.room = room;
		this.app = new PIXI.Application();
		this.world = new PIXI.Container();
	}

	async init() {
		// Initialize PIXI app
		await this.app.init({
			width: window.innerWidth,
			height: window.innerHeight,
			resizeTo: parent,
			backgroundColor: 0xffffff,
		});
		this.app.stage.scale.set(constants.GAME_SCALE);
		container.appendChild(this.app.canvas);

		// Initialize world container
		this.world.position.set(
			this.app.screen.width / 2 / this.app.stage.scale.x,
			this.app.screen.height / 2 / this.app.stage.scale.y
		);
		this.app.stage.addChild(this.world);

		// Initialize
		this.initMap();
		this.initEventHandlers();

		// Game loop
		this.app.ticker.add(() => this.everyFrame());
		this.room.onStateChange((state) => this.update(state));
	}

	// INITIALIZATION

	private initMap() {
		const map: MapType = constants.map1;

		map.entities.forEach((entity) => {
			const spriteContainer = new PIXI.Container();
			spriteContainer.pivot.set(entity.width / 2, entity.height / 2);
			spriteContainer.position.set(entity.x, entity.y);
			spriteContainer.rotation = entity.angle;

			const sprite = new PIXI.Sprite(Textures.textures.get(MapEntityType[entity.type]));
			sprite.width = entity.width;
			sprite.height = entity.height;

			spriteContainer.addChild(sprite);
			this.world.addChild(spriteContainer);
		});
	}

	private initEventHandlers() {
		window.addEventListener("keydown", (e) => {
			this.keys.add(e.code);
		});
		window.addEventListener("keyup", (e) => {
			this.keys.delete(e.code);
		});
	}

	// GAME LOOP

	private everyFrame() {
		this.handleMovement();
	}

	private handleMovement() {
		if (this.keys.has("KeyW") || this.keys.has("ArrowUp") || this.keys.has("Space")) {
			this.room.send(ActionType.JUMP);
		}
		if (this.keys.has("KeyA") || this.keys.has("ArrowLeft")) {
			this.room.send(ActionType.LEFT);
		}
		if (this.keys.has("KeyD") || this.keys.has("ArrowRight")) {
			this.room.send(ActionType.RIGHT);
		}
	}

	// SERVER RESPONSE

	private update(state: ServerGameState) {
		this.removeOldEntities(state);
		this.addOrUpdateEntities(state);
		this.updateCamera(state);
	}

	private removeOldEntities(state: ServerGameState) {
		this.entities.forEach((entity, id) => {
			if (!state.entities.has(id)) {
				this.world.removeChild(entity.spriteContainer);
				this.entities.delete(id);
			}
		});
	}

	private addOrUpdateEntities(state: ServerGameState) {
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

	private updateCamera(state: ServerGameState) {
		const playerEntityId = state.clientIdToEntityId.get(this.room.sessionId);
		if (!playerEntityId) return;
		const player = this.entities.get(playerEntityId);
		if (!player) return;
		// Smoothly interpolate camera movement
		this.world.pivot.x += (player.spriteContainer.x - this.world.pivot.x) * 0.1;
		this.world.pivot.y += (player.spriteContainer.y - this.world.pivot.y) * 0.1;
	}
}
