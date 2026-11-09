import { useState, useMemo, useDeferredValue } from "react";
import { ArrowRight, ChevronDown, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import SearchInput from "@/components/custom/SearchInput";
import { ScrollArea } from "@/components/ui/scroll-area";
import { highlightParts, highlightAll, normalize, stripMarkdown } from "@/lib/helpers";

function Highlight({ parts }) {
   if (!parts) return null;
   return (
      <span>
         {parts.map((p, i) => (
            <span key={i} className={p.hl ? "bg-primary/30 text-primary" : ""}>
               {p.text}
            </span>
         ))}
      </span>
   );
}

function countMatches(lower, q) {
   let n = 0;
   let i = lower.indexOf(q);
   while (i !== -1) {
      n++;
      i = lower.indexOf(q, i + q.length);
   }
   return n;
}

export default function SucheView({ organisationen, query, setQuery, onNavigateToOrg }) {
   // Gesucht und angezeigt wird der Volltext ohne Markdown-Syntax
   const texte = useMemo(() => organisationen.map(org => ({ org, text: stripMarkdown(org.dokument) })), [organisationen]);
   const deferredQuery = useDeferredValue(query);
   const [expanded, setExpanded] = useState(new Set());

   const toggle = nr =>
      setExpanded(prev => {
         const next = new Set(prev);
         if (next.has(nr)) next.delete(nr);
         else next.add(nr);
         return next;
      });

   const results = useMemo(() => {
      if (deferredQuery.length < 2) return null;
      const q = normalize(deferredQuery);

      const matched = [];
      for (const { org, text } of texte) {
         const lower = normalize(text);
         if (lower.includes(q)) {
            matched.push({ org, text, count: countMatches(lower, q), textParts: highlightParts(text, deferredQuery) });
         }
      }

      return matched.sort((a, b) => b.count - a.count);
   }, [deferredQuery, texte]);

   const isStale = query !== deferredQuery;

   return (
      <div className="h-full flex flex-col">
         <div className="p-4 lg:p-6 border-b border-border shrink-0">
            <div className="max-w-4xl mx-auto">
               <SearchInput value={query} setValue={setQuery} placeholder="Wort oder Wortfolge in den ungekürzten Stellungnahmen suchen..." />
               {results && (
                  <div className="text-xs text-muted-foreground mt-2">
                     {results.length} Stellungnahme{results.length !== 1 && "n"} mit Treffern für "{deferredQuery}"
                     {isStale && <span className="text-foreground/30 ml-2">Suche&hellip;</span>}
                  </div>
               )}
            </div>
         </div>

         <div className="flex-1 min-h-0">
            <ScrollArea className="h-full">
               <div className={cn("p-4 lg:p-6 max-w-4xl mx-auto", isStale && "opacity-70 transition-opacity")}>
                  {results && results.length === 0 && <div className="text-sm text-muted-foreground">Keine Ergebnisse gefunden.</div>}

                  {results && results.length > 0 && (
                     <div className="space-y-2">
                        {results.map(r => {
                           const isExpanded = expanded.has(r.org.nr);
                           return (
                              <div key={r.org.nr} className="rounded-lg border border-border/60 overflow-hidden">
                                 <button onClick={() => toggle(r.org.nr)} className="w-full text-left p-3 hover:bg-accent/50 transition-colors group">
                                    <div className="flex items-center gap-2 flex-wrap">
                                       {isExpanded ? <ChevronDown className="size-3.5 text-muted-foreground shrink-0" /> : <ChevronRight className="size-3.5 text-muted-foreground shrink-0" />}
                                       <span className="text-xs font-medium text-primary">{r.org.abkürzung}</span>
                                       <span className="text-xs text-foreground/40 truncate">{r.org.organisation}</span>
                                       <span className="text-xs text-muted-foreground ml-auto shrink-0">
                                          {r.count} Treffer
                                       </span>
                                    </div>
                                    {!isExpanded && r.textParts && (
                                       <div className="text-xs text-foreground/60 mt-1 line-clamp-3 ml-5">
                                          <Highlight parts={r.textParts} />
                                       </div>
                                    )}
                                 </button>
                                 {isExpanded && (
                                    <div className="px-3 pb-3 pt-2 border-t border-border/40">
                                       <p className="text-xs text-foreground/70 leading-relaxed whitespace-pre-line">
                                          <Highlight parts={highlightAll(r.text, deferredQuery)} />
                                       </p>
                                       <button onClick={() => onNavigateToOrg(r.org.nr)} className="flex items-center gap-1 text-xs text-primary hover:underline mt-2">
                                          Zur Organisation
                                          <ArrowRight className="size-3" />
                                       </button>
                                    </div>
                                 )}
                              </div>
                           );
                        })}
                     </div>
                  )}
               </div>
            </ScrollArea>
         </div>
      </div>
   );
}
