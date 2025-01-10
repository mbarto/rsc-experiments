import { use, useState, useEffect } from "react";
import { createRoot } from "react-dom/client";
import {
  createFromFetch as reactCreateFromFetch,
  encodeReply,
} from "react-server-dom-webpack/client";

const initialContentFetchPromise = fetch("/rsc");

function createFromFetch(promise) {
  return reactCreateFromFetch(promise, {
    moduleBaseURL: window.location.origin,
    callServer,
  });
}

const initialContentPromise = createFromFetch(initialContentFetchPromise);

function updatePage() {
  console.error("updatePage not implemented");
}

async function callServer(id, args) {
  const fetchPromise = fetch(`/action`, {
    method: "POST",
    headers: { "rsc-action": id },
    body: await encodeReply(args),
  });
  const actionResponsePromise = createFromFetch(fetchPromise);
  const { returnValue } = await actionResponsePromise;
  updatePage(actionResponsePromise);

  return returnValue;
}

function Root() {
  const [contentPromise, setContentPromise] = useState(initialContentPromise);
  useEffect(() => {
    updatePage = (newPage) => {
      setContentPromise(newPage);
    };
  }, []);

  const content = use(contentPromise);
  return content.root ?? content;
}

const root = createRoot(document.getElementById("root"));
root.render(<Root />);
