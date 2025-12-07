'use client'

import { useState, useEffect, useCallback } from 'react'
import AdminHeader from '@/components/admin/AdminHeader'
import StatsOverview from '@/components/admin/StatsOverview'
import LeadFilters from '@/components/admin/LeadFilters'
import LeadsTable from '@/components/admin/LeadsTable'
import { Lead, Pagination } from '@/types'

export default function AdminPage() {
    const [leads, setLeads] = useState<Lead[]>([])
    const [pagination, setPagination] = useState<Pagination>({
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 0,
    })
    const [statusFilter, setStatusFilter] = useState('all')
    const [searchQuery, setSearchQuery] = useState('')
    const [isLoading, setIsLoading] = useState(false)

    const handleLogout = async () => {
        try {
            await fetch('/api/auth/logout', { method: 'POST' })
            window.location.href = '/admin/login'
        } catch (error) {
            console.error('Logout failed', error)
        }
    }

    // Fetch leads
    const fetchLeads = useCallback(async () => {
        setIsLoading(true)
        try {
            const params = new URLSearchParams({
                page: pagination.page.toString(),
                limit: pagination.limit.toString(),
                status: statusFilter,
                search: searchQuery,
            })

            const res = await fetch(`/api/leads?${params}`)

            if (res.ok) {
                const data = await res.json()
                setLeads(data.data.leads)
                setPagination(data.data.pagination)
            } else if (res.status === 401) {
                window.location.href = '/admin/login'
            }
        } catch (error) {
            console.error('Failed to fetch leads:', error)
        } finally {
            setIsLoading(false)
        }
    }, [pagination.page, pagination.limit, statusFilter, searchQuery])

    useEffect(() => {
        fetchLeads()
    }, [fetchLeads])

    // Update status
    const updateStatus = async (id: number, newStatus: string) => {
        try {
            const res = await fetch(`/api/leads/${id}/status`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ status: newStatus }),
            })

            if (res.ok) {
                fetchLeads()
            } else if (res.status === 401) {
                window.location.href = '/admin/login'
            }
        } catch (error) {
            console.error('Failed to update status:', error)
        }
    }

    // Export
    const handleExport = (format: 'csv' | 'xlsx') => {
        const params = new URLSearchParams({
            format,
            status: statusFilter,
        })
        window.open(`/api/export?${params}`, '_blank')
    }

    // Admin dashboard
    return (
        <div className="min-h-screen bg-[var(--background)]">
            <AdminHeader onLogout={handleLogout} />

            <main className="max-w-7xl mx-auto px-4 py-6">
                <StatsOverview leads={leads} total={pagination.total} />

                <LeadFilters
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                    statusFilter={statusFilter}
                    setStatusFilter={setStatusFilter}
                    onRefresh={fetchLeads}
                    onExport={handleExport}
                />

                <LeadsTable
                    leads={leads}
                    isLoading={isLoading}
                    pagination={pagination}
                    setPagination={setPagination}
                    onUpdateStatus={updateStatus}
                />
            </main>
        </div>
    )
}
