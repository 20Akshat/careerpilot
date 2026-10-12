import { X, BookOpen, ExternalLink } from 'lucide-react'

export default function GapBridgeModal({ missingSkills, learningResources, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-slate-800 border border-slate-700 rounded-xl w-full max-w-lg shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-700">
          <div className="flex items-center gap-2">
            <BookOpen size={16} className="text-amber-400" />
            <h3 className="text-white font-semibold text-sm">Skill Gap Bridge</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="p-5">
          {/* Missing Skills */}
          <p className="text-xs text-slate-400 mb-2 font-medium">Missing Skills Detected:</p>
          <div className="flex flex-wrap gap-1.5 mb-5">
            {missingSkills.map(skill => (
              <span key={skill}
                className="text-xs bg-amber-500/20 text-amber-400 border border-amber-500/30 px-2.5 py-1 rounded-full capitalize">
                ✗ {skill}
              </span>
            ))}
          </div>

          {/* Learning Resources */}
          <p className="text-xs text-slate-400 mb-2 font-medium flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full inline-block"></span>
            Free Learning Resources (via SerpApi Google Search)
          </p>

          {learningResources && learningResources.length > 0 ? (
            <div className="flex flex-col gap-3">
              {learningResources.map((res, i) => (
                <a
                  key={i}
                  href={res.link}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-start gap-3 bg-slate-900/60 border border-slate-700 hover:border-indigo-500/50 rounded-lg p-3 transition-colors group"
                >
                  <div className="w-7 h-7 bg-indigo-500/20 text-indigo-400 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                    <ExternalLink size={12} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white font-medium group-hover:text-indigo-400 transition-colors line-clamp-1">
                      {res.title}
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5 line-clamp-2">{res.snippet}</p>
                  </div>
                </a>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-500 bg-slate-900/50 rounded-lg p-3">
              Learning resources not available in offline mode. Add SERPAPI_API_KEY to enable live resource discovery.
            </p>
          )}
        </div>

        <div className="px-5 pb-5">
          <button onClick={onClose}
            className="w-full text-sm text-slate-400 hover:text-white border border-slate-700 hover:border-slate-500 rounded-lg py-2 transition-colors">
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
