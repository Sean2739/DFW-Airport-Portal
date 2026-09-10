import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import jwt from "jsonwebtoken";
import { DEV_BYPASS_SYSTEMS, getJwtSecret, isDevAuthBypass } from "@/lib/devAuth";

export const dynamic = 'force-dynamic';

export async function GET(request) {
    try{
        const JWT_SECRET = getJwtSecret();
        
        // Read from cookie
        const token = request.cookies.get("session")?.value;
        if (!token) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        //Verify JWT
        const decoded = jwt.verify(token, JWT_SECRET);
        const customerId = Number(decoded.sub);
        const userRole = String(decoded.role).toUpperCase(); // ← normalize casing
        console.log(`My systems customer ID: ${customerId}`);
        console.log(`My systems user role: ${userRole}`);

        // LOCAL DEV ONLY — ignored in production. See src/lib/devAuth.js
        if (isDevAuthBypass()) {
            return NextResponse.json(DEV_BYPASS_SYSTEMS);
        }

        let systems;
        if (userRole === "ADMIN"){// Admin sees all active systems
            systems = await prisma.systems.findMany({
                where: { status: "ACTIVE" },
            });
        }else if ((userRole === "USER")){ // Regular users see only active systems linked via customer_system
            systems = await prisma.systems.findMany({
                where: {
                    status: "ACTIVE",
                    customer_system: {
                        some: { customer_id: customerId },
                    },
                },
            });
        }else{// Validation check
            console.error("Error fetching user role: unexpected role", userRole);
            return NextResponse.json(
                { error: "Incorrect USER Role value" },
                { status: 404 }
            );
        }

        return NextResponse.json(systems);
    }catch (err){
        console.error("Error fetching systems:", err);
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
}