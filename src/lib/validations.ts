import { z } from 'zod'

export const leadSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    phone: z.string().min(10, 'Phone must be valid'),
    course: z.string().min(1, 'Course is required'),
    message: z.string().optional(),
})

export const leadStatusSchema = z.object({
    status: z.enum(['new', 'processing', 'enrolled', 'won', 'lost']),
})

export const leadQuerySchema = z.object({
    page: z.coerce.number().min(1).default(1),
    limit: z.coerce.number().min(1).max(100).default(20),
    status: z.string().optional(),
    search: z.string().optional(),
})

export const groupSchema = z.object({
    name: z.string().min(1, 'Название обязательно'),
    level: z.string().min(1, 'Уровень обязателен'),
    courseId: z.coerce.number().int().positive(),
    teacherId: z.coerce.number().int().positive(),
    roomId: z.coerce.number().int().positive().optional(),
    days: z.array(z.number().min(0).max(6)).optional(),
    time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Неверный формат времени').optional(),
})

export const studentSchema = z.object({
    name: z.string().min(1, 'Имя обязательно'),
    phone: z.string().min(1, 'Телефон обязателен'),
    email: z.string().email('Некорректный email').optional().or(z.literal('')),
    groupIds: z.array(z.number()).optional(),
    leadId: z.number().optional(),
})

export const paymentSchema = z.object({
    studentId: z.coerce.number(),
    amount: z.coerce.number().min(1, 'Amount must be positive'),
    method: z.string().min(1, 'Payment method required'), // cash, card, transfer
    comment: z.string().optional(),
    date: z.string().optional(), // ISO date
})

export const expenseSchema = z.object({
    amount: z.coerce.number().min(1, 'Сумма должна быть > 0'),
    category: z.string().min(1, 'Категория обязательна'),
    description: z.string().optional(),
    date: z.string().optional(),
})

export type CreateLeadInput = z.infer<typeof leadSchema>
export type UpdateLeadStatusInput = z.infer<typeof leadStatusSchema>
export type LeadQueryInput = z.infer<typeof leadQuerySchema>
