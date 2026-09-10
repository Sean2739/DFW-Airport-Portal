import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import jwt from "jsonwebtoken";
import { getDevBypassSystem, getJwtSecret, isDevAuthBypass } from "@/lib/devAuth";

export const dynamic = 'force-dynamic';

export async function POST(request) {
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
        console.log(`Select systems customer ID: ${customerId}`);
        console.log(`Select systems user role: ${userRole}`);

        // Get systemID from request body
        const body = await request.json();
        const { systemId } = body;

        if (!systemId) {
            return NextResponse.json({ error: "System ID is required" }, { status: 400 });
        }

        // LOCAL DEV ONLY — ignored in production. See src/lib/devAuth.js
        const devSystem = isDevAuthBypass() ? getDevBypassSystem(systemId) : null;
        if (devSystem) {
            const newToken = jwt.sign(
                {
                    sub: customerId,
                    role: userRole,
                    planTier: decoded.planTier,
                    activeSystemId: devSystem.id,
                    forcePasswordReset: Boolean(decoded.forcePasswordReset),
                },
                JWT_SECRET,
                { expiresIn: "7d" }
            );
            const response = NextResponse.json({ success: true });
            response.cookies.set("session", newToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "strict",
                path: "/",
                maxAge: 60 * 60 * 24 * 7,
            });
            return response;
        }

        // Only allow selecting systems that are active
        const system = await prisma.systems.findUnique({
            where: { id: systemId },
            select: { status: true },
        });

        if (!system || system.status !== "ACTIVE") {
            return NextResponse.json({ error: "System is not available" }, { status: 403 });
        }

        // Check user has access to this system (unless admin)
        if (userRole !== "ADMIN") {
            const allowed = await prisma.customer_system.findFirst({
                where: {
                    customer_id: customerId,
                    system_id: systemId,
                },
            });

            if (!allowed) {
                return NextResponse.json({ error: "Forbidden: You do not have access to this system" }, { status: 403 });
            }
        }
        
        // Generate new JWT with activeSystemId
        const newToken = jwt.sign(
            {
                sub: customerId,
                role: userRole,
                planTier: decoded.planTier,
                activeSystemId: systemId,
                forcePasswordReset: Boolean(decoded.forcePasswordReset),
            },
            JWT_SECRET,
            { expiresIn: "7d" }
        );

        // Set JWT in HttpOnly cookie
        const response = NextResponse.json({ success: true });
        response.cookies.set("session", newToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            path: "/",
            maxAge: 60 * 60 * 24 * 7, // 7 days
        });

        return response;
    }catch (err){
        console.error("Error selecting system:", err);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}