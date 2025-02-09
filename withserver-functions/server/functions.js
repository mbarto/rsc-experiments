"use server";

export async function fun() {
  await new Promise((resolve) => setTimeout(resolve, 1000));
  return { status: "success", message: "Hello World!" };
}
