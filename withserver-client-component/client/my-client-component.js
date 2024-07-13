"use client";
import { createElement as h } from "react";

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
