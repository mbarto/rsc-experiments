#!/usr/bin/env node
import Fastify from "fastify";
import FastifyVite from "@fastify/vite";
import { renderToPipeableStream } from "react-server-dom-esm/server";
import { createElement as h } from "react";

function App({ page }) {
  return h("h1", null, `Page ${page}`);
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

  server.get("/rsc", (req, reply) => {
    const page = req.query.page;
    const { pipe } = renderToPipeableStream(h(App, { page }));
    pipe(reply.raw);
  });

  await server.vite.ready();
  return server;
}

const server = await main();
await server.listen({ port: 3000 });
