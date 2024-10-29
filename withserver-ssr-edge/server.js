#!/usr/bin/env node
import Fastify from "fastify";
import FastifyVite from "@fastify/vite";
import { createElement as h } from "react";
import { renderToString } from "react-dom/server";
import { Page, App } from "./app.js";

const viteScript = `<script type="module">
import RefreshRuntime from "/@react-refresh"
RefreshRuntime.injectIntoGlobalHook(window)
window.$RefreshReg$ = () => {}
window.$RefreshSig$ = () => (type) => type
window.__vite_plugin_react_preamble_installed__ = true
</script>
<script type="module" src="/@vite/client"></script>`;

export async function main() {
  const server = Fastify();

  await server.register(FastifyVite, {
    root: import.meta.url,
    dev: true,
    spa: true,
  });

  async function fetchRsc(req, page) {
    const rscUrl = new URL(
      `${req.protocol}://${req.hostname.replace(
        "3000",
        "4000"
      )}/rsc?page=${page}`
    );
    const rscResponse = await fetch(rscUrl);
    return await rscResponse.text();
  }

  server.get("/rsc", async (req, reply) => {
    const rscContent = await fetchRsc(req, req.query.page);
    reply.send(rscContent);
  });

  server.get("/", async (req, reply) => {
    const rscContent = await fetchRsc(req, 0);

    let page = await renderToString(h(App, null, [h(Page, { page: 0 })]));
    const html = `<!doctype html>
<html lang="en">
	<head>
    <link rel="stylesheet" href="./main.css" />
    ${viteScript}
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>RSC Experiments - SSR with worker</title>
  </head>
	<body>
		<div id="root">${page}</div>
      <script id="initial-rsc" type="text/plain">${rscContent}</script>
      <script type="module" crossorigin src="/main.jsx"></script>
    </body></html>`;
    return reply.type("text/html").send(html);
  });

  await server.vite.ready();
  return server;
}

const server = await main();
await server.listen({ port: 3000 });
