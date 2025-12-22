'use client'

import { useEffect, useState } from 'react'

export default function Snowfall() {
    const [snowflakes, setSnowflakes] = useState<Array<{ id: number, left: number, animationDuration: number, opacity: number }>>([])

    useEffect(() => {
        const createSnowflake = () => ({
            id: Math.random(),
            left: Math.random() * 100, // %
            animationDuration: Math.random() * 3 + 2, // 2-5s
            opacity: Math.random()
        })

        // Create initial batch
        setSnowflakes(Array.from({ length: 50 }).map(createSnowflake))
    }, [])

    return (
        <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden" aria-hidden="true">
            {snowflakes.map(flake => (
                <div
                    key={flake.id}
                    className="absolute top-[-10px] w-2 h-2 bg-white rounded-full"
                    style={{
                        left: `${flake.left}%`,
                        opacity: flake.opacity,
                        animation: `fall ${flake.animationDuration}s linear infinite`,
                        willChange: 'transform' // Performance optimization
                    }}
                />
            ))}
            <style jsx>{`
                @keyframes fall {
                    0% { transform: translateY(-10vh); }
                    100% { transform: translateY(110vh); }
                }
            `}</style>
        </div>
    )
}
