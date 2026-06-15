import React, { useState } from 'react';
import { Folder, FolderOpen, FileCode, Copy, Check, Search, Download } from 'lucide-react';
import { FileNode } from '../types';
import { BOILERPLATE_FILES } from '../data/boilerplateCode';

interface CodeExplorerProps {
  themeColor: 'emerald' | 'amber' | 'indigo' | 'rose' | 'sky';
}

export function CodeExplorer({ themeColor }: CodeExplorerProps) {
  const [selectedFile, setSelectedFile] = useState<FileNode>(
    BOILERPLATE_FILES[0].children?.[0] || BOILERPLATE_FILES[0]
  );
  const [copied, setCopied] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({
    'prisma': true,
    'src': true,
    'src/integrations': true,
    'src/integrations/payments': true,
    'src/integrations/kyc': false,
    'src/integrations/sms': false,
    'src/integrations/banking': false,
    'src/app': false,
    'src/app/api': false,
    'src/app/api/auth': false,
    'src/app/api/openapi': false,
    'tests': false,
    'tests/api': false,
    'sdk': false,
    'sdk/typescript': false,
    'sdk/python': false,
    '.github': false,
    '.github/workflows': false,
  });

  const colorClasses = {
    emerald: 'text-emerald-500 bg-emerald-500/10 hover:bg-emerald-500/20 border-emerald-500/20',
    amber: 'text-amber-500 bg-amber-500/10 hover:bg-amber-500/20 border-amber-500/20',
    indigo: 'text-indigo-500 bg-indigo-500/10 hover:bg-indigo-500/20 border-indigo-500/20',
    rose: 'text-rose-500 bg-rose-500/10 hover:bg-rose-500/20 border-rose-500/20',
    sky: 'text-sky-500 bg-sky-500/10 hover:bg-sky-500/20 border-sky-500/20',
  };

  const borderFocusClasses = {
    emerald: 'focus:border-emerald-500 focus:ring-emerald-500/20',
    amber: 'focus:border-amber-500 focus:ring-amber-500/20',
    indigo: 'focus:border-indigo-500 focus:ring-indigo-500/20',
    rose: 'focus:border-rose-500 focus:ring-rose-500/20',
    sky: 'focus:border-sky-500 focus:ring-sky-500/20',
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleFolder = (path: string) => {
    setExpandedFolders((prev) => ({ ...prev, [path]: !prev[path] }));
  };

  const downloadFile = (file: FileNode) => {
    if (!file.content) return;
    const blob = new Blob([file.content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = file.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const downloadAllAsZipMock = () => {
    alert("In production, this generates a complete ZIP file archive of AfriLaunch Kit boilerplate including the configured SQLite/Postgres DB setup, package.json files, multi-tenant configurations, Docker assets, and Next.js routers setup. \n\nClicking individual files in the code explorer allows you to download them instantly to start building!");
  };

  const renderTree = (nodes: FileNode[], depth = 0) => {
    return nodes.map((node) => {
      const isExpanded = expandedFolders[node.path];
      const hasQueryMatch = searchQuery
        ? node.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (node.children && node.children.some(child => child.name.toLowerCase().includes(searchQuery.toLowerCase())))
        : true;

      if (searchQuery && !hasQueryMatch) return null;

      if (node.isDirectory) {
        return (
          <div key={node.path} className="select-none">
            <button
              onClick={() => toggleFolder(node.path)}
              className="w-full flex items-center gap-2 py-1 px-2 hover:bg-neutral-800 rounded text-left text-neutral-300 text-sm transition-colors"
              style={{ paddingLeft: `${depth * 12 + 8}px` }}
            >
              {isExpanded ? (
                <FolderOpen className="w-4 h-4 text-amber-400 shrink-0" />
              ) : (
                <Folder className="w-4 h-4 text-amber-500 shrink-0" />
              )}
              <span className="font-medium truncate">{node.name}</span>
            </button>
            {isExpanded && node.children && (
              <div className="mt-0.5">{renderTree(node.children, depth + 1)}</div>
            )}
          </div>
        );
      } else {
        const isSelected = selectedFile?.path === node.path;
        return (
          <button
            key={node.path}
            onClick={() => setSelectedFile(node)}
            className={`w-full flex items-center gap-2 py-1.5 px-2 rounded text-left text-xs transition-colors shrink-0 ${
              isSelected
                ? 'bg-neutral-800 text-white font-medium border-l-2'
                : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900'
            }`}
            style={{
              paddingLeft: `${depth * 12 + 8}px`,
              borderLeftColor: isSelected ? `var(--theme-primary-color, currentColor)` : 'transparent',
              '--theme-primary-color':
                themeColor === 'emerald'
                  ? '#10b981'
                  : themeColor === 'amber'
                  ? '#f59e0b'
                  : themeColor === 'indigo'
                  ? '#6366f1'
                  : themeColor === 'rose'
                  ? '#f43f5e'
                  : '#0ea5e9',
            } as React.CSSProperties}
          >
            <FileCode className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-emerald-400' : 'text-neutral-500'}`} />
            <span className="truncate">{node.name}</span>
          </button>
        );
      }
    });
  };

  // Flat Search matches for flat display when searching is active
  const filterFlatFiles = (nodes: FileNode[]): FileNode[] => {
    let list: FileNode[] = [];
    nodes.forEach((node) => {
      if (node.isDirectory && node.children) {
        list = [...list, ...filterFlatFiles(node.children)];
      } else if (!node.isDirectory) {
        if (node.name.toLowerCase().includes(searchQuery.toLowerCase())) {
          list.push(node);
        }
      }
    });
    return list;
  };

  const flatFiles = searchQuery ? filterFlatFiles(BOILERPLATE_FILES) : [];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 border border-neutral-800 rounded-xl overflow-hidden bg-neutral-950/70 backdrop-blur-md h-[720px]" id="code_explorer">
      {/* Code Tree Sidebar */}
      <div className="col-span-1 border-r border-neutral-800 p-4 flex flex-col h-full bg-neutral-950">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-neutral-200 uppercase tracking-wider">File Explorer</h3>
          <button
            onClick={downloadAllAsZipMock}
            className={`flex items-center gap-1.5 text-xs py-1 px-2.5 rounded-md border font-medium cursor-pointer transition-all ${colorClasses[themeColor]}`}
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Zip</span>
          </button>
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-neutral-500" />
          <input
            type="text"
            placeholder="Search boilerplate files..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full bg-neutral-900 border border-neutral-800 rounded-lg py-2 pl-9 pr-4 text-xs text-white placeholder-neutral-500 outline-none transition-all ${borderFocusClasses[themeColor]}`}
          />
        </div>

        {/* Scrollable File Node List */}
        <div className="flex-1 overflow-y-auto space-y-1 no-scrollbar pr-1">
          {searchQuery ? (
            flatFiles.length > 0 ? (
              flatFiles.map((file) => (
                <button
                  key={file.path}
                  onClick={() => setSelectedFile(file)}
                  className={`w-full flex items-center gap-2 py-1.5 px-3 rounded text-left text-xs transition-colors ${
                    selectedFile.path === file.path ? 'bg-neutral-800 text-white font-medium' : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900'
                  }`}
                >
                  <FileCode className="w-3.5 h-3.5 text-emerald-400" />
                  <div className="truncate">
                    <div className="font-medium text-neutral-200">{file.name}</div>
                    <div className="text-[10px] text-neutral-500 mt-0.5 truncate">{file.path}</div>
                  </div>
                </button>
              ))
            ) : (
              <p className="text-xs text-neutral-500 text-center py-8">No matching files found</p>
            )
          ) : (
            renderTree(BOILERPLATE_FILES)
          )}
        </div>
      </div>

      {/* Code Editor View */}
      <div className="col-span-3 flex flex-col h-full bg-[#0d0e14]">
        {/* Editor Title Bar */}
        <div className="flex items-center justify-between border-b border-neutral-800 py-3 px-4 bg-neutral-950">
          <div className="flex items-center gap-2.5 min-w-0">
            <FileCode className="w-4 h-4 text-emerald-400 shrink-0" />
            <div className="min-w-0">
              <h4 className="text-xs font-semibold text-neutral-200 truncate">{selectedFile?.name || 'Empty'}</h4>
              <p className="text-[10px] text-neutral-500 truncate mt-0.5">{selectedFile?.path}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {selectedFile?.description && (
              <span className="hidden sm:inline text-[10px] bg-neutral-900 border border-neutral-800 text-neutral-400 py-1 px-2.5 rounded-full">
                {selectedFile.description}
              </span>
            )}
            <button
              onClick={() => copyToClipboard(selectedFile?.content || '')}
              className="flex items-center gap-1 bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-neutral-200 px-2.5 py-1.5 rounded-md text-xs border border-neutral-800 cursor-pointer transition-colors"
              title="Copy code"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy</span>
                </>
              )}
            </button>
            <button
              onClick={() => downloadFile(selectedFile)}
              className="bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-neutral-200 p-1.5 rounded-md border border-neutral-800 cursor-pointer transition-colors"
              title="Download file"
            >
              <Download className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Selected Code Content Panel with line numbering */}
        <div className="flex-1 overflow-y-auto font-mono text-xs flex p-4 select-text leading-relaxed">
          {selectedFile?.content ? (
            <div className="flex w-full gap-4">
              {/* Lines number */}
              <div className="text-right text-neutral-600 select-none border-r border-neutral-800 pr-3 pt-0.5 sticky left-0 bg-[#0d0e14] h-fit">
                {selectedFile.content.split('\n').map((_, index) => (
                  <div key={index} className="h-5">
                    {index + 1}
                  </div>
                ))}
              </div>
              {/* Styled text syntax highlight simulation */}
              <pre className="text-left select-text whitespace-pre overflow-x-auto text-neutral-300 w-full pt-0.5">
                <code>{selectedFile.content}</code>
              </pre>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-neutral-500">
              <FileCode className="w-8 h-8 opacity-25 mb-2" />
              <p>Select a file to view code structure</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
