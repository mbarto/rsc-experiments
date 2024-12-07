import { use, useState, Suspense } from "react";
import { createRoot } from "react-dom/client";
import { createFromFetch } from "react-server-dom-esm/client";
import "./main.css";

import "./main.css";

function Root({ content }) {
  return use(content);
}
function Layout() {
  const [page, setPage] = useState(null);

  function loadPage(page) {
    setPage(createFromFetch(fetch(`rsc?page=${page}`)));
  }

  return (
    <>
      <header>Header</header>
      <aside>
        <h1>Menu</h1>
        <menu>
          <li>
            <a href="#" onClick={() => loadPage(1)}>
              Page 1
            </a>
          </li>
          <li>
            <a href="#" onClick={() => loadPage(2)}>
              Page 2
            </a>
          </li>
          <li>
            <a href="#" onClick={() => loadPage(3)}>
              Page 3
            </a>
          </li>
        </menu>
      </aside>
      <main>
        {page ? <Root content={page} /> : <p>Click on a menu item</p>}
      </main>
      <footer>Footer</footer>
    </>
  );
}

createRoot(document.getElementById("root")).render(<Layout />);
