import { neon } from "@neondatabase/serverless";

export async function GET(request: Request) {
//   console.log("GET request received for users");
  try {
    const sql = neon(`${process.env.DATABASE_URL}`);
    
    const users = await sql`SELECT id, name, email, is_admin FROM users`;

    // console.log(`Users found:`, users);
    return Response.json({ data: users });
  } catch (error) {
    console.error("Error fetching users:", error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
    try {
        const sql = neon(`${process.env.DATABASE_URL}`);
        const { name, email, clerkId, isAdmin } = await request.json();

        if (!name || !email || !clerkId) {
            return Response.json(
                { error: "Missing required fields" },
                { status: 400 },
            );
        }

        const response = await sql`
            INSERT INTO users (
                name, 
                email, 
                clerk_id,
                is_admin
            ) 
            VALUES (
                ${name}, 
                ${email},
                ${clerkId},
                ${isAdmin || false}
            )
            RETURNING id, name, email, clerk_id, is_admin
        `;

        return new Response(JSON.stringify({ data: response[0] }), {
            status: 201,
        });
    } catch (error) {
        console.error("Error creating user:", error);
        return Response.json({ error: "Internal Server Error" }, { status: 500 });
    }
}