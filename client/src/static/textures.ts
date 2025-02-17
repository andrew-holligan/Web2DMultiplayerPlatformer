import * as PIXI from "pixi.js";

import { TileType } from "../../../server/src/rooms/schema/enums/TileType";
import { PlayerSkinType } from "../../../server/src/rooms/schema/enums/PlayerSkinType";

export abstract class Textures {
	public static readonly textures: Map<string, PIXI.Texture> = new Map<string, PIXI.Texture>();

	static async initTextures() {
		const promises: Promise<any>[] = [];

		const tileTypes = Object.values(TileType).filter((t) => typeof t !== "string");
		for (const type of tileTypes) {
			const key = TileType[type];
			promises.push(
				PIXI.Assets.load(`/images/tiles/${key}.svg`).then((texture) => {
					this.textures.set(key, texture);
				})
			);
		}

		const playerSkinTypes = Object.values(PlayerSkinType).filter((t) => typeof t !== "string");
		for (const type of playerSkinTypes) {
			const key = PlayerSkinType[type];
			promises.push(
				PIXI.Assets.load(`/images/players/${key}.svg`).then((texture) => {
					this.textures.set(key, texture);
				})
			);
		}

		await Promise.all(promises);
	}
}
