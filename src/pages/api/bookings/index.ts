import type { APIRoute } from "astro";
import { app } from "../../../firebase/server";
import { getFirestore } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";

export const POST: APIRoute = async ({ request, redirect, cookies }) => {
  const formData = await request.formData();
  const house = formData.get("house")?.toString();
  const dateFrom = formData.get("dateFrom")?.toString();
  const dateTo = formData.get("dateTo")?.toString();
  const notes = formData.get("notes")?.toString();

  if (!house || !dateFrom || !dateTo) {
    return new Response("Missing required fields", {
      status: 400,
    });
  }

  try {
    // Get the authenticated user
    const auth = getAuth(app);
    const sessionCookie = cookies.get("__session")?.value;

    if (!sessionCookie) {
      return new Response("Unauthorized", { status: 401 });
    }

    const decodedCookie = await auth.verifySessionCookie(sessionCookie);
    const userId = decodedCookie.uid;

    // Create booking with user reference
    const db = getFirestore(app);
    const bookingsRef = db.collection("bookings");
    const { id } = await bookingsRef.add({
      house,
      dateFrom: new Date(dateFrom),
      dateTo: new Date(dateTo),
      notes: notes || null,
      userId,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    return redirect(`/bookings/${id}`);
  } catch (error) {
    console.error("Error creating booking:", error);
    if (error instanceof Error && error.message.includes("auth")) {
      return new Response("Unauthorized", { status: 401 });
    }
    return new Response("Something went wrong", {
      status: 500,
    });
  }
};

export const GET: APIRoute = async ({ request, cookies }) => {
    // Check authentication
    const auth = getAuth(app);
    if (!cookies.has("__session")) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), {
            status: 401,
            headers: { "Content-Type": "application/json" }
        });
    }

    try {
        const sessionCookie = cookies.get("__session")?.value ?? "";
        await auth.verifySessionCookie(sessionCookie);

        // Get all bookings
        const db = getFirestore(app);
        const bookingsRef = db.collection("bookings");
        const bookingsSnapshot = await bookingsRef.get();
        
        const bookings = bookingsSnapshot.docs.map(doc => {
            const data = doc.data();
            // Convert Firebase Timestamps to ISO date strings
            return {
                id: doc.id,
                house: data.house,
                dateFrom: data.dateFrom.toDate().toISOString(),
                dateTo: data.dateTo.toDate().toISOString(),
                userId: data.userId,
                notes: data.notes
            };
        });

        return new Response(JSON.stringify(bookings), {
            status: 200,
            headers: { "Content-Type": "application/json" }
        });
    } catch (error) {
        console.error("Error fetching bookings:", error);
        return new Response(JSON.stringify({ error: "Internal Server Error" }), {
            status: 500,
            headers: { "Content-Type": "application/json" }
        });
    }
};
