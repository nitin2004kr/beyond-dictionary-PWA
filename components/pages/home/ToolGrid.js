export default function ToolGrid({ children }) {
  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-3.5">
      {children}
    </div>
  );
}
