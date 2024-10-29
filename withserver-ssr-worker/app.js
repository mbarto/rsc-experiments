import { createElement as h, Fragment } from "react";

export function App({ setPage, children }) {
  return h(Fragment, null, [
    h("header", null, "Header"),
    h("aside", null, [
      h("h1", null, "Menu"),
      h("menu", null, [
        h(
          "li",
          null,
          h("a", { href: "#", onClick: () => setPage(1) }, "Page 1")
        ),
        h(
          "li",
          null,
          h("a", { href: "#", onClick: () => setPage(2) }, "Page 2")
        ),
        h(
          "li",
          null,
          h("a", { href: "#", onClick: () => setPage(3) }, "Page 3")
        ),
      ]),
    ]),
    h("main", null, children),
    h("footer", null, "Footer"),
  ]);
}

export function Page({ page }) {
  return page === 0
    ? h("p", null, "Click on a menu item")
    : h("h1", null, `Page ${page}`);
}
