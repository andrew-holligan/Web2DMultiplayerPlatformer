import { APIColyseus } from "./api/colyseus";

import "./style.css";

const api = new APIColyseus();
await api.joinOrCreate();
