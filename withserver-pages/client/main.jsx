import { use, useState, Suspense } from "react";
import { createRoot } from "react-dom/client";
import { createFromFetch } from "react-server-dom-esm/client";
import "./main.css";

import "./main.css";

function Root({ content }) {
  return use(content);
}
function Layout() {
  const [pagePromise, setPagePromise] = useState(null);

  function setPage(page) {
    setPagePromise(createFromFetch(fetch(`rsc?page=${page}`)));
  }

  return (
    <>
      <header>Header</header>
      <aside>
        <h1>Menu</h1>
        <menu>
          <li>
            <a href="#" onClick={() => setPage(1)}>
              Page 1
            </a>
          </li>
          <li>
            <a href="#" onClick={() => setPage(2)}>
              Page 2
            </a>
          </li>
          <li>
            <a href="#" onClick={() => setPage(3)}>
              Page 3
            </a>
          </li>
        </menu>
      </aside>
      <main>
        {pagePromise ? (
          <Suspense fallback={<p>Loading...</p>}>
            <Root content={pagePromise} />
          </Suspense>
        ) : (
          <p>Click on a menu item</p>
        )}
      </main>
      <footer>Footer</footer>
    </>
  );
}

createRoot(document.getElementById("root")).render(<Layout />);
