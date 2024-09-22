'use client'

import { ThemeProvider } from 'next-themes'
import { TaskProvider } from '@/context/TaskContext'
import Navbar from '@/components/Navbar'
import './globals.css'

export default function RootLayout({children}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <TaskProvider>
            <Navbar />
            <main>{children}</main>
          </TaskProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}