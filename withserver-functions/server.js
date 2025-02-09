#!/usr/bin/env node
import Fastify from "fastify";
import FastifyVite from "@fastify/vite";
import FastifyMultipart from "@fastify/multipart";
import { renderToPipeableStream } from "react-server-dom-webpack/server";
import { createElement as h } from "react";
import { MyClientComponent } from "./client/my-client-component.js";
import { fun } from "./server/functions.js";

function App() {
  return h("div", null, h(MyClientComponent, { fun }));
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

  server.post("/functions", async (req, reply) => {
    const serverReference = req.headers["rsc-function"];
    const [filepath, name] = serverReference.split("#");
    const fun = (await import(filepath))[name];
    const result = await fun();
    const { pipe } = renderToPipeableStream(result, {
      [`${moduleBasePath}/my-client-component.js#MyClientComponent`]: {
        id: "./my-client-component.js",
        chunks: ["./my-client-component.js"],
        name: "MyClientComponent",
      },
    });
    pipe(reply.raw);
    await new Promise((resolve) => reply.raw.on("finish", resolve));
  });

  server.get("/rsc", (_, reply) => {
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
