// Runs the in-browser model off the main thread. Version must match inference.js.
import { WebWorkerMLCEngineHandler } from "https://esm.run/@mlc-ai/web-llm@0.2.85";

const handler = new WebWorkerMLCEngineHandler();
self.onmessage = msg => handler.onmessage(msg);
