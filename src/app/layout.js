'use client'

import { ThemeProvider } from 'next-themes'
import { TaskProvider } from '@/context/TaskContext'
import Navbar from '@/components/Navbar'
import './globals.css'

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Task Manager</title>
        <meta name="description" content="A powerful task management application" />
      </head>
      <body>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <TaskProvider>
            <div className="flex flex-col min-h-screen">
              <Navbar />
              <main className="flex-grow">{children}</main>
              <footer className="py-4 text-center">
                <p>&copy; {new Date().getFullYear()} Task Manager. All rights reserved.</p>
              </footer>
            </div>
          </TaskProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}