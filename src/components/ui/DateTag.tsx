export default function DateTag({ date }: { date: string }) {
  if (!date) return null;

  try {
    const today = new Date();
    const d = new Date(date);
    
    // Validate date
    if (isNaN(d.getTime())) return null;

    const todayDateOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const logDateOnly = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    
    const diffTime = todayDateOnly.getTime() - logDateOnly.getTime();
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24)); 
    
    if (diffDays === 0) {
      return <span className="inline-block ml-1.5 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-700 border border-emerald-200">Today</span>;
    }
    if (diffDays === 1) {
      return <span className="inline-block ml-1.5 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-amber-100 text-amber-700 border border-amber-200">Yesterday</span>;
    }
    
    return null;
  } catch (error) {
    return null;
  }
}
