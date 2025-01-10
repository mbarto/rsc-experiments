#!/usr/bin/env node
import Fastify from "fastify";
import FastifyVite from "@fastify/vite";
import { renderToPipeableStream } from "react-server-dom-webpack/server";
import { createElement as h, Suspense, Fragment } from "react";

async function Async({ counter }) {
  await new Promise((r) => setTimeout(r, 1000));
  return h(
    Fragment,
    null,
    h("p", null, `Counter: ${counter}`),
    counter < 20
      ? h(
          Suspense,
          { fallback: "Loading..." },
          h(Async, { counter: counter + 1 })
        )
      : undefined
  );
}

function App() {
  return h(
    "div",
    null,
    h(Suspense, { fallback: "Loading..." }, h(Async, { counter: 0 }))
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
    const { pipe } = renderToPipeableStream(h(App, {}));
    pipe(reply.raw);
  });

  await server.vite.ready();
  return server;
}

const server = await main();
await server.listen({ port: 3000 });
