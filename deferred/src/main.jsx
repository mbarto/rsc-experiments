import { createRoot } from "react-dom/client";
import { useDeferredValue, memo, useState, Suspense, use } from "react";

/**
 * Scenario 1: slow rendering list
 */
const SlowList = memo(function SlowList({ text }) {
  // Log once. The actual slowdown is inside SlowItem.
  console.log("[ARTIFICIALLY SLOW] Rendering 250 <SlowItem />");

  let items = [];
  for (let i = 0; i < 250; i++) {
    items.push(<SlowItem key={i} text={text} />);
  }
  return <ul className="items">{items}</ul>;
});

function SlowItem({ text }) {
  let startTime = performance.now();
  while (performance.now() - startTime < 1) {
    // Do nothing for 1 ms per item to emulate extremely slow code
  }

  return <li className="item">Text: {text}</li>;
}

function Root() {
  const [text, setText] = useState("");
  const deferredText = useDeferredValue(text);
  return (
    <>
      <input value={text} onChange={(e) => setText(e.target.value)} />
      <SlowList text={deferredText} />
    </>
  );
}

/**
 * Scenario 2: suspended list
 *  - note: react does not support fetching data without a cache in Suspense
 *    (A component was suspended by an uncached promise. Creating promises inside a Client Component or hook is not yet supported, except via a Suspense-compatible library or framework.)

let cache = new Map();

function fetchData(text) {
  if (!cache.has(text)) {
    cache.set(text, getData(text));
  }
  return cache.get(text);
}

async function getData(text) {
  return await new Promise((r) => setTimeout(() => r(["A", "B", "C"]), 1000));
}

function FetchingList({ text }) {
  const items = use(fetchData(text));

  return (
    <ul>
      {items.map((item, i) => (
        <li key={i}>
          {item} - {text}
        </li>
      ))}
    </ul>
  );
}

function SuspendedList({ text }) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <FetchingList text={text} />
    </Suspense>
  );
}

function Root() {
  const [text, setText] = useState("");
  const deferredText = useDeferredValue(text);
  return (
    <>
      <input value={text} onChange={(e) => setText(e.target.value)} />
      <div style={{ opacity: text === deferredText ? 1 : 0.2 }}>
        <SuspendedList text={deferredText} />
      </div>
    </>
  );
} */

createRoot(document.getElementById("root")).render(<Root />);
