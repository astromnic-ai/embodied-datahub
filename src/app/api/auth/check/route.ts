import { NextResponse } from "next/server";
import { isAuthenticated, getSession } from "@/lib/auth";

export async function GET() {
  const authenticated = await isAuthenticated();
  
  if (authenticated) {
    const session = await getSession();
    return NextResponse.json({ 
      authenticated: true, 
      username: session?.username 
    });
  }
  
  return NextResponse.json({ authenticated: false });
}
