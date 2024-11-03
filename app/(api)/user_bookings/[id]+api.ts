import { neon } from "@neondatabase/serverless";

export async function DELETE(request: Request) {
    // console.log('DELETE handler called in user_bookings/[id]+api.ts');
    
    const url = new URL(request.url);
    const pathParts = url.pathname.split('/');
    const bookingId = pathParts[pathParts.length - 1];

    // console.log('DELETE request received for booking ID:', bookingId);

    if (!bookingId) {
        console.log('No booking ID provided');
        return Response.json({ error: "Booking ID is required" }, { status: 400 });
    }

    try {
        const body = await request.json();
        // console.log('Request body:', body);
        const { bookingSlotId } = body;
        // console.log('Cancelling booking:', { bookingId, bookingSlotId });

        const sql = neon(`${process.env.DATABASE_URL}`);
        
        const result = await sql`
            WITH deleted_booking AS (
                DELETE FROM user_bookings
                WHERE id = ${bookingId}
                RETURNING booking_slot_id
            )
            UPDATE booking_slots
            SET booked = booked - 1,
                is_available = true
            WHERE id = (SELECT booking_slot_id FROM deleted_booking)
            RETURNING *
        `;

        // console.log('Cancellation result:', result);

        if (result.length === 0) {
            // console.log('No booking found or already cancelled');
            return Response.json({ error: "Booking not found or already cancelled" }, { status: 404 });
        }

        // console.log('Booking cancelled successfully');
        return Response.json({ message: "Booking cancelled successfully", data: result[0] });
    } catch (error) {
        console.error("Error cancelling user booking:", error);
        return Response.json({ error: "Internal Server Error", details: String(error) }, { status: 500 });
    }
}

export async function OPTIONS(request: Request) {
    // console.log('OPTIONS request received');
    return new Response(null, {
        status: 204,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
    });
}