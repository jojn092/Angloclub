export interface Lead {
    id: number
    name: string
    phone: string
    course: string
    status: 'new' | 'processing' | 'enrolled' | 'won' | 'lost'
    message: string | null
    createdAt: string
}

export interface Pagination {
    page: number
    limit: number
    total: number
    totalPages: number
}
