import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  GraduationCap, 
  BookOpen, 
  UserCircle, 
  LogOut, 
  Menu, 
  X, 
  Sun, 
  Moon, 
  Info
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function Layout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'My Grades', path: '/grades', icon: GraduationCap },
    { name: 'About Developer', path: '/about', icon: Info },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300">
      {/* Mobile Top Bar */}
      <header className="sticky top-0 z-40 w-full border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md lg:hidden">
        <div className="flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-blue-600 dark:text-blue-400">
              CHERCHER
            </h1>
          </div>
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="rounded-md p-2 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            {isSidebarOpen ? <X /> : <Menu />}
          </button>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={cn(
            "fixed inset-y-0 left-0 z-50 w-[260px] transform border-r border-slate-800 bg-[#1e293b] text-white transition-transform duration-300 lg:static lg:translate-x-0",
            !isSidebarOpen && "-translate-x-full"
          )}
        >
          <div className="flex h-full flex-col">
            <div className="flex h-[72px] items-center border-b border-slate-700 px-6 text-center flex-col justify-center">
              <h1 className="text-sm font-bold tracking-widest text-white uppercase">
                CHERCHER SECONDARY SCHOOL
              </h1>
              <p className="text-[10px] text-slate-400 mt-1 uppercase font-medium">Teacher Portal</p>
            </div>

            <div className="flex-1 overflow-y-auto py-6">
              <nav className="space-y-1">
                {navItems.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsSidebarOpen(false)}
                    className={({ isActive }) =>
                      cn(
                        "flex items-center gap-3 px-6 py-4 text-sm font-medium transition-all duration-200 border-l-4",
                        isActive
                          ? "bg-[#334155] text-white border-blue-500"
                          : "text-slate-400 border-transparent hover:bg-[#334155] hover:text-white"
                      )
                    }
                  >
                    <item.icon className="h-5 w-5" />
                    {item.name}
                  </NavLink>
                ))}
              </nav>
            </div>

            <div className="border-t border-slate-700 p-4">
              <div className="mb-4 flex items-center gap-3 px-2">
                <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
                  {user?.teacherName?.charAt(0)}
                </div>
                <div className="flex-1 overflow-hidden">
                  <p className="truncate text-xs font-semibold">{user?.teacherName}</p>
                  <p className="truncate text-[10px] text-slate-400 uppercase">{user?.teacherId}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={toggleTheme}
                  className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-slate-700 py-2 text-[10px] font-bold uppercase transition-colors hover:bg-slate-700"
                >
                  {theme === 'light' ? <Moon size={14} /> : <Sun size={14} />}
                  <span>{theme === 'light' ? 'Dark' : 'Light'}</span>
                </button>
                <button
                  onClick={handleLogout}
                  className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-red-900/30 bg-red-900/20 py-2 text-[10px] font-bold uppercase text-red-400 transition-colors hover:bg-red-900/30"
                >
                  <LogOut size={14} />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          </div>
        </aside>

        {/* Backdrop */}
        <AnimatePresence>
          {isSidebarOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSidebarOpen(false)}
              className="fixed inset-0 z-40 bg-slate-950/40 backdrop-blur-sm lg:hidden"
            />
          )}
        </AnimatePresence>

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-w-0">
          <header className="hidden lg:flex h-[72px] items-center justify-between px-8 bg-white border-b border-slate-200 sticky top-0 z-30">
            <div className="flex items-center gap-2 text-sm">
              <span className="text-slate-400">Portal</span>
              <span className="text-slate-300">/</span>
              <span className="text-slate-800 font-medium">Overview</span>
            </div>
            <div className="flex items-center gap-6">
              <div className="relative">
                <input 
                  type="text" 
                  placeholder="Search records..." 
                  className="bg-slate-100 border-none text-xs rounded-lg px-4 py-2 w-64 focus:ring-2 focus:ring-blue-500 transition-all outline-none"
                />
              </div>
              <button className="text-slate-400 hover:text-slate-600 transition-colors">
                <Sun size={20} />
              </button>
            </div>
          </header>

          <main className="flex-1 px-4 py-8 lg:p-8 overflow-y-auto">
            <div className="mx-auto max-w-7xl">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
