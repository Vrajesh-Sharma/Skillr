// import { useState, useEffect } from 'react';
// import { supabase } from '../lib/supabase';
// import { motion, AnimatePresence } from 'framer-motion';
// import { Check, Search, X } from 'lucide-react';

// export default function SkillPicker({ type, selectedSkills, setSelectedSkills }) {
//   const [allSkills, setAllSkills] = useState([]);
//   const [searchTerm, setSearchTerm] = useState('');
//   const [isOpen, setIsOpen] = useState(false);

//   useEffect(() => {
//     const fetchAllSkills = async () => {
//       const { data } = await supabase.from('skill_skills').select('*').order('name');
//       setAllSkills(data || []);
//     };
//     fetchAllSkills();
//   }, []);

//   const filtered = allSkills.filter(skill => 
//     skill.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
//     !selectedSkills.find(s => s.id === skill.id)
//   );

//   const toggleSkill = (skill) => {
//     setSelectedSkills([...selectedSkills, skill]);
//     setSearchTerm('');
//     setIsOpen(false);
//   };

//   return (
//     <div className="space-y-4">
//       <label className="text-[10px] uppercase tracking-widest font-black text-slate-500 ml-1">
//         Skills you {type === 'have' ? 'Expertise' : 'Interest'}
//       </label>

//       <div className="flex flex-wrap gap-2 min-h-[50px] p-3 rounded-2xl bg-slate-950/50 border border-white/5">
//         {selectedSkills.map(skill => (
//           <motion.span layout initial={{ scale: 0.8 }} animate={{ scale: 1 }} key={skill.id}
//             className="flex items-center gap-2 px-3 py-1.5 bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-bold rounded-xl">
//             {skill.name}
//             <X size={14} className="cursor-pointer hover:text-white" onClick={() => setSelectedSkills(selectedSkills.filter(s => s.id !== skill.id))} />
//           </motion.span>
//         ))}
//       </div>

//       <div className="relative">
//         <input
//           type="text"
//           placeholder="Search skills..."
//           onFocus={() => setIsOpen(true)}
//           value={searchTerm}
//           onChange={(e) => setSearchTerm(e.target.value)}
//           className="w-full pl-4 pr-4 py-4 bg-slate-900/50 border border-white/5 rounded-2xl focus:border-cyan-500/50 outline-none text-sm transition-all"
//         />
//         <AnimatePresence>
//           {isOpen && searchTerm && (
//             <motion.ul initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
//               className="absolute z-50 w-full mt-2 max-h-48 overflow-y-auto glass rounded-2xl p-2 custom-scrollbar">
//               {filtered.map(skill => (
//                 <li key={skill.id} onClick={() => toggleSkill(skill)}
//                   className="flex items-center justify-between px-4 py-3 hover:bg-white/5 rounded-xl cursor-pointer text-slate-300 hover:text-cyan-400 transition-colors">
//                   {skill.name} <Check size={14} className="text-cyan-500" />
//                 </li>
//               ))}
//             </motion.ul>
//           )}
//         </AnimatePresence>
//       </div>
//     </div>
//   );
// }


import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Search, X } from 'lucide-react';

export default function SkillPicker({ type, selectedSkills, setSelectedSkills }) {
  const [allSkills, setAllSkills] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const fetchAllSkills = async () => {
      const { data } = await supabase.from('skill_skills').select('*').order('name');
      setAllSkills(data || []);
    };
    fetchAllSkills();
  }, []);

  const filtered = allSkills.filter(
    (skill) =>
      skill.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !selectedSkills.find((s) => s.id === skill.id),
  );

  const addSkill = (skill) => {
    setSelectedSkills([...selectedSkills, skill]);
    setSearchTerm('');
    setIsOpen(false);
  };

  const removeSkill = (id) => {
    setSelectedSkills(selectedSkills.filter((s) => s.id !== id));
  };

  const label =
    type === 'have' ? 'Skills you can teach' : 'Skills you want to learn';

  return (
    <div className="space-y-3">
      <label className="text-[11px] font-medium uppercase tracking-[0.16em] text-slate-500">
        {label}
      </label>

      <div className="flex flex-wrap gap-2 min-h-[44px] rounded-2xl border border-slate-800 bg-slate-950 px-3 py-2">
        {selectedSkills.length === 0 ? (
          <span className="text-xs text-slate-500">
            Start typing to search for skills.
          </span>
        ) : (
          selectedSkills.map((skill) => (
            <motion.span
              key={skill.id}
              layout
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="inline-flex items-center gap-2 rounded-full border border-slate-700 bg-slate-900 px-3 py-1 text-[11px] font-medium text-slate-100"
            >
              {skill.name}
              <button
                type="button"
                onClick={() => removeSkill(skill.id)}
                className="text-slate-500 hover:text-slate-200"
              >
                <X className="h-3 w-3" />
              </button>
            </motion.span>
          ))
        )}
      </div>

      <div className="relative">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search skills…"
            onFocus={() => setIsOpen(true)}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-2xl border border-slate-800 bg-slate-950 pl-9 pr-3 py-2.5 text-sm text-slate-100 outline-none focus:border-blue-500"
          />
        </div>

        <AnimatePresence>
          {isOpen && searchTerm && filtered.length > 0 && (
            <motion.ul
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 4 }}
              className="absolute z-30 mt-2 max-h-52 w-full overflow-y-auto rounded-2xl border border-slate-800 bg-slate-900/95 py-1 text-sm shadow-xl"
            >
              {filtered.map((skill) => (
                <li
                  key={skill.id}
                  onClick={() => addSkill(skill)}
                  className="flex cursor-pointer items-center justify-between px-3 py-2.5 text-slate-200 hover:bg-slate-800/80"
                >
                  {skill.name}
                  <Check className="h-3.5 w-3.5 text-blue-400" />
                </li>
              ))}
            </motion.ul>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
