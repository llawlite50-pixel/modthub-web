export default async (request) => {
  const headers = {
    "Content-Type": "application/json"
  };

  if (request.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      { status: 405, headers }
    );
  }

  try {
    const { access_token } = await request.json();

    if (!access_token) {
      return new Response(
        JSON.stringify({ error: "Missing login token" }),
        { status: 401, headers }
      );
    }

    const url = process.env.SUPABASE_URL;
    const publicKey = process.env.SUPABASE_PUBLISHABLE_KEY;
    const secretKey = process.env.SUPABASE_SECRET_KEY;

    if (!url || !publicKey || !secretKey) {
      throw new Error("Server configuration missing");
    }

    // Verify the logged-in user with Supabase Auth
    const authResponse = await fetch(
      `${url}/auth/v1/user`,
      {
        headers: {
          apikey: publicKey,
          Authorization: `Bearer ${access_token}`
        }
      }
    );

    if (!authResponse.ok) {
      return new Response(
        JSON.stringify({ error: "Invalid login session" }),
        { status: 401, headers }
      );
    }

    const user = await authResponse.json();

    // Check whether this user is an admin
    const adminResponse = await fetch(
      `${url}/rest/v1/admins?user_id=eq.${encodeURIComponent(user.id)}&select=user_id`,
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

    return new Response(
      JSON.stringify({ isAdmin: admins.length > 0 }),
      { status: 200, headers }
    );

  } catch (error) {
    return new Response(
      JSON.stringify({ error: "Server error" }),
      { status: 500, headers }
    );
  }
};
