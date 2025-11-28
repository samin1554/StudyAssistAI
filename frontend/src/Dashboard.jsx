import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useAuth } from './AuthContext';
import { Link } from 'react-router-dom';
import { FileText, Calendar, ArrowRight, Plus } from 'lucide-react';

export default function Dashboard() {
    const { token } = useAuth();

    const { data: contents, isLoading, error } = useQuery({
        queryKey: ['my-content'],
        queryFn: async () => {
            const response = await axios.get('http://localhost:8082/api/content/my-content', {
                headers: { Authorization: `Bearer ${token}` }
            });
            return response.data;
        }
    });

    if (isLoading) return (
        <div className="flex items-center justify-center h-[50vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
        </div>
    );

    if (error) return <div className="text-center py-20 text-red-400">Error loading content. Please try again.</div>;

    return (
        <div className="space-y-8">
            <header className="flex items-end justify-between pb-6 border-b border-white/5">
                <div>
                    <h1 className="text-4xl font-display font-bold text-white mb-2">My Library</h1>
                    <p className="text-slate-400">Manage your study materials and generate AI summaries.</p>
                </div>
                <Link to="/upload" className="btn-primary shadow-lg shadow-primary-500/20">
                    <Plus size={20} /> New Upload
                </Link>
            </header>

            {contents?.length === 0 ? (
                <div className="text-center py-32 glass-panel rounded-3xl border-dashed border-2 border-white/10">
                    <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6 ring-1 ring-white/10">
                        <FileText className="text-slate-500" size={32} />
                    </div>
                    <h3 className="text-xl font-display font-medium text-white">No content yet</h3>
                    <p className="text-slate-400 mt-2 mb-8 max-w-md mx-auto">Upload your first PDF to get started with AI-powered summaries and quizzes.</p>
                    <Link to="/upload" className="btn-primary inline-flex">
                        Upload Content
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {contents.map((item) => (
                        <Link
                            to={`/content/${item.id}`}
                            key={item.id}
                            className="glass-card rounded-2xl p-6 group relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                <ArrowRight className="text-primary-400 -rotate-45 group-hover:rotate-0 transition-transform duration-300" />
                            </div>

                            <div className="flex items-start justify-between mb-6">
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-white/10 to-white/5 border border-white/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                    <FileText className="text-primary-400" size={24} />
                                </div>
                                <span className="text-[10px] font-bold tracking-wider uppercase px-2.5 py-1 bg-white/5 text-slate-400 rounded-full border border-white/5">
                                    {item.contentType || 'PDF'}
                                </span>
                            </div>

                            <h3 className="text-xl font-display font-semibold text-white mb-2 line-clamp-1 group-hover:text-primary-400 transition-colors">{item.title}</h3>
                            <p className="text-sm text-slate-400 mb-6 line-clamp-2 h-10 leading-relaxed">{item.description || 'No description provided.'}</p>

                            <div className="flex items-center justify-between pt-4 border-t border-white/5">
                                <div className="flex items-center text-xs text-slate-500 gap-1.5">
                                    <Calendar size={14} />
                                    {new Date(item.createdAt).toLocaleDateString()}
                                </div>
                                <span className="text-xs font-medium text-primary-400 opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0 transition-all duration-300">
                                    View Details
                                </span>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
