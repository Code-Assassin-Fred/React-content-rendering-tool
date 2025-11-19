export default function Home() {
  return (
    <div className="p-10 space-y-4">
      <h1 className="text-3xl font-bold">Textbook Rendering Tool</h1>
      <p className="text-gray-600">Select an action:</p>

      <div className="space-x-4">
        <a href="/generate" className="text-blue-600 underline">
          Generate Content
        </a>
        <a href="/preview" className="text-blue-600 underline">
          Preview Renderer
        </a>
      </div>
    </div>
  );
}
