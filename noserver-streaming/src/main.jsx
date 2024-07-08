import { use } from "react";
import { createRoot } from "react-dom/client";
import { createFromReadableStream } from "react-server-dom-esm/client";

let timeout = null;
let counter = 0;
const chunks = [
  '9:"$Sreact.suspense"\n',
  '0:["$","div",null,{"children":[["Hello World!"],["$","$9",null,{"fallback":["$", "p", null, {"children": "Loading..."}],"children":"$L1"}]]}]\n',
  '1:["$","div",null,{"children":[["Hello Again!"],["$","$9",null,{"fallback":["$", "p", null, {"children": "Loading..."}],"children":"$L2"}]]}]\n',
  '2:["$","div",null,{"children":"Bye!"}]\n',
];
const encoder = new TextEncoder();

const stream = new ReadableStream({
  start(controller) {
    timeout = setInterval(() => {
      if (counter < chunks.length) {
        const encoded = encoder.encode(chunks[counter]);
        counter++;
        controller.enqueue(encoded);
      } else {
        clearInterval(timeout);
        controller.close();
      }
    }, 1000);
  },
});

const initialContent = createFromReadableStream(stream);

function Root() {
  return use(initialContent);
}

createRoot(document.getElementById("root")).render(<Root />);
