// app/(api)/booking_slots/[id]+api.ts

import { neon } from "@neondatabase/serverless";

export async function PATCH(request: Request) {
  const url = new URL(request.url);
  const pathParts = url.pathname.split('/');
  const id = pathParts[pathParts.length - 1];

  // console.log('PATCH request received, id:', id);

  if (!id) {
    console.error("No id provided in URL");
    return Response.json({ error: "No booking slot ID provided" }, { status: 400 });
  }

  try {
    const updates = await request.json();
    // console.log('Received updates:', updates);

    const sql = neon(`${process.env.DATABASE_URL}`);
    
    const query = `
      UPDATE booking_slots 
      SET booked = $1, is_available = $2
      WHERE id = $3
      RETURNING *
    `;
    const values = [updates.booked, updates.is_available, id];

    // console.log('Executing query:', query);
    // console.log('With values:', values);

    const [updatedSlot] = await sql(query, values);

    if (!updatedSlot) {
      // console.log(`No booking slot found with id: ${id}`);
      return Response.json({ error: "Booking slot not found" }, { status: 404 });
    }

    // console.log('Updated slot:', updatedSlot);
    return Response.json({ data: updatedSlot });
  } catch (error) {
    console.error("Error updating booking slot:", error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const pathParts = url.pathname.split('/');
  const id = pathParts[pathParts.length - 1];

  // console.log('GET request received, id:', id);

  if (!id) {
    console.error("No id provided in URL");
    return Response.json({ error: "No booking slot ID provided" }, { status: 400 });
  }

  try {
    const sql = neon(`${process.env.DATABASE_URL}`);
    
    const [slot] = await sql`SELECT * FROM booking_slots WHERE id = ${id}`;
    
    if (!slot) {
      // console.log(`No booking slot found with id: ${id}`);
      return Response.json({ error: "Booking slot not found" }, { status: 404 });
    }

    // console.log('Found slot:', slot);
    return Response.json({ data: slot });
  } catch (error) {
    console.error("Error fetching booking slot:", error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}


// export async function DELETE(request: Request) {
//     console.log('DELETE handler called');
//     const url = new URL(request.url);
//     console.log('Request URL:', url.toString());
//     const pathParts = url.pathname.split('/');
//     console.log('Path parts:', pathParts);
//     const bookingId = pathParts[pathParts.length - 1];

//     console.log('DELETE request received for booking ID:', bookingId);

//     if (!bookingId) {
//         console.log('No booking ID provided');
//         return Response.json({ error: "Booking ID is required" }, { status: 400 });
//     }

//     try {
//         const body = await request.json();
//         console.log('Request body:', body);
//         const { bookingSlotId } = body;
//         console.log('Cancelling booking:', { bookingId, bookingSlotId });

//         const sql = neon(`${process.env.DATABASE_URL}`);
        
//         const result = await sql`
//             WITH deleted_booking AS (
//                 DELETE FROM user_bookings
//                 WHERE id = ${bookingId}
//                 RETURNING booking_slot_id
//             )
//             UPDATE booking_slots
//             SET booked = booked - 1,
//                 is_available = true
//             WHERE id = (SELECT booking_slot_id FROM deleted_booking)
//             RETURNING *
//         `;

//         console.log('Cancellation result:', result);

//         if (result.length === 0) {
//             console.log('No booking found or already cancelled');
//             return Response.json({ error: "Booking not found or already cancelled" }, { status: 404 });
//         }

//         console.log('Booking cancelled successfully');
//         return Response.json({ message: "Booking cancelled successfully", data: result[0] });
//     } catch (error) {
//         console.error("Error cancelling user booking:", error);
//         return Response.json({ error: "Internal Server Error", details: String(error) }, { status: 500 });
//     }
// }

// // Add this to handle OPTIONS requests (for CORS preflight)
// export async function OPTIONS(request: Request) {
//     console.log('OPTIONS request received');
//     return new Response(null, {
//         status: 204,
//         headers: {
//             'Access-Control-Allow-Origin': '*',
//             'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
//             'Access-Control-Allow-Headers': 'Content-Type, Authorization',
//         },
//     });
// }