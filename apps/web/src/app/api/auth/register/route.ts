import { NextResponse } from "next/server";

const BASE_URL = (process.env.API_URL_INTERNAL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000").replace(/\/graphql\/?$/, '');
const ENDPOINT = BASE_URL;
const API_URL = ENDPOINT.replace(/\/graphql\/?$/, '');

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const res = await fetch(`${API_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const error = await res.json();
      return NextResponse.json({ error: error.error || "Registration failed" }, { status: res.status });
    }

    const data = await res.json(); 
    return NextResponse.json(data);

  } catch (error) {
    console.error("Register Route Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}