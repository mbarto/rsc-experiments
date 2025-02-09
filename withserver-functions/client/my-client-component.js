"use client";
import { createElement as h, useState, useEffect } from "react";

export const MyClientComponent = ({ fun }) => {
  const [result, setResult] = useState(null);
  useEffect(() => {
    fun().then(setResult);
  }, [fun]);

  return h("div", null, result?.message);
};
