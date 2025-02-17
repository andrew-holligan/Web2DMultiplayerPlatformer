import Matter from "matter-js";
import { MapSchema } from "@colyseus/schema";

import { GameMap } from "../../../shared/map/GameMap";
import { Entity } from "../rooms/schema/Entity";

export class GameEngine {
	private readonly engine: Matter.Engine;
	private readonly entities: Map<string, Matter.Body>;
	private readonly spawns: { x: number; y: number }[] = [];

	constructor(map: GameMap) {
		this.engine = Matter.Engine.create();
		this.entities = new Map<string, Matter.Body>();
		this.initMap(map);
		this.initCollisions();
	}

	// INITIALIZATION

	private initMap(map: GameMap): void {
		map.tiles.forEach((tile) => {
			if (tile.isSpawn()) {
				this.spawns.push({ x: tile.x, y: tile.y });
			}
			if (!tile.isCollidable()) return;
			const entity = Matter.Bodies.rectangle(
				tile.x * map.tileWidth,
				tile.y * map.tileHeight,
				map.tileWidth,
				map.tileHeight,
				{ isStatic: true }
			);
			Matter.World.add(this.engine.world, entity);
		});
	}

	private initCollisions(): void {}

	// ADD ENTITIES

	private addEntity({
		pos,
		vel,
		width,
		height,
	}: {
		pos: { x: number; y: number };
		vel: { x: number; y: number };
		width: number;
		height: number;
	}): Matter.Body {
		const entity = Matter.Bodies.rectangle(pos.x, pos.y, width, height, {
			velocity: vel,
		});
		Matter.Body.setVelocity(entity, vel);
		Matter.World.add(this.engine.world, entity);
		this.entities.set(entity.id.toString(), entity);
		return entity;
	}

	addPlayer({
		pos,
		vel,
		width,
		height,
	}: {
		pos: { x: number; y: number };
		vel: { x: number; y: number };
		width: number;
		height: number;
	}): string {
		const entity = this.addEntity({ pos, vel, width, height });
		return entity.id.toString();
	}

	// REMOVE ENTITIES

	removeEntity(id: string): void {
		const entity = this.entities.get(id);
		if (!entity) return;
		Matter.World.remove(this.engine.world, entity);
		this.entities.delete(id);
	}

	// UPDATE

	update(delta: number, colyseusEntities: MapSchema<Entity, string>): void {
		Matter.Engine.update(this.engine, delta);
		this.updateColyseusEntities(colyseusEntities);
	}

	private updateColyseusEntities(colyseusEntities: MapSchema<Entity, string>): void {
		colyseusEntities.forEach((entity, id) => {
			const matterEntity = this.entities.get(id);
			if (!matterEntity) return;
			entity.pos.x = matterEntity.position.x;
			entity.pos.y = matterEntity.position.y;
			entity.vel.x = matterEntity.velocity.x;
			entity.vel.y = matterEntity.velocity.y;
		});
	}

	// EVENT HANDLERS

	handleJump(id: string): void {
		const entity = this.entities.get(id);
		if (!entity) return;
		Matter.Body.setVelocity(entity, { x: entity.velocity.x, y: -10 });
	}

	handleLeft(id: string): void {
		const entity = this.entities.get(id);
		if (!entity) return;
		Matter.Body.setVelocity(entity, { x: -5, y: entity.velocity.y });
	}

	handleRight(id: string): void {
		const entity = this.entities.get(id);
		if (!entity) return;
		Matter.Body.setVelocity(entity, { x: 5, y: entity.velocity.y });
	}

	// CLEANUP

	dispose(): void {
		Matter.World.clear(this.engine.world, false);
		Matter.Engine.clear(this.engine);
	}

	// MISC

	getRandomSpawn(): { x: number; y: number } {
		return this.spawns[Math.floor(Math.random() * this.spawns.length)];
	}
}
