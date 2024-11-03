import { neon } from "@neondatabase/serverless";

export async function GET(request: Request) {
  // console.log("GET request received for booking_slots");
  try {
    const sql = neon(`${process.env.DATABASE_URL}`);
    
    const bookingSlots = await sql`SELECT * FROM booking_slots`;

    // console.log(`Booking slots found:`, bookingSlots);
    return Response.json({ data: bookingSlots });
  } catch (error) {
    console.error("Error fetching booking slots:", error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}