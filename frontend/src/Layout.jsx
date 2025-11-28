import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { LayoutDashboard, Upload, LogOut, Sparkles } from 'lucide-react';
import clsx from 'clsx';

export default function Layout() {
    const { userProfile, logout } = useAuth();
    const location = useLocation();

    const navItems = [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
        { icon: Upload, label: 'Upload Content', path: '/upload' },
    ];

    return (
        <div className="flex h-screen overflow-hidden relative selection:bg-primary-500/30 selection:text-primary-200">
            {/* Ambient Background Blobs */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-primary-600/20 rounded-full blur-[100px] animate-blob"></div>
                <div className="absolute top-[20%] right-[-10%] w-[400px] h-[400px] bg-accent-500/20 rounded-full blur-[100px] animate-blob animation-delay-2000"></div>
                <div className="absolute bottom-[-10%] left-[20%] w-[600px] h-[600px] bg-purple-600/20 rounded-full blur-[100px] animate-blob animation-delay-4000"></div>
            </div>

            {/* Floating Sidebar */}
            <aside className="w-20 lg:w-72 m-4 flex flex-col glass-panel rounded-2xl transition-all duration-300 z-50">
                <div className="p-6 flex items-center gap-3 border-b border-white/5">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center shadow-lg shadow-primary-500/20">
                        <Sparkles className="text-white" size={20} />
                    </div>
                    <h1 className="text-2xl font-display font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent hidden lg:block">
                        StudyAI
                    </h1>
                </div>

                <nav className="flex-1 p-4 space-y-2">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname === item.path;
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={clsx(
                                    'flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-200 group relative overflow-hidden',
                                    isActive
                                        ? 'bg-primary-500/10 text-white shadow-lg shadow-primary-500/5 border border-primary-500/20'
                                        : 'text-slate-400 hover:bg-white/5 hover:text-white hover:border-white/10 border border-transparent'
                                )}
                            >
                                {isActive && (
                                    <div className="absolute inset-0 bg-gradient-to-r from-primary-500/10 to-transparent opacity-50" />
                                )}
                                <Icon size={22} className={clsx("transition-colors relative z-10", isActive ? "text-primary-400" : "group-hover:text-white")} />
                                <span className="font-medium relative z-10 hidden lg:block">{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-white/5">
                    <div className="flex items-center gap-3 px-3 py-3 mb-2 rounded-xl bg-white/5 border border-white/5">
                        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center text-white font-bold border border-white/10 shadow-inner">
                            {userProfile?.firstName?.[0] || 'U'}
                        </div>
                        <div className="flex-1 min-w-0 hidden lg:block">
                            <p className="text-sm font-medium text-white truncate">
                                {userProfile?.firstName}
                            </p>
                            <p className="text-xs text-slate-400 truncate">{userProfile?.email}</p>
                        </div>
                    </div>
                    <button
                        onClick={logout}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 rounded-xl transition-colors border border-transparent hover:border-red-500/20"
                    >
                        <LogOut size={18} />
                        <span className="hidden lg:block">Sign Out</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-auto relative z-10">
                <div className="max-w-7xl mx-auto p-4 lg:p-8">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}
