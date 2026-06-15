import React, { useState } from 'react';
import { Search, BookOpen, AlertTriangle, Lightbulb, CheckCircle, ChevronRight, Copy, Check } from 'lucide-react';
import { DOCS_CONTENT } from '../data/docsContent';

interface DocsReaderProps {
  themeColor: 'emerald' | 'amber' | 'indigo' | 'rose' | 'sky';
}

export function DocsReader({ themeColor }: DocsReaderProps) {
  const [activePageId, setActivePageId] = useState('installation');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedCodeId, setCopiedCodeId] = useState<string | null>(null);

  const activePage = DOCS_CONTENT.find((page) => page.id === activePageId) || DOCS_CONTENT[0];

  const colorClasses = {
    emerald: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
    amber: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
    indigo: 'text-indigo-500 bg-indigo-500/10 border-indigo-500/20',
    rose: 'text-rose-500 bg-rose-500/10 border-rose-500/20',
    sky: 'text-sky-500 bg-sky-500/10 border-sky-500/20',
  };

  const focusRingClasses = {
    emerald: 'focus:border-emerald-500 focus:ring-emerald-500/10',
    amber: 'focus:border-amber-500 focus:ring-amber-500/10',
    indigo: 'focus:border-indigo-500 focus:ring-indigo-500/10',
    rose: 'focus:border-rose-500 focus:ring-rose-500/10',
    sky: 'focus:border-sky-500 focus:ring-sky-500/10',
  };

  const activeIndicatorClasses = {
    emerald: 'border-emerald-500 bg-emerald-950/20 text-emerald-400 font-medium',
    amber: 'border-amber-500 bg-amber-950/20 text-amber-400 font-medium',
    indigo: 'border-indigo-500 bg-indigo-950/20 text-indigo-400 font-medium',
    rose: 'border-rose-500 bg-rose-950/20 text-rose-400 font-medium',
    sky: 'border-sky-500 bg-sky-950/20 text-sky-400 font-medium',
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCodeId(id);
    setTimeout(() => setCopiedCodeId(null), 2000);
  };

  const filteredDocs = DOCS_CONTENT.filter(
    (page) =>
      page.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      page.purpose.toLowerCase().includes(searchQuery.toLowerCase()) ||
      page.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 border border-neutral-800 rounded-xl overflow-hidden bg-neutral-950/70 backdrop-blur-md h-[720px]" id="documentation_guides">
      {/* Sidebar with articles */}
      <div className="col-span-1 border-r border-neutral-800 p-4 flex flex-col h-full bg-neutral-950">
        <h3 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-3">Documentation</h3>

        {/* Search component */}
        <div className="relative mb-4">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-neutral-500" />
          <input
            type="text"
            placeholder="Search documentation guides..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full bg-neutral-900 border border-neutral-800 rounded-lg py-2 pl-9 pr-4 text-xs text-white placeholder-neutral-500 outline-none transition-all ${focusRingClasses[themeColor]}`}
          />
        </div>

        {/* Categories / items list */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-1 no-scrollbar select-none">
          {filteredDocs.length > 0 ? (
            <div>
              {/* Group by category */}
              {Array.from(new Set(filteredDocs.map((d) => d.category))).map((category) => (
                <div key={category} className="mb-4">
                  <div className="text-[10px] uppercase font-bold text-neutral-500 tracking-wider mb-1.5 px-2">
                    {category}
                  </div>
                  <div className="space-y-1">
                    {filteredDocs
                      .filter((d) => d.category === category)
                      .map((doc) => {
                        const isActive = doc.id === activePageId;
                        return (
                          <button
                            key={doc.id}
                            onClick={() => setActivePageId(doc.id)}
                            className={`w-full flex items-center justify-between py-2 px-2.5 rounded-lg text-left text-xs transition-colors cursor-pointer border-l-2 ${
                              isActive
                                ? activeIndicatorClasses[themeColor]
                                : 'border-transparent text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900'
                            }`}
                          >
                            <span className="truncate">{doc.title.substring(3)}</span>
                            <ChevronRight className={`w-3.5 h-3.5 self-center shrink-0 opacity-40 ${isActive ? 'opacity-90' : ''}`} />
                          </button>
                        );
                      })}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-neutral-500 text-center py-8">No results matching query found.</p>
          )}
        </div>
      </div>

      {/* Main Documentation Viewer */}
      <div className="col-span-3 h-full flex flex-col bg-neutral-950/20 overflow-y-auto no-scrollbar">
        {/* Title Block Header */}
        <div className="px-6 py-6 border-b border-neutral-800 bg-neutral-950">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase tracking-widest font-semibold px-2 py-0.5 rounded-full">
              {activePage.category}
            </span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">{activePage.title}</h2>
          <p className="text-xs text-neutral-400 mt-2 leading-relaxed max-w-3xl">{activePage.purpose}</p>
        </div>

        {/* Scrollable Contents */}
        <div className="p-6 space-y-6">
          {/* Architecture block with stylized diagram */}
          {activePage.architecture && (
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-2.5">
                Functional System Architecture
              </h4>
              <pre className="bg-[#0c0d12] border border-neutral-800 rounded-lg p-4 font-mono text-[11px] text-emerald-400 overflow-x-auto leading-relaxed select-none">
                {activePage.architecture}
              </pre>
            </div>
          )}

          {/* Setup steps */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-3 flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4 text-emerald-500" />
              Step-by-Step Security Integration
            </h4>
            <div className="space-y-2.5">
              {activePage.steps.map((step, idx) => (
                <div key={idx} className="flex gap-3 bg-neutral-900/40 border border-neutral-800/40 p-3 rounded-lg">
                  <span className="w-5 h-5 shrink-0 bg-neutral-800 text-neutral-300 font-bold font-mono text-xs rounded-full flex items-center justify-center">
                    {idx + 1}
                  </span>
                  <p className="text-xs text-neutral-300 mt-0.5 select-text leading-relaxed">{step}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Code block example */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
                Setup Example Code
              </h4>
              <button
                onClick={() => copyToClipboard(activePage.codeExample, activePage.id)}
                className="flex items-center gap-1 bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white px-2.5 py-1 rounded text-xs cursor-pointer transition-colors"
              >
                {copiedCodeId === activePage.id ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400 text-[10px] font-medium">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span className="text-[10px] font-medium">Copy Adapter</span>
                  </>
                )}
              </button>
            </div>
            <pre className="bg-[#0b0c10] border border-neutral-800 rounded-lg p-4 font-mono text-xs text-neutral-300 overflow-x-auto select-text leading-relaxed">
              <code>{activePage.codeExample}</code>
            </pre>
          </div>

          {/* Errors, Debug details & Best practices side-by-side */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Common Errors */}
            <div className="bg-rose-950/10 border border-rose-500/10 p-4 rounded-xl">
              <h5 className="text-xs font-bold text-rose-400 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-rose-500" />
                Common Errors &amp; Fixes
              </h5>
              <div className="space-y-2">
                {activePage.commonErrors.map((err, i) => (
                  <div key={i} className="text-xs text-neutral-300 border-l border-rose-500/20 pl-2.5 select-text">
                    {err}
                  </div>
                ))}
              </div>
            </div>

            {/* Best practices */}
            <div className="bg-emerald-950/10 border border-emerald-500/10 p-4 rounded-xl">
              <h5 className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                <Lightbulb className="w-4 h-4 text-emerald-500" />
                Best Development Practices
              </h5>
              <ul className="space-y-2">
                {activePage.bestPractices.map((prac, i) => (
                  <li key={i} className="text-xs text-neutral-300 border-l border-emerald-500/20 pl-2.5 select-text">
                    {prac}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
