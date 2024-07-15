import { use, useState, useEffect, useActionState, useRef } from "react";
import { createRoot } from "react-dom/client";
import { createFromFetch as reactCreateFromFetch } from "react-server-dom-esm/client";

global.reactHooks = {
  useState,
  useEffect,
  useRef,
  useActionState,
};

function createFromFetch(promise) {
  return reactCreateFromFetch(promise, {
    moduleBaseURL: window.location.origin,
    callServer,
  });
}

function updatePage() {
  console.error("updatePage not implemented");
}

async function callServer(id, args) {
  const [, formData] = args;
  const text = formData.get("text");
  const fetchPromise = fetch(
    text === "error" ? `/rsc/action_${id}_error.rsc` : `/rsc/action_${id}.rsc`
  );
  const actionResponsePromise = createFromFetch(fetchPromise);
  const { returnValue } = await actionResponsePromise;
  updatePage(actionResponsePromise);

  return returnValue;
}

const initialContentPromise = createFromFetch(fetch("rsc/main.rsc"));

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

createRoot(document.getElementById("root")).render(<Root />);
