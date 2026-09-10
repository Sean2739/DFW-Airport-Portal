import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

export const dynamic = 'force-dynamic';

export async function GET(request){
    try{
        const JWT_SECRET = process.env.JWT_SECRET;
        if (!JWT_SECRET) throw new Error("JWT_SECRET is not set");
        
        // Read from cookie
        const token = request.cookies.get("session")?.value;
        if (!token) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        //Verify JWT
        const decoded = jwt.verify(token, JWT_SECRET);
        const customerId = Number(decoded.sub);
        console.log(`Select systems customer ID: ${customerId}`);

        if (isNaN(customerId)) {
            console.error('Invalid customer ID:', customerId);
            return NextResponse.json({ error: 'Invalid customer ID' }, { status: 400 });
        }

        const settings = await prisma.settings.findUnique({
            where: { customer_id: customerId },
            select: {
                theme: true,
                time_zone: true,
                text_size: true,
                bold_text: true,
                update_frequency: true,
                last_login_device: true,
                last_login: true,
                email_recovery: true,
                phone_recovery: true,
            },
        });

        if (!settings) {
            console.warn(`Settings not found for ID ${customerId}`);
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        return NextResponse.json(settings);

    } catch (error){
        console.error('Unexpected error in /api/settings/[customer_id]:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}

export async function PUT(req) {
    try {
        const JWT_SECRET = process.env.JWT_SECRET;
        if (!JWT_SECRET) throw new Error("JWT_SECRET is not set");
        
        const token = req.cookies.get('session')?.value;
        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const decoded = jwt.verify(token, JWT_SECRET);
        const customerId = Number(decoded.sub);

        console.log('Customer ID:', customerId);

        const body = await req.json();

        console.log('Request body:', body);

        if (isNaN(customerId)) {
            return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 });
        }

        const updatedSettings = await prisma.settings.update({
            where: { customer_id: customerId },
            data: {
                theme: body.theme,
                text_size: body.text_size,
                bold_text: body.bold_text,
                update_frequency: body.update_frequency,
                last_login_device: body.last_login_device,
                last_login: body.last_login,
                phone_recovery: body.phone_recovery,
                email_recovery: body.email_recovery,
            },
        });

        return NextResponse.json(updatedSettings);
    } catch (error) {
        console.error('Prisma update error:', error);
        return NextResponse.json({ error: 'Update failed' }, { status: 500 });
    }
}