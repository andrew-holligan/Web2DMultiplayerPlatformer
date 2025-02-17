import { GameTile } from "./GameTile";

export class GameMap {
	width: number;
	height: number;
	tileWidth: number;
	tileHeight: number;
	tiles: GameTile[];

	constructor(tilemapData: any) {
		this.width = tilemapData.width;
		this.height = tilemapData.height;
		this.tileWidth = tilemapData.tilewidth;
		this.tileHeight = tilemapData.tileheight;
		this.tiles = tilemapData.tiles.map(
			(tileType: number, i: number) =>
				new GameTile({
					x: i % this.width,
					y: Math.floor(i / this.width),
					type: tileType,
				})
		);
	}
}
