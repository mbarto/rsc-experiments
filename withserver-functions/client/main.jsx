import { use } from "react";
import { createRoot } from "react-dom/client";
import { createFromFetch, encodeReply } from "react-server-dom-webpack/client";

async function callServer(id, args) {
  const fetchPromise = fetch(`/functions`, {
    method: "POST",
    headers: { "rsc-function": id },
    body: await encodeReply(args),
  });
  const actionResponsePromise = createFromFetch(fetchPromise);
  const returnValue = await actionResponsePromise;

  return returnValue;
}

const initialContent = createFromFetch(fetch("/rsc"), {
  moduleBaseURL: window.location.origin,
  callServer,
});

function Root() {
  const content = use(initialContent);
  return content;
}

const root = createRoot(document.getElementById("root"));
root.render(<Root />);
