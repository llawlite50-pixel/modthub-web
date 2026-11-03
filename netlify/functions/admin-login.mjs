
export default async (request) => {
  const headers = {
    "Content-Type": "application/json",
    "Cache-Control": "no-store"
  };

  if (request.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      { status: 405, headers }
    );
  }

  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return new Response(
        JSON.stringify({ error: "Email and password required" }),
        { status: 400, headers }
      );
    }

    const url = process.env.SUPABASE_URL;
    const publicKey = process.env.SUPABASE_PUBLISHABLE_KEY;
    const secretKey = process.env.SUPABASE_SECRET_KEY;

    if (!url || !publicKey || !secretKey) {
      throw new Error("Server configuration missing");
    }

    // Verify email and password
    const loginResponse = await fetch(
      `${url}/auth/v1/token?grant_type=password`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: publicKey
        },
        body: JSON.stringify({ email, password })
      }
    );

    if (!loginResponse.ok) {
      return new Response(
        JSON.stringify({ error: "Invalid email or password" }),
        { status: 401, headers }
      );
    }

    const session = await loginResponse.json();

    // Verify admin permission
    const adminResponse = await fetch(
      `${url}/rest/v1/admins?user_id=eq.${encodeURIComponent(session.user.id)}&select=user_id`,
      {
        headers: {
  apikey: secretKey
}
      }
    );

    if (!adminResponse.ok) {
      throw new Error("Admin verification failed");
    }

    const admins = await adminResponse.json();

    if (!admins.length) {
      return new Response(
        JSON.stringify({ error: "You are not an authorized admin" }),
        { status: 403, headers }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        access_token: session.access_token
      }),
      { status: 200, headers }
    );

  } catch (error) {
    return new Response(
      JSON.stringify({ error: "Server error. Please try again." }),
      { status: 500, headers }
    );
  }
};
