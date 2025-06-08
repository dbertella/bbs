import type { APIRoute } from "astro";
import { app } from "../../../firebase/server";
import { getFirestore } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";

const db = getFirestore(app);
const bookingsRef = db.collection("bookings");

async function verifyUserOwnsBooking(bookingId: string, userId: string) {
  const bookingDoc = await bookingsRef.doc(bookingId).get();
  if (!bookingDoc.exists) {
    return false;
  }
  const booking = bookingDoc.data();
  return booking?.userId === userId;
}

export const POST: APIRoute = async ({ params, redirect, request, cookies }) => {
  if (!params.id) {
    return new Response("Cannot find booking", { status: 404 });
  }

  try {
    // Verify authentication
    const auth = getAuth(app);
    const sessionCookie = cookies.get("__session")?.value;

    if (!sessionCookie) {
      return new Response("Unauthorized", { status: 401 });
    }

    const decodedCookie = await auth.verifySessionCookie(sessionCookie);
    const userId = decodedCookie.uid;

    // Verify user owns the booking
    const canEdit = await verifyUserOwnsBooking(params.id, userId);
    if (!canEdit) {
      return new Response("Unauthorized", { status: 403 });
    }

    // Get and validate form data
    const formData = await request.formData();
    const house = formData.get("house")?.toString();
    const dateFrom = formData.get("dateFrom")?.toString();
    const dateTo = formData.get("dateTo")?.toString();
    const notes = formData.get("notes")?.toString();
    const numberPeople = formData.get("numberPeople")?.toString();

    if (!house || !dateFrom || !dateTo) {
      return new Response("Missing required fields", { status: 400 });
    }

    // Update booking
    await bookingsRef.doc(params.id).update({
      house,
      dateFrom: new Date(dateFrom),
      dateTo: new Date(dateTo),
      notes: notes || null,
      numberPeople: numberPeople || null,
      updatedAt: new Date(),
    });

    return redirect(`/bookings/${params.id}`);
  } catch (error) {
    console.error("Error updating booking:", error);
    if (error instanceof Error && error.message.includes("auth")) {
      return new Response("Unauthorized", { status: 401 });
    }
    return new Response("Something went wrong", { status: 500 });
  }
};

export const DELETE: APIRoute = async ({ params, redirect, cookies }) => {
  if (!params.id) {
    return new Response("Cannot find booking", { status: 404 });
  }

  try {
    // Verify authentication
    const auth = getAuth(app);
    const sessionCookie = cookies.get("__session")?.value;

    if (!sessionCookie) {
      return new Response("Unauthorized", { status: 401 });
    }

    const decodedCookie = await auth.verifySessionCookie(sessionCookie);
    const userId = decodedCookie.uid;

    // Verify user owns the booking
    const canDelete = await verifyUserOwnsBooking(params.id, userId);
    if (!canDelete) {
      return new Response("Unauthorized", { status: 403 });
    }

    // Delete booking
    await bookingsRef.doc(params.id).delete();
    return redirect("/bookings");
  } catch (error) {
    console.error("Error deleting booking:", error);
    if (error instanceof Error && error.message.includes("auth")) {
      return new Response("Unauthorized", { status: 401 });
    }
    return new Response("Something went wrong", { status: 500 });
  }
};
