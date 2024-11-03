import { neon } from "@neondatabase/serverless";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const date = url.searchParams.get('date');
  const slotId = url.searchParams.get('slotId');

  // console.log(`Admin API: GET request received. date: ${date}, slotId: ${slotId}`);

  try {
    const sql = neon(`${process.env.DATABASE_URL}`);
    let query;

    if (slotId) {
      query = sql`
        SELECT * FROM admin_booking_view
        WHERE slot_id = ${parseInt(slotId, 10)}
        ORDER BY booked_at ASC
      `;
    } else if (date) {
      query = sql`
        SELECT * FROM admin_booking_view
        WHERE date = ${date}
        ORDER BY time ASC, booked_at ASC
      `;
    } else {
      return Response.json({ error: "Either date or slotId is required" }, { status: 400 });
    }

    const results = await query;
    // console.log(`Admin API: Query results:`, results);
    return Response.json({ data: results });
  } catch (error) {
    console.error("Admin API: Error:", error);
    return Response.json({ error: "Internal Server Error", details: String(error) }, { status: 500 });
  }
}