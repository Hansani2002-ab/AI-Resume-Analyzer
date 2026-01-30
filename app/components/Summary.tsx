import ScoreGauge from "~/components/ScoreGauge";
import ScoreBadge from "~/components/ScoreBadge";

// Helper component for individual categories
const Category = ({ title, score }: { title: string, score: number }) => {
    // Default to 0 if score is missing
    const safeScore = score ?? 0;
    const textColor = safeScore > 70 ? 'text-green-600' : safeScore > 49 ? 'text-yellow-600' : 'text-red-600';

    return (
        <div className="flex items-center justify-between p-4 border-b last:border-0">
            <div className="flex items-center gap-3">
                <span className="font-semibold text-lg">{title}</span>
                <ScoreBadge score={safeScore} />
            </div>
            <p className="text-xl font-bold">
                <span className={textColor}>{safeScore}</span>/100
            </p>
        </div>
    )
}

const Summary = ({ feedback }: { feedback: any }) => {
    // If feedback is still loading or undefined, return a loading state
    if (!feedback) return <div className="p-10 text-center">Loading feedback details...</div>;

    return (
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
            <div className="flex flex-col md:flex-row items-center p-6 gap-8 bg-gray-50">
                {/* Safety check for overall score */}
                <ScoreGauge score={feedback.overallScore ?? 0} />
                <div>
                    <h2 className="text-2xl font-bold">Your Resume Score</h2>
                    <p className="text-gray-500">Based on AI analysis against the job description.</p>
                </div>
            </div>

            {/* Added safety ?. to prevent crashes if the AI misses a category */}
            <Category title="Tone & Style" score={feedback.toneAndStyle?.score} />
            <Category title="Content" score={feedback.content?.score} />
            <Category title="Structure" score={feedback.structure?.score} />
            <Category title="Skills" score={feedback.skills?.score} />
        </div>
    )
}
export default Summary;