import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { encryptSystemId } from "@/lib/froniusCrypto";
import jwt from "jsonwebtoken";

export const dynamic = 'force-dynamic';

export async function PATCH(req) {
  try {
    const JWT_SECRET = process.env.JWT_SECRET;
    if (!JWT_SECRET) throw new Error("JWT_SECRET is not set");
    
    // Verify session
    const token = req.cookies.get("session")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const userRole = String(decoded.role).toUpperCase();

    // Only admins can update Fronius system credentials
    if (userRole !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const { systemDbId, newSystemId } = body; // DB integer ID

    if (!systemDbId || !newSystemId) {
      return NextResponse.json(
        { error: "Missing systemDbId or newSystemId" },
        { status: 400 }
      );
    }

    // Encrypt the new external Fronius System ID
    const encryptedData = encryptSystemId(newSystemId);

    // Update the system record
    const updatedSystem = await prisma.systems.update({
      where: { id: systemDbId }, // use internal integer ID
      data: {
        system_cipher: encryptedData.cipher,
        system_iv: encryptedData.iv,
        system_tag: encryptedData.tag,
        has_fronius_system: true, // mark as real Fronius system
      },
    });

    return NextResponse.json({ success: true, system: updatedSystem });
  } catch (error) {
    console.error("Error updating system:", error);
    return NextResponse.json(
      { error: "Failed to update system" },
      { status: 500 }
    );
  }
}
