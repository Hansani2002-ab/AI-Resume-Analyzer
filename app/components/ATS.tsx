import React from 'react';


interface ATSProps {
  data?: string;
}

const ATS: React.FC<ATSProps> = ({ data }) => {
  return (
    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm transition-all hover:shadow-md">
      <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
        <span className="p-2 bg-blue-100 rounded-lg text-lg">📊</span>
        ATS Compatibility Summary
      </h3>
      <div className="space-y-4">
        {data ? (
          <div className="bg-blue-50/50 p-4 rounded-lg border border-blue-100">
            <p className="text-gray-700 leading-relaxed italic">
              "{data}"
            </p>
          </div>
        ) : (
          <div className="text-center py-4">
            <p className="text-gray-400 italic">No ATS data available. Run analysis to see results.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ATS;