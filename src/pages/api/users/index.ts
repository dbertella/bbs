import type { APIRoute } from "astro";
import { app } from "../../../firebase/server";
import { getFirestore } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";
import { getFamilyInfo } from "../../../utils/getFamilyInfo";

export const POST: APIRoute = async ({ request, redirect, cookies }) => {
  const formData = await request.formData();
  const familyId = formData.get("familyId")?.toString();

  if (!familyId) {
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
    const userEmail = decodedCookie.email ?? decodedCookie.id;

    // Create booking with user reference
    const db = getFirestore(app);
    
    await db.collection('users').doc(userEmail).set({ familyId });
    return redirect("/profile");
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
        // Process bookings and fetch user info
        const bookingsPromises = bookingsSnapshot.docs.map(async (doc) => {
            const data = doc.data();
            // Fetch user info
            const user = await auth.getUser(data.userId);
            const family = await getFamilyInfo(user.email);
            
            return {
                id: doc.id,
                house: data.house,
                dateFrom: data.dateFrom.toDate().toISOString(),
                dateTo: data.dateTo.toDate().toISOString(),
                userId: data.userId,
                userEmail: user.email || 'Unknown User',
                userName: user.displayName || 'Unknown User',
                familyName: family?.name,
                familyColor: family?.color,
                notes: data.notes || null,
                numberPeople: data.numberPeople || null
            };
        });

        const bookings = await Promise.all(bookingsPromises);

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
