import { neon } from "@neondatabase/serverless";

export async function GET(request: Request) {
  // console.log("GET request received for users");
  try {
    const sql = neon(`${process.env.DATABASE_URL}`);
    
    const users = await sql`
      SELECT id, name, email, clerk_id, is_admin, is_approved, subscription_start, subscription_end
      FROM users
    `;

    // console.log(`Users found:`, users);
    return Response.json({ data: users });
  } catch (error) {
    console.error("Error fetching users:", error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
