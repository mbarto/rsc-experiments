import { use } from "react";
import { createRoot } from "react-dom/client";
import { createFromFetch } from "react-server-dom-webpack/client";

const initialContent = createFromFetch(fetch("rsc"), {
  moduleBaseURL: window.location.origin,
});

function Root() {
  return use(initialContent);
}

createRoot(document.getElementById("root")).render(<Root />);
