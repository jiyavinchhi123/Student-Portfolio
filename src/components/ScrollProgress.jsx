export default function ScrollProgress({ value }) {
  return (
    <div className="fixed top-0 left-0 right-0 h-1 bg-slate-200/70 dark:bg-white/10 z-50">
      <div
        className="h-full bg-white transition-all duration-150"
        style={{ width: `${value}%` }}
      />
    </div>
  );
}
