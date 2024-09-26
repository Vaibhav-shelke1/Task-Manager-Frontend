"use client";

import Link from "next/link";
import { useTaskContext } from "@/context/TaskContext";
import { Button } from "@/components/ui/button";
import { MoonIcon, SunIcon } from "lucide-react";
import { useTheme } from "next-themes";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"

export default function Navbar() {
  const { token, logout } = useTaskContext();
  const { theme, setTheme } = useTheme();

  return (
    <nav className="bg-white dark:bg-gray-800 border-b border-purple-200 dark:border-purple-800">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="text-xl font-bold text-purple-600 dark:text-purple-400">
              TaskFlow
            </Link>
          </div>
          <div className="hidden md:block">
            <div className="ml-10 flex items-center space-x-4">
              {token ? (
                <>
                  <Link href="/dashboard" className="text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition duration-300">
                    Dashboard
                  </Link>
                  <Button onClick={logout} variant="ghost" className="text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition duration-300">
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <Link href="/login" className="text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition duration-300">
                    Login
                  </Link>
                  <Link href="/signup" className="text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition duration-300">
                    Sign Up
                  </Link>
                </>
              )}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition duration-300"
              >
                {theme === "dark" ? (
                  <SunIcon className="h-5 w-5" />
                ) : (
                  <MoonIcon className="h-5 w-5" />
                )}
              </Button>
            </div>
          </div>
          
          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition duration-300">
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M4 6h16M4 12h16m-7 6h7"
                    ></path>
                  </svg>
                </Button>
              </SheetTrigger>
              <SheetContent className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">
                <SheetHeader>
                  <SheetTitle className="text-purple-600 dark:text-purple-400">TaskFlow</SheetTitle>
                  <SheetDescription>
                    <div className="flex flex-col gap-5 mt-4">
                      {token ? (
                        <>
                          <Link href="/dashboard" className="text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition duration-300">
                            Dashboard
                          </Link>
                          <Button onClick={logout} variant="ghost" className="text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition duration-300">
                            Logout
                          </Button>
                        </>
                      ) : (
                        <>
                          <Link href="/login" className="text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition duration-300">
                            Login
                          </Link>
                          <Link href="/signup" className="text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition duration-300">
                            Sign Up
                          </Link>
                        </>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                        className="text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition duration-300"
                      >
                        {theme === "dark" ? (
                          <SunIcon className="h-5 w-5" />
                        ) : (
                          <MoonIcon className="h-5 w-5" />
                        )}
                      </Button>
                    </div>
                  </SheetDescription>
                </SheetHeader>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
}