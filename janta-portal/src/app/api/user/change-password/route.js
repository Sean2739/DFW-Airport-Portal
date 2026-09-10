import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import jwt from "jsonwebtoken";
import prisma from '@/lib/prisma'; // adjust path as needed

export const dynamic = 'force-dynamic';

export async function PUT(req) {
    try {
        const JWT_SECRET = process.env.JWT_SECRET;
        if (!JWT_SECRET) throw new Error("JWT_SECRET is not set");
        
        // Get token from cookie
        const token = req.cookies.get("session")?.value;
        if (!token) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        
        // Verify JWT
        const decoded = jwt.verify(token, JWT_SECRET);
        const authUserId = Number(decoded.sub); // the ID of the authenticated user

        // Parse request body
        const { currentPassword, newPassword } = await req.json();

        if (!currentPassword || !newPassword) {
            return NextResponse.json({ error: "Missing passwords" }, { status: 400 });
        }

        if (newPassword.length < 8) {
            return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });
        }
        
        // Fetch user from DB
        const user = await prisma.customer.findUnique({
            where: { id: authUserId },
        });
      
        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }
      
        // Compare current password
        const isMatch = await bcrypt.compare(currentPassword, user.password_hash);
        if (!isMatch) {
            return NextResponse.json({ error: 'Incorrect current password' }, { status: 401 });
        }
      
        // Hash new password
        const newHash = await bcrypt.hash(newPassword, 10);

        // Whitelist the only two columns this route is allowed to touch
        const allowedFields = ["password_hash", "force_password_reset"];
        const safeData = Object.fromEntries(
            Object.entries({ password_hash: newHash, force_password_reset: false })
                .filter(([key]) => allowedFields.includes(key))
        );

        await prisma.customer.update({
            where: { id: authUserId },
            data: safeData,
        });

        const newToken = jwt.sign(
            {
                sub: authUserId,
                role: decoded.role,
                planTier: decoded.planTier,
                activeSystemId: decoded.activeSystemId ?? null,
                forcePasswordReset: false,
            },
            JWT_SECRET,
            { expiresIn: "7d" }
        );

        const res = NextResponse.json({ message: 'Password changed successfully' });
        res.cookies.set("session", newToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            path: "/",
            maxAge: 60 * 60 * 24 * 7,
        });
        return res;
    } catch (error) {
        console.error('Error changing password:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
