import { createElement as h } from "https://esm.sh/react@19.0.0-beta-94eed63c49-20240425?pin=v126&dev";

export const MyClientComponent = ({ content }) => {
  return h(
    "button",
    {
      onClick: () => {
        alert("Clicked");
      },
    },
    content
  );
};
