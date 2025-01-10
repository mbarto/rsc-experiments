#!/usr/bin/env node
import Fastify from "fastify";
import FastifyVite from "@fastify/vite";
import { renderToPipeableStream } from "react-server-dom-webpack/server";
import { createElement as h } from "react";
import { MyClientComponent } from "./client/my-client-component.js";

function App() {
  return h(
    "div",
    null,
    h("h1", null, "Hello, world!"),
    h(MyClientComponent, { content: "Click me!" })
  );
}

export async function main() {
  const server = Fastify();

  await server.register(FastifyVite, {
    root: import.meta.url,
    dev: true,
    spa: true,
  });

  server.get("/", (_, reply) => {
    return reply.html();
  });

  server.get("/rsc", (_, reply) => {
    const moduleBasePath = new URL("./client", import.meta.url).href;
    const { pipe } = renderToPipeableStream(h(App), {
      [`${moduleBasePath}/my-client-component.js#MyClientComponent`]: {
        id: "./my-client-component.js",
        chunks: ["./my-client-component.js"],
        name: "MyClientComponent",
      },
    });
    pipe(reply.raw);
  });

  await server.vite.ready();
  return server;
}

const server = await main();
await server.listen({ port: 3000 });
