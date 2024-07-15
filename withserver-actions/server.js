#!/usr/bin/env node
import Fastify from "fastify";
import FastifyVite from "@fastify/vite";
import FastifyMultipart from "@fastify/multipart";
import {
  renderToPipeableStream,
  decodeReply,
} from "react-server-dom-esm/server";
import { createElement as h } from "react";
import { MyClientComponent } from "./client/my-client-component.js";
import { myAction } from "./server/actions.js";

function App({ item = "" }) {
  return h(
    "div",
    null,
    h("h1", null, "Hello, world!"),
    h(MyClientComponent, { text: "placeholder", action: myAction }),
    h("p", null, `item: ${item}`)
  );
}

export async function main() {
  const server = Fastify();

  await server.register(FastifyVite, {
    root: import.meta.url,
    dev: true,
    spa: true,
  });

  await server.register(FastifyMultipart, { attachFieldsToBody: true });

  server.get("/", (_, reply) => {
    return reply.html();
  });

  const moduleBasePath = new URL("./client", import.meta.url).href;

  server.post("/action", async (req, reply) => {
    const serverReference = req.headers["rsc-action"];
    const [filepath, name] = serverReference.split("#");
    const action = (await import(filepath))[name];
    const formData = await req.formData();
    const args = await decodeReply(formData, moduleBasePath);
    const result = await action(...args);
    const root = h(App, { item: result.message });
    const payload = { root, returnValue: result };
    const { pipe } = renderToPipeableStream(payload, moduleBasePath);
    pipe(reply.raw);
    await new Promise((resolve) => reply.raw.on("finish", resolve));
  });

  server.get("/rsc", (_, reply) => {
    const { pipe } = renderToPipeableStream(h(App), moduleBasePath);
    pipe(reply.raw);
  });

  await server.vite.ready();
  return server;
}

const server = await main();
await server.listen({ port: 3000 });
