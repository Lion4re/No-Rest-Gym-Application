import { neon } from "@neondatabase/serverless";

export async function GET(request: Request) {
  // console.log("GET request received for users/[id]");
  const url = new URL(request.url);
  const id = url.pathname.split('/').pop();

  // console.log(`Extracted ID from URL: ${id}`);

  if (!id) {
    console.error("No ID provided in URL");
    return Response.json({ error: "No user ID provided" }, { status: 400 });
  }

  try {
    // console.log("Connecting to database...");
    const sql = neon(`${process.env.DATABASE_URL}`);
    
    // console.log(`Attempting to fetch user with id or clerk_id: ${id}`);
    
    const [user] = await sql`
      SELECT id, name, email, clerk_id, is_admin, is_approved, subscription_start, subscription_end
      FROM users WHERE id::text = ${id} OR clerk_id = ${id}
    `;

    // console.log("SQL query result:", user);

    if (!user) {
      // console.log(`No user found with id or clerk_id: ${id}`);
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    // console.log(`User found:`, user);
    return Response.json({ data: user });
  } catch (error) {
    console.error("Error fetching user:", error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}


export async function PATCH(request: Request) {
  const url = new URL(request.url);
  const id = url.pathname.split('/').pop();

  // console.log(`PATCH request received, id from URL: ${id}`);

  if (!id) {
    console.error("No id provided in URL");
    return Response.json({ error: "No user ID provided" }, { status: 400 });
  }

  const updates = await request.json();

  try {
    const sql = neon(`${process.env.DATABASE_URL}`);
    
    const updateFields = Object.keys(updates);
    const setClause = updateFields.map((field, index) => `${field} = $${index + 1}`).join(', ');
    const queryString = `
      UPDATE users 
      SET ${setClause} 
      WHERE id::text = $${updateFields.length + 1} OR clerk_id = $${updateFields.length + 1} 
      RETURNING *
    `;
    
    // console.log('Executing update with:', updates);
    // console.log('Query:', queryString);

    const values = [...Object.values(updates), id];
    // console.log('Values:', values);

    const [updatedUser] = await sql(queryString, values);

    if (!updatedUser) {
      // console.log(`No user found to update with id or clerk_id: ${id}`);
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    // console.log('Updated user:', updatedUser);
    return Response.json({ data: updatedUser });
  } catch (error) {
    console.error("Error updating user:", error);
    return Response.json({ 
      error: "Internal Server Error", 
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}