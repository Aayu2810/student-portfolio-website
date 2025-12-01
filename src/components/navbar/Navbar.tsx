'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { Home, FolderOpen, ShieldCheck, FileText, User, Activity, Menu, X, LogIn, UserPlus } from 'lucide-react';

export function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'Locker', href: '/locker', icon: FolderOpen },
    { name: 'Verification', href: '/verification', icon: ShieldCheck },
    { name: 'Documents', href: '/documents', icon: FileText },
    { name: 'Audit Logs', href: '/audit-logs', icon: Activity },
    { name: 'Portfolio', href: '/portfolio', icon: FolderOpen },
    { name: 'Profile', href: '/profile', icon: User },
  ];

  // Check if user is on auth pages
  const isAuthPage = pathname?.startsWith('/login') || pathname?.startsWith('/register');
  const isHomePage = pathname === '/' || pathname === '';

  return (
    <nav className="bg-gray-800 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0 flex items-center">
              <span className="text-xl font-bold">CampusCred</span>
            </Link>
          </div>
          
          {/* Auth links for mobile */}
          {isAuthPage && (
            <div className="md:hidden flex items-center">
              <Link 
                href="/login" 
                className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium flex items-center"
              >
                <LogIn className="w-4 h-4 mr-1" />
                Login
              </Link>
            </div>
          )}

          {/* Mobile menu button */}
          {!isAuthPage && !isHomePage && (
            <div className="md:hidden flex items-center">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none"
              >
                {mobileMenuOpen ? (
                  <X className="block h-6 w-6" />
                ) : (
                  <Menu className="block h-6 w-6" />
                )}
              </button>
            </div>
          )}

          {/* Show auth links on home page and auth pages */}
          {(isHomePage || isAuthPage) && (
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                <Link 
                  href="/login" 
                  className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium flex items-center"
                >
                  <LogIn className="w-4 h-4 mr-2" />
                  Login
                </Link>
                <Link 
                  href="/register" 
                  className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium flex items-center"
                >
                  <UserPlus className="w-4 h-4 mr-2" />
                  Sign Up
                </Link>
              </div>
            </div>
          )}

          {/* Desktop Navigation for dashboard pages */}
          {!isHomePage && !isAuthPage && (
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`px-3 py-2 rounded-md text-sm font-medium flex items-center ${
                        isActive
                          ? 'bg-purple-600 text-white'
                          : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                      }`}
                    >
                      <Icon className="w-4 h-4 mr-2" />
                      {item.name}
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Navigation */}
      {!isAuthPage && !isHomePage && mobileMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-3 py-2 rounded-md text-base font-medium flex items-center ${
                    isActive
                      ? 'bg-purple-600 text-white'
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {item.name}
                </Link>
              );
            })}
            <div className="pt-4 border-t border-gray-700">
              <Link 
                href="/login" 
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-gray-700 flex items-center"
                onClick={() => setMobileMenuOpen(false)}
              >
                <LogIn className="w-4 h-4 mr-2" />
                Login
              </Link>
              <Link 
                href="/register" 
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-gray-700 flex items-center"
                onClick={() => setMobileMenuOpen(false)}
              >
                <UserPlus className="w-4 h-4 mr-2" />
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}