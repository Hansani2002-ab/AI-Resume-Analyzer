import Navbar from "~/components/Navbar";
import type { Route } from "./+types/home";
import ResumeCard from "~/components/ResumeCard";
import { useEffect, useState } from "react";
import { usePuterStore } from "~/lib/puter";
import { Link, useNavigate } from "react-router";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Resumind" },
    { name: "description", content: "Smart feedback for your dream job!" },
  ];
}

export default function Home() {
  const { auth, kv } = usePuterStore();
  const navigate = useNavigate();
  
  // TypeScript errors වැළැක්වීමට 'any[]' ලෙස define කර ඇත
  const [resumes, setResumes] = useState<any[]>([]);
  const [loadingResumes, setLoadingResumes] = useState(false);

  useEffect(() => {
    if (!auth.isAuthenticated) navigate('/auth?next=/');
  }, [auth.isAuthenticated, navigate]);

  useEffect(() => {
    const loadResumes = async () => {
      try {
        setLoadingResumes(true);
        // @ts-ignore
        const items = await kv.list('resume:*', true);

        if (items) {
          const parsedResumes = items.map((item: any) => {
            try {
              return typeof item.value === 'string' ? JSON.parse(item.value) : item.value;
            } catch (e) {
              return null;
            }
          }).filter((r: any) => r !== null);
          
          setResumes(parsedResumes);
        }
      } catch (err) {
        console.error("Error loading resumes:", err);
      } finally {
        setLoadingResumes(false);
      }
    };
    loadResumes();
  }, [kv]);

  return (
    <main className="bg-[#f8fafc] min-h-screen">
      <Navbar />

      <section className="max-w-6xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-slate-900 mb-4">
            Track Your Application & Resume Ratings
          </h1>
          {!loadingResumes && resumes?.length === 0 ? (
            <h2 className="text-xl text-slate-600">
              No resumes found. Upload your first resume to get feedback
            </h2>
          ) : (
            <h2 className="text-xl text-slate-600">
              Review your submission and check AI-powered feedback.
            </h2>
          )}
        </div>

        {/* Loading State */}
        {loadingResumes && (
          <div className="flex flex-col items-center justify-center py-20">
            <img src="/images/resume-scan-2.gif" className="w-[180px] opacity-80" alt="Loading..."/>
            <p className="text-slate-500 mt-4 animate-pulse text-lg">Fetching your resumes...</p>
          </div>
        )}

        {/* Resume Grid Section */}
        {!loadingResumes && resumes.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {resumes.map((resume) => (
              // @ts-ignore
              <ResumeCard key={resume.id} resume={resume} />
            ))}
          </div>
        )}

        {/* Empty State / Upload Button */}
        {!loadingResumes && resumes?.length === 0 && (
          <div className="flex flex-col items-center justify-center mt-10 p-12 bg-white rounded-3xl border-2 border-dashed border-slate-200 shadow-sm">
            <p className="text-slate-400 mb-6 text-center">Your dashboard is empty. Ready to improve your score?</p>
            <Link to='/upload' className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl text-xl font-bold transition-all transform hover:scale-105 shadow-lg">
              Upload New Resume
            </Link>
          </div>
        )}

        {/* Analyze Another Button */}
        {!loadingResumes && resumes.length > 0 && (
           <div className="flex justify-center mt-12">
              <Link to='/upload' className="bg-slate-900 hover:bg-slate-800 text-white px-6 py-3 rounded-lg font-semibold transition-colors">
                + Analyze Another Resume
              </Link>
           </div>
        )}
      </section>
    </main>
  );
}