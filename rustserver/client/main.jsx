import { use } from "react";
import { createRoot } from "react-dom/client";
import { createFromFetch } from "react-server-dom-webpack/client";

const initialContentFetchPromise = fetch("/rsc");
const initialContentPromise = createFromFetch(initialContentFetchPromise);

function Root() {
  const content = use(initialContentPromise);
  return content;
}

const root = createRoot(document.getElementById("root"));
root.render(<Root />);
