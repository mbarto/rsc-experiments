import { use, useState, Suspense, useEffect } from "react";
import { createRoot } from "react-dom/client";
import {
  createFromFetch,
  createFromReadableStream,
} from "react-server-dom-esm/client";
import "./main.css";
import { App } from "../app.js";

function Root({ content }) {
  return use(content);
}
function Layout() {
  const [pagePromise, setPagePromise] = useState(null);

  const initialRsc = document.getElementById("initial-rsc").innerText;
  useEffect(() => {
    const encoder = new TextEncoder();

    const stream = new ReadableStream({
      start(controller) {
        const encoded = encoder.encode(initialRsc);
        controller.enqueue(encoded);
        controller.close();
      },
    });

    const initialContent = createFromReadableStream(stream);
    setPagePromise(initialContent);
  }, []);

  function setPage(page) {
    setPagePromise(createFromFetch(fetch(`rsc?page=${page}`)));
  }

  return (
    <App setPage={setPage}>
      {pagePromise ? (
        <Suspense fallback={<p>Loading...</p>}>
          <Root content={pagePromise} />
        </Suspense>
      ) : (
        <p>Click on a menu item</p>
      )}
    </App>
  );
}

createRoot(document.getElementById("root")).render(<Layout />);
