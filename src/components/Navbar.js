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
    <nav className="bg-background text-foreground border-b">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="text-xl font-bold">
              Task Manager
            </Link>
          </div>
          <div className="hidden md:block">
            <div className="ml-10 flex items-center space-x-4">
              {token ? (
                <>
                  <Link href="/dashboard" className="hover:text-primary">
                    Dashboard
                  </Link>
                  <Button onClick={logout} variant="ghost">
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <Link href="/login" className="hover:text-primary">
                    Login
                  </Link>
                  <Link href="/signup" className="hover:text-primary">
                    Sign Up
                  </Link>
                </>
              )}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
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
              <SheetTrigger>
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
              </SheetTrigger>
              <SheetContent className="font-bold bg-white dark:bg-gray-800 text-black dark:text-white items-center">
                <SheetHeader>
                  <SheetTitle ><div className="items-center">Task Manager</div></SheetTitle>
                  <SheetDescription>
                    <div className="flex flex-col gap-5 ">
                      {token ? (
                        <>
                          <Link href="/dashboard" className="hover:text-primary">
                            Dashboard
                          </Link>
                          <Button onClick={logout} variant="ghost">
                            Logout
                          </Button>
                        </>
                      ) : (
                        <>
                          <Link href="/login" className="hover:text-primary">
                            Login
                          </Link>
                          <Link href="/signup" className="hover:text-primary">
                            Sign Up
                          </Link>
                        </>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
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
