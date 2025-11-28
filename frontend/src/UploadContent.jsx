import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from './AuthContext';
import { UploadCloud, File, X, Loader2, Sparkles } from 'lucide-react';
import clsx from 'clsx';

export default function UploadContent() {
    const { token } = useAuth();
    const navigate = useNavigate();
    const [file, setFile] = useState(null);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [isUploading, setIsUploading] = useState(false);
    const [dragActive, setDragActive] = useState(false);

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            setFile(e.dataTransfer.files[0]);
        }
    };

    const handleChange = (e) => {
        e.preventDefault();
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!file || !title) return;

        setIsUploading(true);
        const formData = new FormData();
        formData.append('file', file);
        formData.append('title', title);
        formData.append('description', description);

        try {
            await axios.post('http://localhost:8082/api/content/file', formData, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data',
                },
            });
            navigate('/');
        } catch (error) {
            console.error('Upload failed:', error);
            alert('Upload failed. Please try again.');
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto">
            <header className="mb-10 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500/20 to-accent-500/20 border border-white/10 mb-6 shadow-lg shadow-primary-500/10">
                    <UploadCloud className="text-primary-400" size={32} />
                </div>
                <h1 className="text-4xl font-display font-bold text-white mb-3">Upload Content</h1>
                <p className="text-slate-400 text-lg">Add new study materials to your library.</p>
            </header>

            <form onSubmit={handleSubmit} className="space-y-8 glass-panel p-8 rounded-3xl">
                {/* File Drop Zone */}
                <div
                    className={clsx(
                        "relative border-2 border-dashed rounded-2xl p-12 transition-all duration-300 text-center cursor-pointer group overflow-hidden",
                        dragActive
                            ? "border-primary-500 bg-primary-500/10 shadow-[0_0_30px_rgba(99,102,241,0.2)]"
                            : "border-white/10 hover:border-primary-500/50 hover:bg-white/5",
                        file ? "bg-white/5 border-primary-500/30" : ""
                    )}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                >
                    <input
                        type="file"
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                        onChange={handleChange}
                        accept=".pdf"
                    />

                    {file ? (
                        <div className="relative z-10 flex items-center justify-center gap-6">
                            <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
                                <File size={32} />
                            </div>
                            <div className="text-left">
                                <p className="font-display font-bold text-white text-lg">{file.name}</p>
                                <p className="text-sm text-slate-400 font-medium">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                            </div>
                            <button
                                type="button"
                                onClick={(e) => { e.preventDefault(); setFile(null); }}
                                className="p-3 hover:bg-white/10 rounded-xl text-slate-400 hover:text-red-400 transition-colors z-30 ml-4"
                            >
                                <X size={24} />
                            </button>
                        </div>
                    ) : (
                        <div className="relative z-10">
                            <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 border border-white/5">
                                <UploadCloud size={40} className="text-slate-400 group-hover:text-primary-400 transition-colors" />
                            </div>
                            <p className="text-xl font-display font-medium text-white mb-2">Click to upload or drag and drop</p>
                            <p className="text-slate-400">PDF files only (max 10MB)</p>
                        </div>
                    )}

                    {/* Glow Effect */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-primary-500/5 to-accent-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                </div>

                {/* Metadata Fields */}
                <div className="grid gap-6">
                    <div>
                        <label htmlFor="title" className="block text-sm font-medium text-slate-300 mb-2 ml-1">Title</label>
                        <input
                            type="text"
                            id="title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="input-field"
                            placeholder="e.g., Introduction to Biology"
                            required
                        />
                    </div>

                    <div>
                        <label htmlFor="description" className="block text-sm font-medium text-slate-300 mb-2 ml-1">Description (Optional)</label>
                        <textarea
                            id="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={3}
                            className="input-field resize-none"
                            placeholder="Brief description of the content..."
                        />
                    </div>
                </div>

                <div className="flex justify-end gap-4 pt-6 border-t border-white/5">
                    <button
                        type="button"
                        onClick={() => navigate('/')}
                        className="btn-secondary"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={!file || !title || isUploading}
                        className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed min-w-[160px]"
                    >
                        {isUploading ? (
                            <>
                                <Loader2 className="animate-spin" size={20} />
                                Uploading...
                            </>
                        ) : (
                            <>
                                <Sparkles size={20} />
                                Upload Content
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}
