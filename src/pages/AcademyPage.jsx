import React, { useState } from 'react';

const AcademyPage = () => {
  const [goal, setGoal] = useState('');
  const [course, setCourse] = useState(null);
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-3">Academy (Demo)</h1>
      <input className="border px-3 py-2 mr-2" placeholder="Training goal" value={goal} onChange={(e)=>setGoal(e.target.value)} />
      <button className="px-3 py-2 border" onClick={()=>setCourse({title: goal || 'Sample Course', lessons:['Intro','Steps','Quiz']})}>Generate</button>
      {course && (<div className="mt-4"><h2 className="text-xl font-semibold">{course.title}</h2><ul>{course.lessons.map(l=><li key={l}>{l}</li>)}</ul></div>)}
    </div>
  );
};

export default AcademyPage;
