import type { APIRoute } from "astro";
import { app } from "../../../firebase/server";
import { getFirestore } from "firebase-admin/firestore";

const db = getFirestore(app);
const bookingsRef = db.collection("bookings");

export const POST: APIRoute = async ({ params, redirect, request }) => {
  const formData = await request.formData();
  const house = formData.get("house")?.toString();
  const dateFrom = formData.get("dateFrom")?.toString();
  const dateTo = formData.get("dateTo")?.toString();

  if (!house || !dateFrom || !dateTo) {
    return new Response("Missing required fields", {
      status: 400,
    });
  }

  if (!params.id) {
    return new Response("Cannot find booking", {
      status: 404,
    });
  }

  try {
    await bookingsRef.doc(params.id).update({
      house,
      dateFrom: new Date(dateFrom),
      dateTo: new Date(dateTo),
    });
  } catch (error) {
    return new Response("Something went wrong", {
      status: 500,
    });
  }
  return redirect("/");
};

export const DELETE: APIRoute = async ({ params, redirect }) => {
  if (!params.id) {
    return new Response("Cannot find friend", {
      status: 404,
    });
  }

  try {
    await bookingsRef.doc(params.id).delete();
  } catch (error) {
    return new Response("Something went wrong", {
      status: 500,
    });
  }
  return redirect("/");
};
