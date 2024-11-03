import { neon } from "@neondatabase/serverless";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const slotIdString = url.searchParams.get('slotId');

  // console.log(`Admin API: GET request received for slot bookings. slotId: ${slotIdString}, type: ${typeof slotIdString}`);

  if (!slotIdString) {
    return Response.json({ error: "Slot ID is required" }, { status: 400 });
  }

  // Convert slotId to integer
  const slotId = parseInt(slotIdString, 10);

  if (isNaN(slotId)) {
    console.error(`Admin API: Invalid slot ID: ${slotIdString}`);
    return Response.json({ error: "Invalid slot ID" }, { status: 400 });
  }

  // console.log(`Admin API: Parsed slotId: ${slotId}, type: ${typeof slotId}`);

  try {
    const sql = neon(`${process.env.DATABASE_URL}`);
    // console.log(`Admin API: Attempting to execute query with slotId: ${slotId}`);

    const query = sql`
      SELECT 
        ub.id, 
        ub.user_id,
        ub.booking_slot_id,
        ub.booked_at, 
        u.name,
        u.email
      FROM user_bookings ub
      JOIN users u ON ub.user_id = u.id
      WHERE ub.booking_slot_id = ${slotId}
      ORDER BY ub.booked_at ASC
    `;

    const bookings = await query;
    // console.log(`Admin API: Query executed successfully. Bookings found:`, bookings);

    return Response.json({ data: { bookings } });
  } catch (error) {
    console.error("Admin API: Error fetching slot bookings:", error);
    console.error("Admin API: Error details:", JSON.stringify(error, null, 2));
    return Response.json({ error: "Internal Server Error", details: String(error) }, { status: 500 });
  }
}