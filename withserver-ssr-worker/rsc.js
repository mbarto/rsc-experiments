import { Writable } from "stream";
import { parentPort } from "worker_threads";
import { createElement as h } from "react";
import { renderToPipeableStream } from "react-server-dom-webpack/server";
import { Page } from "./app.js";

async function renderApp(requestId, page) {
  return new Promise((resolve) => {
    const { pipe } = renderToPipeableStream(h(Page, { page }));
    const writable = new Writable({
      write(chunk, _, callback) {
        parentPort.postMessage({
          type: "chunk",
          data: chunk.toString("utf-8"),
          requestId,
        });
        callback();
      },
    });
    writable.on("finish", () => {
      parentPort.postMessage({ type: "end", requestId });
      resolve();
    });
    pipe(writable);
  });
}

async function handleMessage(message) {
  if (message.type === "rsc") {
    await renderApp(message.requestId, Number(message.page));
  }
}

parentPort.on("message", async (message) => {
  try {
    const result = await handleMessage(message);
    return result;
  } catch (error) {
    console.error(error);
    parentPort.postMessage({
      type: "error",
      error: error.message,
      requestId: message.requestId,
    });
  }
});
