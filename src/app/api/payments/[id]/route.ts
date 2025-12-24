import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(
    request: Request,
    props: { params: Promise<{ id: string }> }
) {
    try {
        const params = await props.params;
        const id = Number(params.id);
        const body = await request.json();
        const { amount, method, comment, status, type, period, date } = body;

        // Get old payment to adjust balance
        const oldPayment = await prisma.payment.findUnique({ where: { id } });
        if (!oldPayment) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });

        const payment = await prisma.payment.update({
            where: { id },
            data: {
                amount: Number(amount),
                method,
                comment,
                status,
                type,
                period,
                date: new Date(date)
            }
        });

        // Balance Adjustment Logic
        // 1. Revert old effect
        if (oldPayment.status === 'paid') {
            await prisma.student.update({
                where: { id: oldPayment.studentId },
                data: { balance: { decrement: oldPayment.amount } }
            });
        }

        // 2. Apply new effect
        if (payment.status === 'paid') {
            await prisma.student.update({
                where: { id: payment.studentId },
                data: { balance: { increment: payment.amount } }
            });
        }

        return NextResponse.json({ success: true, data: payment });
    } catch (error) {
        console.error('Failed to update payment:', error);
        return NextResponse.json({ success: false, error: 'Failed' }, { status: 500 });
    }
}

export async function DELETE(
    request: Request,
    props: { params: Promise<{ id: string }> }
) {
    try {
        const params = await props.params;
        const id = Number(params.id);

        const oldPayment = await prisma.payment.findUnique({ where: { id } });
        if (!oldPayment) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });

        await prisma.payment.delete({ where: { id } });

        // Revert balance if it was paid
        if (oldPayment.status === 'paid') {
            await prisma.student.update({
                where: { id: oldPayment.studentId },
                data: { balance: { decrement: oldPayment.amount } }
            });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Failed to delete payment:', error);
        return NextResponse.json({ success: false, error: 'Failed' }, { status: 500 });
    }
}
