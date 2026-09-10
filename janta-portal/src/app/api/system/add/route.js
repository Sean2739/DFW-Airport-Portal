import { encryptSystemId } from "@/lib/froniusCrypto";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export const dynamic = 'force-dynamic';

export async function POST(req) {
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

    // Only admins can provision new systems
    if (userRole !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const { customerId, systemId, systemName, has_battery: hasBattery } = body;

    if (!customerId || !systemName) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    let encryptedData = null;
    let hasFroniusSystem = false;

    // Encrypt external Fronius System ID if provided
    if (systemId) {
      encryptedData = encryptSystemId(systemId);
      hasFroniusSystem = true;
    }

    // 1️⃣ Create the system record (DB integer ID auto-generated)
    const system = await prisma.systems.create({
      data: {
        system_name: systemName,
        system_cipher: encryptedData ? encryptedData.cipher : null,
        system_iv: encryptedData ? encryptedData.iv : null,
        system_tag: encryptedData ? encryptedData.tag : null,
        has_fronius_system: hasFroniusSystem,
        has_battery: Boolean(hasBattery),
      },
    });

    // 2️⃣ Link system to customer via join table
    await prisma.customer_system.create({
      data: {
        customer_id: customerId,
        system_id: system.id, // internal integer ID
      },
    });

    return NextResponse.json({ success: true, system });
  } catch (error) {
    console.error("Error adding system:", error);
    return NextResponse.json(
      { error: "Failed to save system" },
      { status: 500 }
    );
  }
}