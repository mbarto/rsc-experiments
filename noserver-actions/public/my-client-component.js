import { createElement as h } from "https://esm.sh/react@19.0.0?pin=v126&dev";

const { useState, useRef, useActionState } = global.reactHooks;

export const MyClientComponent = ({ text, action }) => {
  const [formState, formAction, isPending] = useActionState(action);
  const [value, setValue] = useState(text);
  const inputRef = useRef(null);
  return h(
    "div",
    { style: { opacity: isPending ? 0.6 : 1 } },
    h(
      "form",
      {
        action: formAction,
        onSubmit: () => {
          setValue(inputRef.current?.value ?? "");
        },
      },
      h("input", {
        required: true,
        ref: inputRef,
        id: "textId",
        type: "text",
        name: "text",
        defaultValue: value,
      })
    ),
    formState
      ? h(
          "div",
          {
            style: {
              color: formState.status === "error" ? "red" : "green",
              fontSize: "0.75rem",
              fontWeight: "normal",
            },
          },
          formState.status
        )
      : null
  );
};
