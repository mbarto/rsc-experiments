"use server";

export async function myAction(_, formData) {
  await new Promise((resolve) => setTimeout(resolve, 1000));
  const text = formData.get("text");
  if (text === "error")
    return { status: "error", message: "Error: text is 'error'" };
  return { status: "success", message: text };
}
