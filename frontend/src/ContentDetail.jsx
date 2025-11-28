import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { useAuth } from './AuthContext';
import { ArrowLeft, FileText, Sparkles, BrainCircuit, CheckCircle, XCircle, Loader2, Play } from 'lucide-react';
import clsx from 'clsx';

export default function ContentDetail() {
    const { id } = useParams();
    const { token } = useAuth();
    const [activeTab, setActiveTab] = useState('summary'); // 'summary' | 'mcq'
    const [selectedAnswers, setSelectedAnswers] = useState({});
    const [showResults, setShowResults] = useState(false);

    // Fetch Content Metadata
    const { data: content, isLoading: contentLoading } = useQuery({
        queryKey: ['content', id],
        queryFn: async () => {
            const res = await axios.get(`http://localhost:8082/api/content/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            return res.data;
        }
    });

    // Fetch AI Summary
    const { data: summaryData, isLoading: summaryLoading, isError: summaryError } = useQuery({
        queryKey: ['summary', id],
        queryFn: async () => {
            const res = await axios.post(`http://localhost:8083/api/process_content/${id}`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            return res.data;
        },
        enabled: !!content, // Only fetch if content loaded
        retry: false
    });

    // Generate MCQs Mutation
    const generateMcqMutation = useMutation({
        mutationFn: async () => {
            const res = await axios.post(`http://localhost:8084/api/generate_mcqs/${id}?num_questions=10`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            return res.data; // Assuming returns list of questions
        },
        onSuccess: () => {
            setSelectedAnswers({});
            setShowResults(false);
        }
    });

    const handleAnswerSelect = (questionIndex, optionIndex) => {
        if (showResults) return;
        setSelectedAnswers(prev => ({
            ...prev,
            [questionIndex]: optionIndex
        }));
    };

    const calculateScore = () => {
        if (!generateMcqMutation.data) return 0;
        let score = 0;
        generateMcqMutation.data.questions.forEach((q, idx) => {
            if (selectedAnswers[idx] === q.correct_option_index) score++;
        });
        return score;
    };

    if (contentLoading) return (
        <div className="flex items-center justify-center h-[50vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
        </div>
    );

    return (
        <div className="max-w-5xl mx-auto">
            <Link to="/" className="inline-flex items-center text-sm text-slate-400 hover:text-white mb-8 transition-colors group">
                <ArrowLeft size={16} className="mr-2 group-hover:-translate-x-1 transition-transform" /> Back to Dashboard
            </Link>

            {/* Header Card */}
            <div className="glass-panel rounded-3xl p-8 mb-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/10 rounded-full blur-[80px] -mr-16 -mt-16 pointer-events-none"></div>

                <div className="flex items-start justify-between relative z-10">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-display font-bold text-white mb-3">{content?.title}</h1>
                        <p className="text-slate-400 text-lg max-w-2xl leading-relaxed">{content?.description}</p>
                    </div>
                    <div className="hidden md:flex w-16 h-16 bg-white/5 rounded-2xl items-center justify-center border border-white/10 shadow-lg">
                        <FileText size={32} className="text-primary-400" />
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex p-1 bg-white/5 rounded-2xl mb-8 w-fit border border-white/5 backdrop-blur-sm">
                <button
                    onClick={() => setActiveTab('summary')}
                    className={clsx(
                        "px-6 py-3 rounded-xl text-sm font-medium transition-all duration-300 flex items-center gap-2",
                        activeTab === 'summary'
                            ? "bg-primary-600 text-white shadow-lg shadow-primary-500/25"
                            : "text-slate-400 hover:text-white hover:bg-white/5"
                    )}
                >
                    <Sparkles size={18} /> AI Summary
                </button>
                <button
                    onClick={() => setActiveTab('mcq')}
                    className={clsx(
                        "px-6 py-3 rounded-xl text-sm font-medium transition-all duration-300 flex items-center gap-2",
                        activeTab === 'mcq'
                            ? "bg-primary-600 text-white shadow-lg shadow-primary-500/25"
                            : "text-slate-400 hover:text-white hover:bg-white/5"
                    )}
                >
                    <BrainCircuit size={18} /> Practice Quiz
                </button>
            </div>

            <div className="min-h-[400px]">
                {activeTab === 'summary' && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {summaryLoading ? (
                            <div className="glass-panel rounded-3xl p-12 flex flex-col items-center justify-center text-center">
                                <div className="w-16 h-16 bg-primary-500/10 rounded-full flex items-center justify-center mb-6 animate-pulse">
                                    <Sparkles className="text-primary-400" size={32} />
                                </div>
                                <h3 className="text-xl font-display font-medium text-white mb-2">Generating Insights</h3>
                                <p className="text-slate-400">Our AI is analyzing your document to extract key takeaways...</p>
                            </div>
                        ) : summaryError ? (
                            <div className="glass-panel rounded-3xl p-12 text-center border-red-500/20">
                                <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <XCircle className="text-red-400" size={32} />
                                </div>
                                <h3 className="text-xl font-display font-medium text-white mb-2">Analysis Failed</h3>
                                <p className="text-slate-400">We couldn't generate a summary at this time. Please try again later.</p>
                            </div>
                        ) : (
                            <div className="glass-panel rounded-3xl p-8 md:p-10">
                                <h3 className="text-xl font-display font-bold text-white mb-6 flex items-center gap-3">
                                    <Sparkles className="text-accent-400" size={24} />
                                    Key Takeaways
                                </h3>
                                <div className="prose prose-invert prose-lg max-w-none text-slate-300 leading-relaxed">
                                    {summaryData?.summary || "No summary available."}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'mcq' && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {!generateMcqMutation.data ? (
                            <div className="glass-panel rounded-3xl p-16 text-center border-dashed border-2 border-white/10">
                                <div className="w-20 h-20 bg-gradient-to-br from-primary-500/20 to-accent-500/20 rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-lg shadow-primary-500/10 ring-1 ring-white/10">
                                    <BrainCircuit size={40} className="text-primary-400" />
                                </div>
                                <h3 className="text-2xl font-display font-bold text-white mb-3">Ready to test your knowledge?</h3>
                                <p className="text-slate-400 mb-10 max-w-md mx-auto">Generate an AI-powered quiz based on this content to reinforce your learning.</p>
                                <button
                                    onClick={() => generateMcqMutation.mutate()}
                                    disabled={generateMcqMutation.isPending}
                                    className="btn-primary text-lg px-8 py-4 mx-auto"
                                >
                                    {generateMcqMutation.isPending ? (
                                        <>
                                            <Loader2 className="animate-spin" size={24} />
                                            Generating Quiz...
                                        </>
                                    ) : (
                                        <>
                                            <Play size={24} fill="currentColor" />
                                            Start Quiz
                                        </>
                                    )}
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-8">
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="text-2xl font-display font-bold text-white">Practice Quiz</h3>
                                    {showResults && (
                                        <div className={clsx(
                                            "px-6 py-2 rounded-xl font-bold text-lg border",
                                            calculateScore() / generateMcqMutation.data.questions.length >= 0.7
                                                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                                : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                                        )}>
                                            Score: {calculateScore()} / {generateMcqMutation.data.questions.length}
                                        </div>
                                    )}
                                </div>

                                {generateMcqMutation.data.questions.map((q, qIdx) => (
                                    <div key={qIdx} className="glass-panel rounded-2xl p-8">
                                        <p className="text-lg font-medium text-white mb-6 flex gap-4">
                                            <span className="text-primary-400 font-display font-bold text-xl">0{qIdx + 1}</span>
                                            {q.question}
                                        </p>
                                        <div className="grid gap-3">
                                            {q.options.map((option, oIdx) => {
                                                const isSelected = selectedAnswers[qIdx] === oIdx;
                                                const isCorrect = q.correct_option_index === oIdx;

                                                let optionClass = "w-full text-left p-4 rounded-xl border transition-all duration-200 flex items-center justify-between group ";

                                                if (showResults) {
                                                    if (isCorrect) optionClass += "bg-emerald-500/10 border-emerald-500/30 text-emerald-300";
                                                    else if (isSelected && !isCorrect) optionClass += "bg-red-500/10 border-red-500/30 text-red-300";
                                                    else optionClass += "bg-white/5 border-white/5 text-slate-500 opacity-50";
                                                } else {
                                                    if (isSelected) optionClass += "bg-primary-500/20 border-primary-500/50 text-white shadow-[0_0_15px_rgba(99,102,241,0.15)]";
                                                    else optionClass += "bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/10 text-slate-300 hover:text-white";
                                                }

                                                return (
                                                    <button
                                                        key={oIdx}
                                                        onClick={() => handleAnswerSelect(qIdx, oIdx)}
                                                        className={optionClass}
                                                        disabled={showResults}
                                                    >
                                                        <span className="font-medium">{option}</span>
                                                        {showResults && isCorrect && <CheckCircle size={20} className="text-emerald-400" />}
                                                        {showResults && isSelected && !isCorrect && <XCircle size={20} className="text-red-400" />}
                                                        {!showResults && (
                                                            <div className={clsx(
                                                                "w-4 h-4 rounded-full border transition-all",
                                                                isSelected ? "border-primary-400 bg-primary-400" : "border-slate-500 group-hover:border-slate-300"
                                                            )} />
                                                        )}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ))}

                                {!showResults && (
                                    <div className="flex justify-end pt-4 pb-12">
                                        <button
                                            onClick={() => setShowResults(true)}
                                            disabled={Object.keys(selectedAnswers).length < generateMcqMutation.data.questions.length}
                                            className="btn-primary text-lg px-10 py-4 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            Submit Answers
                                        </button>
                                    </div>
                                )}

                                {showResults && (
                                    <div className="flex justify-center pt-4 pb-12">
                                        <button
                                            onClick={() => generateMcqMutation.mutate()}
                                            disabled={generateMcqMutation.isPending}
                                            className="btn-secondary text-lg px-10 py-4"
                                        >
                                            {generateMcqMutation.isPending ? (
                                                <>
                                                    <Loader2 className="animate-spin" size={20} />
                                                    Generating New Quiz...
                                                </>
                                            ) : (
                                                <>
                                                    <Play size={20} />
                                                    Try Another Quiz
                                                </>
                                            )}
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
