import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function POST(request) {
    const { email, firstName, lastName, password } = await request.json();

    // Combine first/last into the single `name` column the schema defines
    const fullName = `${(firstName ?? '').trim()} ${(lastName ?? '').trim()}`.trim();

    if (!email || !firstName || !lastName || !password) {
        return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    if (password.length < 8) {
        return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 });
    }

    try {
        // Check if user already exists
        const existingUser = await prisma.customer.findUnique({
            where: { email },
        });

        if (existingUser) {
            return NextResponse.json({ error: 'Email already exists' }, { status: 409 });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Save user — customer_type is required by the schema
        const newCustomer = await prisma.customer.create({
            data: {
                email,
                name: fullName,
                customer_type: 'RESIDENTIAL', // default; update to match your enum values
                password_hash: hashedPassword,
                setting: {
                    create: {},
                },
                notification: {
                    create: {},
                },
            },
            include: {
                setting: true,
                notification: true,
            },
        });

        return NextResponse.json({ id: newCustomer.id, email: newCustomer.email }, { status: 201 });
    } catch (error) {
        console.error('Registration error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}