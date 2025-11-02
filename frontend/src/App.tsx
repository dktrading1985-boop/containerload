
export default function App() {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 antialiased">
      <header className="max-w-6xl mx-auto p-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">ContainerLoad</h1>
        <nav className="space-x-4 hidden md:block">
          <a href="#" className="text-gray-600 hover:text-gray-900">Calculator</a>
          <a href="#" className="text-gray-600 hover:text-gray-900">Templates</a>
          <a href="#" className="text-gray-600 hover:text-gray-900">Pricing</a>
        </nav>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-20 text-center">
        <h2 className="text-4xl md:text-5xl font-extrabold mb-4">Professional container load planning</h2>
        <p className="text-lg text-gray-600 mb-8">
          Fast, accurate load optimization with 3D previews and easy exports.
        </p>
        <div className="flex justify-center gap-4">
          <a className="px-6 py-3 rounded-md bg-sky-600 text-white font-semibold shadow" href="#">Get started</a>
          <a className="px-6 py-3 rounded-md border border-slate-200 text-slate-700" href="#">Learn more</a>
        </div>
      </main>

      <footer className="text-center text-sm text-slate-500 py-8 border-t border-slate-200">
        © 2025 All rights reserved · Developed by 
        <a href="https://www.dkwebart.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">DK Web Art</a> · 
        <span className="text-slate-600">+94 777 268 284</span>
      </footer>
    </div>
  );
}
