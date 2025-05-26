import type { APIRoute } from "astro";
import { app } from "../../../firebase/server";
import { getFirestore } from "firebase-admin/firestore";

export const POST: APIRoute = async ({ request, redirect }) => {
  const formData = await request.formData();
  const house = formData.get("house")?.toString();
  const dateFrom = formData.get("dateFrom")?.toString();
  const dateTo = formData.get("dateTo")?.toString();

  if (!house || !dateFrom || !dateTo) {
    return new Response("Missing required fields", {
      status: 400,
    });
  }
  try {
    const db = getFirestore(app);
    const bookingsRef = db.collection("bookings");
    const { id } = await bookingsRef.add({
      house,
      dateFrom: new Date(dateFrom),
      dateTo: new Date(dateTo),
    });
    return redirect(`/bookings/${id}`);
  } catch (error) {
    return new Response("Something went wrong", {
      status: 500,
    });
  }
};
