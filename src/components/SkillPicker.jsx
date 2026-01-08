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
//       const { data, error } = await supabase
//         .from('skill_skills')
//         .select('*')
//         .order('name', { ascending: true });
      
//       if (error) console.error("Error fetching skills:", error);
//       else setAllSkills(data || []);
//     };
//     fetchAllSkills();
//   }, []);

//   // Filter skills based on search
//   const filteredSkills = allSkills.filter(skill => 
//     skill.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
//     !selectedSkills.find(s => s.id === skill.id)
//   );

//   const toggleSkill = (skill) => {
//     if (selectedSkills.find(s => s.id === skill.id)) {
//       setSelectedSkills(selectedSkills.filter(s => s.id !== skill.id));
//     } else {
//       setSelectedSkills([...selectedSkills, skill]);
//     }
//     setSearchTerm('');
//   };

//   return (
//     <div className="space-y-4">
//       <label className="text-[10px] uppercase tracking-[0.2em] font-black text-slate-500 ml-1">
//         Skills you {type === 'have' ? 'Expertise' : 'Interest'}
//       </label>

//       {/* Selected Badges */}
//       <div className="flex flex-wrap gap-2 min-h-[40px] p-2 rounded-2xl bg-slate-950/30 border border-white/5">
//         {selectedSkills.length === 0 && <span className="text-slate-600 text-sm italic ml-2 mt-1">None selected...</span>}
//         <AnimatePresence>
//           {selectedSkills.map(skill => (
//             <motion.span
//               initial={{ scale: 0.8, opacity: 0 }}
//               animate={{ scale: 1, opacity: 1 }}
//               exit={{ scale: 0.8, opacity: 0 }}
//               key={skill.id}
//               className="flex items-center gap-2 px-3 py-1.5 bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-bold rounded-xl"
//             >
//               {skill.name}
//               <X size={14} className="cursor-pointer hover:text-white" onClick={() => toggleSkill(skill)} />
//             </motion.span>
//           ))}
//         </AnimatePresence>
//       </div>

//       {/* Search & Dropdown */}
//       <div className="relative">
//         <div className="relative">
//           <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
//           <input
//             type="text"
//             placeholder="Filter skills..."
//             value={searchTerm}
//             onFocus={() => setIsOpen(true)}
//             onChange={(e) => setSearchTerm(e.target.value)}
//             className="w-full pl-12 pr-4 py-3 bg-brand-surface border border-white/5 rounded-2xl focus:border-cyan-500/50 outline-none transition-all text-sm"
//           />
//         </div>

//         <AnimatePresence>
//           {isOpen && (searchTerm || filteredSkills.length > 0) && (
//             <>
//               <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
//               <motion.ul 
//                 initial={{ opacity: 0, y: 10 }}
//                 animate={{ opacity: 1, y: 0 }}
//                 exit={{ opacity: 0, y: 10 }}
//                 className="absolute z-20 w-full mt-2 max-h-60 overflow-y-auto glass rounded-2xl p-2 custom-scrollbar"
//               >
//                 {filteredSkills.map(skill => (
//                   <li 
//                     key={skill.id}
//                     onClick={() => toggleSkill(skill)}
//                     className="flex items-center justify-between px-4 py-3 hover:bg-white/5 rounded-xl cursor-pointer transition-colors group"
//                   >
//                     <span className="text-slate-300 group-hover:text-cyan-400">{skill.name}</span>
//                     <Check size={16} className="text-cyan-500 opacity-0 group-hover:opacity-100" />
//                   </li>
//                 ))}
//                 {filteredSkills.length === 0 && (
//                   <li className="px-4 py-3 text-slate-500 text-sm italic">No skills found...</li>
//                 )}
//               </motion.ul>
//             </>
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

  const filtered = allSkills.filter(skill => 
    skill.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
    !selectedSkills.find(s => s.id === skill.id)
  );

  const toggleSkill = (skill) => {
    setSelectedSkills([...selectedSkills, skill]);
    setSearchTerm('');
    setIsOpen(false);
  };

  return (
    <div className="space-y-4">
      <label className="text-[10px] uppercase tracking-widest font-black text-slate-500 ml-1">
        Skills you {type === 'have' ? 'Expertise' : 'Interest'}
      </label>

      <div className="flex flex-wrap gap-2 min-h-[50px] p-3 rounded-2xl bg-slate-950/50 border border-white/5">
        {selectedSkills.map(skill => (
          <motion.span layout initial={{ scale: 0.8 }} animate={{ scale: 1 }} key={skill.id}
            className="flex items-center gap-2 px-3 py-1.5 bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-bold rounded-xl">
            {skill.name}
            <X size={14} className="cursor-pointer hover:text-white" onClick={() => setSelectedSkills(selectedSkills.filter(s => s.id !== skill.id))} />
          </motion.span>
        ))}
      </div>

      <div className="relative">
        <input
          type="text"
          placeholder="Search skills..."
          onFocus={() => setIsOpen(true)}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-4 pr-4 py-4 bg-slate-900/50 border border-white/5 rounded-2xl focus:border-cyan-500/50 outline-none text-sm transition-all"
        />
        <AnimatePresence>
          {isOpen && searchTerm && (
            <motion.ul initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="absolute z-50 w-full mt-2 max-h-48 overflow-y-auto glass rounded-2xl p-2 custom-scrollbar">
              {filtered.map(skill => (
                <li key={skill.id} onClick={() => toggleSkill(skill)}
                  className="flex items-center justify-between px-4 py-3 hover:bg-white/5 rounded-xl cursor-pointer text-slate-300 hover:text-cyan-400 transition-colors">
                  {skill.name} <Check size={14} className="text-cyan-500" />
                </li>
              ))}
            </motion.ul>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}