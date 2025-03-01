import assert from "assert";
import { ColyseusTestServer, boot } from "@colyseus/testing";

// import your "app.config.ts" file here.
import appConfig from "../src/app.config";
import { GameState } from "../src/rooms/schema/GameState";

describe("testing your Colyseus app", () => {
	let colyseus: ColyseusTestServer;

	before(async () => (colyseus = await boot(appConfig)));
	after(async () => colyseus.shutdown());

	beforeEach(async () => await colyseus.cleanup());

	it("connecting into a room", async () => {
		// `room` is the server-side Room instance reference.
		const room = await colyseus.createRoom<GameState>("room", {});

		// `client1` is the client-side `Room` instance reference (same as JavaScript SDK)
		const client1 = await colyseus.connectTo(room);

		// make your assertions
		assert.strictEqual(client1.sessionId, room.clients[0].sessionId);
	});
});
