import React from 'react';


interface DetailsProps {
  data?: string;
}

const Details: React.FC<DetailsProps> = ({ data }) => {
  return (
    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm mt-6 transition-all hover:shadow-md">
      <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
        <span className="p-2 bg-purple-100 rounded-lg text-lg">🔍</span>
        Detailed Improvement Suggestions
      </h3>
      <div className="prose prose-blue max-w-none">
        {data ? (
          <div className="text-gray-600 whitespace-pre-line leading-relaxed bg-gray-50/50 p-4 rounded-lg border border-gray-100">
            {data}
          </div>
        ) : (
          <div className="text-center py-4">
            <p className="text-gray-400 italic">Detailed analysis will appear here once the resume is processed.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Details;