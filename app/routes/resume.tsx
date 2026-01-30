import { Link, useNavigate, useParams } from "react-router";
import { useEffect, useState } from "react";
import { usePuterStore } from "~/lib/puter";
import Summary from "~/components/Summary";
import ATS from "~/components/ATS";
import Details from "~/components/Details";

const Resume = () => {
    const { auth, isLoading, fs, kv } = usePuterStore();
    const { id } = useParams();
    const [imageUrl, setImageUrl] = useState('');
    const [resumeUrl, setResumeUrl] = useState('');
    const [feedback, setFeedback] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        if (!isLoading && !auth.isAuthenticated) navigate(`/auth?next=/resume/${id}`);
    }, [isLoading, auth.isAuthenticated, id, navigate]);

    useEffect(() => {
        const loadResume = async () => {
            try {
                const resume = await kv.get(`resume:${id}`);
                if (!resume) {
                    setError("Resume not found");
                    return;
                }

                const data = typeof resume === 'string' ? JSON.parse(resume) : resume;

                // Read PDF File
                if (data.resumePath) {
                    const resumeBlob = await fs.read(data.resumePath);
                    if (resumeBlob) {
                        setResumeUrl(URL.createObjectURL(new Blob([resumeBlob], { type: 'application/pdf' })));
                    }
                }

                // Read Image Preview
                if (data.imagePath) {
                    const imageBlob = await fs.read(data.imagePath);
                    if (imageBlob) {
                        setImageUrl(URL.createObjectURL(imageBlob as Blob));
                    }
                }

                // Parse AI feedback if it's stored as a string
                const parsedFeedback = typeof data.feedback === 'string' 
                    ? JSON.parse(data.feedback) 
                    : data.feedback;

                setFeedback(parsedFeedback);
            } catch (err) {
                console.error("Error loading resume:", err);
                setError("Failed to load resume analysis data.");
            }
        };
        loadResume();
    }, [id, fs, kv]);

    if (error) return <div className="p-10 text-red-500 font-bold">{error}</div>;

    return (
        <main className="min-h-screen bg-slate-50">
            {/* Professional Sticky Navigation */}
            <nav className="p-4 bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-50 border-b border-slate-100">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <Link 
                        to="/" 
                        className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-lg font-medium shadow-sm hover:bg-slate-50 hover:text-blue-600 hover:border-blue-200 transition-all group"
                    >
                        {/* Back Arrow Icon */}
                        <svg 
                            xmlns="http://www.w3.org/2000/svg" 
                            width="20" height="20" 
                            viewBox="0 0 24 24" fill="none" 
                            stroke="currentColor" strokeWidth="2.5" 
                            strokeLinecap="round" strokeLinejoin="round"
                            className="group-hover:-translate-x-1 transition-transform"
                        >
                            <path d="m15 18-6-6 6-6"/>
                        </svg>
                        Back to Homepage
                    </Link>
                    
                    <div className="text-slate-400 text-sm font-medium hidden sm:block">
                        AI Resume Analysis Report
                    </div>
                </div>
            </nav>

            <div className="flex flex-row w-full max-lg:flex-col-reverse">
                {/* Left Side: Resume Preview Window */}
                <section className="w-1/2 p-6 bg-slate-100 min-h-screen max-lg:w-full border-r border-slate-200">
                    {imageUrl ? (
                        <div className="sticky top-24">
                            <div className="bg-white p-2 rounded-xl shadow-2xl border border-slate-200">
                                <img src={imageUrl} alt="Resume Preview" className="w-full rounded-lg" />
                            </div>
                            <p className="text-center text-slate-400 mt-4 text-sm font-medium">Page 1 of 1</p>
                        </div>
                    ) : (
                        <div className="flex items-center justify-center h-[500px] bg-slate-200 rounded-2xl border-2 border-dashed border-slate-300">
                            <p className="text-slate-500 italic font-medium">No image preview available</p>
                        </div>
                    )}
                </section>

                {/* Right Side: Detailed Analysis Results */}
                <section className="w-1/2 p-8 md:p-12 max-lg:w-full bg-white">
                    <div className="max-w-2xl mx-auto">
                        <div className="mb-10">
                            <h2 className="text-4xl font-extrabold text-slate-900 mb-2">Resume Review</h2>
                            <p className="text-slate-500 font-medium">Detailed feedback based on your job requirements</p>
                        </div>
                        
                        {feedback ? (
                            <div className="flex flex-col gap-12">
                                {/* Summary Component */}
                                <Summary feedback={feedback} />
                                
                                {/* ATS Compatibility Component */}
                                <div className="p-1 border border-slate-100 rounded-3xl bg-slate-50/50">
                                    <ATS 
                                        score={feedback?.ATS?.score ?? feedback?.score ?? 0} 
                                        suggestions={feedback?.ATS?.tips ?? feedback?.suggestions ?? []} 
                                    />
                                </div>
                                
                                {/* In-depth Details Component */}
                                <Details feedback={feedback} />
                            </div>
                        ) : (
                            <div className="flex flex-col items-center gap-6 py-32">
                                <div className="relative">
                                    <div className="h-16 w-16 rounded-full border-4 border-slate-100 border-t-blue-600 animate-spin"></div>
                                </div>
                                <div className="text-center">
                                    <p className="text-slate-900 font-bold text-xl">Analyzing Your Content</p>
                                    <p className="text-slate-500 animate-pulse">Our AI is scanning your experience...</p>
                                </div>
                            </div>
                        )}
                    </div>
                </section>
            </div>
        </main>
    );
};

export default Resume;