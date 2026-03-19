'use client'

import { useState, useEffect } from 'react'
import { MessageSquarePlus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export function FeedbackButton() {
  const [unreadCount, setUnreadCount] = useState(0)
  const pathname = usePathname()

  // Hide on admin pages and the feedback page itself
  const isHidden = pathname.startsWith('/admin') || pathname === '/feedback'

  useEffect(() => {
    if (isHidden) return

    const fetchUnreadCount = async () => {
      try {
        const response = await fetch('/api/feedback/count')
        if (response.ok) {
          const data = await response.json()
          setUnreadCount(data.count)
        }
      } catch (error) {
        console.error('Failed to fetch unread count:', error)
      }
    }

    fetchUnreadCount()
    // Refresh every minute
    const interval = setInterval(fetchUnreadCount, 60000)
    return () => clearInterval(interval)
  }, [isHidden])

  if (isHidden) return null

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <Link href="/feedback">
        <Button
          size="icon"
          className="h-14 w-14 rounded-full bg-gradient-to-br from-purple-600 via-blue-600 to-cyan-500 hover:from-purple-700 hover:to-blue-700 shadow-lg shadow-purple-500/30 border border-white/10 group relative transition-all duration-300 hover:scale-110 active:scale-95"
        >
          <MessageSquarePlus className="h-7 w-7 text-white group-hover:rotate-12 transition-transform" />
          
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white border-2 border-background animate-in zoom-in duration-300">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
          
          <span className="sr-only">Request or Report</span>
        </Button>
      </Link>
    </div>
  )
}
