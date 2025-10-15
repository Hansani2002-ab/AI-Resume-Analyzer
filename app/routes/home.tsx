import Navbar from "~/components/Navbar";
import type { Route } from "./+types/home";
import { resumes} from "constants"; 
import ResumeCard from "~/components/ResumeCard";
import { useEffect } from "react";
import { usePuterStore } from "~/lib/puter";
import { useLocation, useNavigate } from "react-router";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Resumind" },
    { name: "description", content: "Smart feedback for your dream job!" },
  ];
}

export default function Home() {

 const { auth } = usePuterStore(); 
 const location = useLocation();
  const navigate = useNavigate();

 
  


 useEffect(() => {
  if (!auth.isAuthenticated) navigate('/auth?next=/');

}, [auth.isAuthenticated]);
  return (
    <main className="bg-[url('/images/bg-main.svg')] bg-cover">
      <Navbar />

      <section className="main-section">
        <div className="page-heading">
          <h1>Track Your Application & Resume Ratings</h1>
          <h2>Review your submission and check AI-powered feedback.</h2>
        </div>
      

     {Array.isArray(resumes) && resumes.length > 0 && (
  <div className="resume-section grid grid-cols-1 lg:grid-cols-3 gap-6 px-4 py-8">
    {resumes.slice(0, 6).map((resume) => (
      <ResumeCard key={resume.id} resume={resume} />
    ))}
  </div>
)}

      </section>
    </main>
  );
}
