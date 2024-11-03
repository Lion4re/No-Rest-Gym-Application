// app/(api)/user_bookings+api.ts

import { neon, neonConfig } from "@neondatabase/serverless";

// neonConfig.fetchConnectionCache = true;

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

async function executeWithRetry<T>(sqlFunction: () => Promise<T>): Promise<T> {
  let lastError: Error | undefined;
  for (let i = 0; i < MAX_RETRIES; i++) {
    try {
      return await sqlFunction();
    } catch (error) {
      console.error(`Attempt ${i + 1} failed:`, error);
      lastError = error instanceof Error ? error : new Error(String(error));
      if (i < MAX_RETRIES - 1) {
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
      }
    }
  }
  throw lastError;
}

export async function POST(request: Request) {
  // console.log('POST request received for user booking');
  try {
    const { userId, bookingSlotId } = await request.json();
    // console.log(`Adding booking for user ${userId} and slot ${bookingSlotId}`);

    if (!userId || !bookingSlotId) {
      return Response.json({ error: "User ID and Booking Slot ID are required" }, { status: 400 });
    }

    const sql = neon(`${process.env.DATABASE_URL}`);
    // console.log('Database connection established');

    // Check if the booking slot is available
    const [slot] = await executeWithRetry(() => sql`
      SELECT * FROM booking_slots 
      WHERE id = ${bookingSlotId} AND is_available = true AND booked < capacity
    `);

    // console.log('Slot found:', slot);

    if (!slot) {
      return Response.json({ error: "Booking slot is not available" }, { status: 400 });
    }

    // console.log('[DEBUG] After slot check');

    // Check if the user has already booked this slot
    const [existingBooking] = await executeWithRetry(() => sql`
      SELECT * FROM user_bookings
      WHERE user_id = ${userId} AND booking_slot_id = ${bookingSlotId}
    `);

    if (existingBooking) {
      return Response.json({ error: "You have already booked this slot" }, { status: 400 });
    }

    // Create the booking
    const [newBooking] = await executeWithRetry(() => sql`
      INSERT INTO user_bookings (user_id, booking_slot_id, booked_at)
      VALUES (${userId}, ${bookingSlotId}, NOW())
      RETURNING *
    `);

    // console.log('[DEBUG] New booking created:', newBooking);

    // Update the booking slot
    await executeWithRetry(() => sql`
      UPDATE booking_slots 
      SET booked = booked + 1, 
          is_available = (booked + 1 < capacity)
      WHERE id = ${bookingSlotId}
    `);

    // console.log('Booking process completed successfully');
    return Response.json({ data: newBooking });
  } catch (error) {
    console.error("Error creating user booking:", error);
    if (error instanceof Error) {
      console.error("Error details:", error.message);
      console.error("Error stack:", error.stack);
    }
    return Response.json({ 
      error: "Internal Server Error", 
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}

// ... (keep existing GET and DELETE functions as they are)


export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');
  const bookingSlotId = searchParams.get('bookingSlotId');
  const limit = searchParams.get('limit') || '50';

  // console.log(`GET request received for user bookings. userId: ${userId}, bookingSlotId: ${bookingSlotId}`);

  if (!userId) {
      // console.log("User ID is missing in the request");
      return Response.json({ error: "User ID is required" }, { status: 400 });
  }

  try {
      const sql = neon(`${process.env.DATABASE_URL}`);
      let query;

      if (bookingSlotId) {
          query = sql`
              SELECT 
                  ub.id, 
                  ub.booking_slot_id,
                  ub.booked_at, 
                  bs.date, 
                  bs.time, 
                  bs.capacity, 
                  bs.booked,
                  bs.is_available
              FROM user_bookings ub
              JOIN booking_slots bs ON ub.booking_slot_id = bs.id
              WHERE ub.user_id = ${userId} AND ub.booking_slot_id = ${bookingSlotId}
              ORDER BY bs.date DESC, bs.time DESC
              LIMIT ${parseInt(limit)}
          `;
      } else {
          query = sql`
              SELECT 
                  ub.id, 
                  ub.booking_slot_id,
                  ub.booked_at, 
                  bs.date, 
                  bs.time, 
                  bs.capacity, 
                  bs.booked,
                  bs.is_available
              FROM user_bookings ub
              JOIN booking_slots bs ON ub.booking_slot_id = bs.id
              WHERE ub.user_id = ${userId}
              ORDER BY bs.date DESC, bs.time DESC
              LIMIT ${parseInt(limit)}
          `;
      }

      const response = await query;
      // console.log(`User bookings found:`, response);
      return Response.json({ data: response });
  } catch (error) {
      console.error("Error fetching user bookings:", error);
      return Response.json({ error: "Internal Server Error", details: error }, { status: 500 });
  }
}

// export async function DELETE(request: Request) {
//     console.log('DELETE handler called in user_bookings+api.ts');
//     const url = new URL(request.url);
//     console.log('Request URL:', url.toString());
//     const pathParts = url.pathname.split('/');
//     console.log('Path parts:', pathParts);
//     const bookingId = pathParts[pathParts.length - 1];

//     console.log('DELETE request received for booking ID:', bookingId);

//     if (!bookingId || bookingId === 'user_bookings') {
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