import { TileType } from "../../server/src/rooms/schema/enums/TileType";

export class GameTile {
	x: number;
	y: number;
	type: TileType;

	constructor({ x, y, type }: { x: number; y: number; type: TileType }) {
		this.x = x;
		this.y = y;
		this.type = type;
	}

	isSpawn() {
		return this.type === TileType.SPAWN;
	}

	isCollidable() {
		return this.type === TileType.PLATFORM;
	}
}
