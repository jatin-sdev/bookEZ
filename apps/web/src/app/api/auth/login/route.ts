import { NextResponse } from "next/server";
import { cookies } from "next/headers";

// [FIX] Priority: Internal Docker URL -> Public URL -> Localhost
const BASE_URL = (process.env.API_URL_INTERNAL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000").replace(/\/graphql\/?$/, '');
const ENDPOINT = BASE_URL;
const API_URL = ENDPOINT.replace(/\/graphql\/?$/, '');

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // [FIX] Use the smart API_URL
    const targetUrl = `${API_URL}/auth/login`;
    console.log(`[LoginRoute] Fetching: ${targetUrl}`);

    const res = await fetch(targetUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const responseText = await res.text();
    let data;
    try {
      data = JSON.parse(responseText);
    } catch (e) {
       return NextResponse.json({ error: `Backend returned non-JSON: ${res.status}` }, { status: 500 });
    }

    if (!res.ok) {
      return NextResponse.json({ error: data.error || data.message || "Login failed" }, { status: res.status });
    }

    const cookieStore = await cookies();
    cookieStore.set("refreshToken", data.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 7 * 24 * 60 * 60, 
    });

    return NextResponse.json({ 
      accessToken: data.accessToken,
      refreshToken: data.refreshToken 
    });

  } catch (error) {
    console.error("Login Route Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}