import { supabase } from '@/lib/supabaseClient';

const streamAndParse = async (body) => {
  const { data, error } = await supabase.functions.invoke('course-generator', {
    body,
    responseType: 'text', // Get the raw text response
  });

  if (error) {
    throw error;
  }
  
  try {
    return JSON.parse(data);
  } catch (e) {
    console.error("Failed to parse JSON response:", data);
    throw new Error("Invalid JSON response from server.");
  }
};


export const generateCourseContent = async (goal, options, onChunk) => {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  const functionUrl = `${supabaseUrl}/functions/v1/course-generator`;

  const response = await fetch(functionUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${anonKey}`
    },
    body: JSON.stringify({ trainingGoal: goal, options })
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to fetch course content.');
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let result = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    result += decoder.decode(value, { stream: true });
    try {
      // Try to parse the accumulating result. This works because we expect one single JSON object.
      const parsed = JSON.parse(result);
      onChunk(parsed); // Pass the progressively built object
    } catch (e) {
      // Incomplete JSON, continue accumulating
    }
  }

  // Final parse
  try {
    return JSON.parse(result);
  } catch(e) {
    console.error("Final JSON parse failed:", result);
    throw new Error("Could not parse the final course content.");
  }
};

export const regenerateCourseSection = async (sectionKey, goal, options, currentCourse) => {
   const response = await streamAndParse({
    sectionToRegenerate: sectionKey,
    trainingGoal: goal,
    options,
    currentCourse
  });
  return response;
};