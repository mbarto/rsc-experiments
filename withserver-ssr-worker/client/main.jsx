import { use, useState, Suspense } from "react";
import { createRoot } from "react-dom/client";
import { createFromFetch } from "react-server-dom-esm/client";
import "./main.css";
import { App } from "../app.js";

function Root({ content }) {
  return use(content);
}
function Layout() {
  const [pagePromise, setPagePromise] = useState(null);

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
