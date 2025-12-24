import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);

        // Fetch last 50 expenses
        const expenses = await prisma.expense.findMany({
            orderBy: { date: 'desc' },
            take: 50
        });

        return NextResponse.json({ success: true, data: expenses });
    } catch (error) {
        return NextResponse.json({ success: false, error: 'Failed' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { amount, category, description, date } = body;

        const expense = await prisma.expense.create({
            data: {
                amount: Number(amount),
                category,
                description,
                date: new Date(date)
            }
        });

        return NextResponse.json({ success: true, data: expense });
    } catch (error) {
        return NextResponse.json({ success: false, error: 'Failed' }, { status: 500 });
    }
}
