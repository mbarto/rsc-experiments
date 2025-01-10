#!/usr/bin/env node
import Fastify from "fastify";
import { renderToPipeableStream } from "react-server-dom-webpack/server";
import { createElement as h } from "react";
import { Page } from "./app.js";

export async function main() {
  const server = Fastify();

  server.get("/", (_, reply) => {
    return reply.html();
  });

  server.get("/rsc", (req, reply) => {
    const page = Number(req.query.page);
    const { pipe } = renderToPipeableStream(h(Page, { page }));
    pipe(reply.raw);
  });

  return server;
}

const server = await main();
await server.listen({ port: 4000 });
