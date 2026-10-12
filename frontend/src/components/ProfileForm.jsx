import { useState } from 'react'
import { Rocket, MapPin, Code2, X } from 'lucide-react'

const DEFAULT_SKILLS = 'React, JavaScript, Tailwind CSS'

export default function ProfileForm({ onSubmit, isLoading }) {
  const [targetRole, setTargetRole] = useState('Frontend Developer')
  const [skillInput, setSkillInput]  = useState(DEFAULT_SKILLS)
  const [location, setLocation]       = useState('Bengaluru, India')
  const [isRemote, setIsRemote]       = useState(false)

  const parsedSkills = skillInput.split(',').map(s => s.trim()).filter(Boolean)

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit({
      targetRole: targetRole.trim(),
      skills: parsedSkills,
      location: isRemote ? 'Remote India' : location.trim()
    })
  }

  const removeSkill = (skill) => {
    setSkillInput(parsedSkills.filter(s => s !== skill).join(', '))
  }

  return (
    <form onSubmit={handleSubmit} className="bg-slate-800/60 border border-slate-700 rounded-xl p-6 mb-6">
      <h2 className="text-white font-semibold text-base mb-4 flex items-center gap-2">
        <Code2 size={16} className="text-indigo-400" />
        Your Profile
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        {/* Target Role */}
        <div>
          <label className="block text-xs text-slate-400 mb-1.5 font-medium">Target Role</label>
          <input
            type="text"
            value={targetRole}
            onChange={e => setTargetRole(e.target.value)}
            className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
            placeholder="e.g. Frontend Developer"
            required
          />
        </div>

        {/* Location */}
        <div>
          <label className="block text-xs text-slate-400 mb-1.5 font-medium flex items-center gap-1.5">
            <MapPin size={12} /> Preferred Location
          </label>
          <input
            type="text"
            value={location}
            onChange={e => setLocation(e.target.value)}
            disabled={isRemote}
            className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 disabled:opacity-40 transition-colors"
            placeholder="e.g. Bengaluru, India"
          />
          <label className="flex items-center gap-2 mt-2 cursor-pointer">
            <input type="checkbox" checked={isRemote} onChange={e => setIsRemote(e.target.checked)}
              className="w-3.5 h-3.5 accent-indigo-500" />
            <span className="text-xs text-slate-400">Remote only</span>
          </label>
        </div>
      </div>

      {/* Skills */}
      <div className="mb-5">
        <label className="block text-xs text-slate-400 mb-1.5 font-medium">Your Skills (comma separated)</label>
        <input
          type="text"
          value={skillInput}
          onChange={e => setSkillInput(e.target.value)}
          className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors mb-2"
          placeholder="React, Node.js, Python..."
          required
        />
        {/* Skill Pills Preview */}
        <div className="flex flex-wrap gap-1.5">
          {parsedSkills.map(skill => (
            <span key={skill} className="flex items-center gap-1 bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs px-2.5 py-1 rounded-full">
              {skill}
              <button type="button" onClick={() => removeSkill(skill)} className="hover:text-red-400 transition-colors">
                <X size={10} />
              </button>
            </span>
          ))}
        </div>
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={isLoading || !targetRole.trim() || parsedSkills.length === 0}
        className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 text-sm"
      >
        <Rocket size={16} className={isLoading ? 'animate-bounce' : ''} />
        {isLoading ? 'Discovery Agent Running...' : 'Launch Discovery Agent'}
      </button>
    </form>
  )
}
