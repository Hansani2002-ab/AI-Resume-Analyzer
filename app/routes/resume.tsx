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

                if (data.resumePath) {
                    const resumeBlob = await fs.read(data.resumePath);
                    if (resumeBlob) {
                        setResumeUrl(URL.createObjectURL(new Blob([resumeBlob as any], { type: 'application/pdf' })));
                    }
                }

                if (data.imagePath) {
                    const imageBlob = await fs.read(data.imagePath);
                    if (imageBlob) {
                        setImageUrl(URL.createObjectURL(imageBlob as Blob));
                    }
                }

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
            <nav className="p-4 bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-50 border-b border-slate-100">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <Link to="/" className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-lg font-medium shadow-sm hover:bg-slate-50 hover:text-blue-600 transition-all group">
                        Back to Homepage
                    </Link>
                    <div className="text-slate-400 text-sm font-medium hidden sm:block">AI Resume Analysis Report</div>
                </div>
            </nav>

            <div className="flex flex-row w-full max-lg:flex-col-reverse">
                <section className="w-1/2 p-6 bg-slate-100 min-h-screen max-lg:w-full border-r border-slate-200">
                    {imageUrl ? (
                        <div className="sticky top-24">
                            <div className="bg-white p-2 rounded-xl shadow-2xl border border-slate-200">
                                <img src={imageUrl} alt="Resume Preview" className="w-full rounded-lg" />
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center justify-center h-[500px] bg-slate-200 rounded-2xl border-2 border-dashed border-slate-300">
                            <p className="text-slate-500 italic font-medium">No image preview available</p>
                        </div>
                    )}
                </section>

                <section className="w-1/2 p-8 md:p-12 max-lg:w-full bg-white">
                    <div className="max-w-2xl mx-auto">
                        <div className="mb-10">
                            <h2 className="text-4xl font-extrabold text-slate-900 mb-2">Resume Review</h2>
                            <p className="text-slate-500 font-medium">Detailed feedback based on your job requirements</p>
                        </div>
                        
                        {feedback ? (
                            <div className="flex flex-col gap-12">
                                {/* @ts-ignore */}
                                <Summary feedback={feedback} />
                                
                                <div className="p-1 border border-slate-100 rounded-3xl bg-slate-50/50">
                                    {/* @ts-ignore */}
                                    <ATS 
                                        score={feedback?.ATS?.score || feedback?.score || 0} 
                                        suggestions={feedback?.ATS?.tips || feedback?.suggestions || []} 
                                    />
                                </div>
                                
                                {/* @ts-ignore */}
                                <Details feedback={feedback} />
                            </div>
                        ) : (
                            <div className="flex flex-col items-center gap-6 py-32">
                                <div className="h-16 w-16 rounded-full border-4 border-slate-100 border-t-blue-600 animate-spin"></div>
                                <p className="text-slate-900 font-bold text-xl text-center">Analyzing Your Content...</p>
                            </div>
                        )}
                    </div>
                </section>
            </div>
        </main>
    );
};

export default Resume;