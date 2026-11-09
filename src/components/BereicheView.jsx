import { useMemo, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import OrgSummaryList from "@/components/custom/OrgSummaryList";
import { bereichLabel } from "@/lib/helpers";

export default function BereicheView({ bereiche, orgMap, selectedBereich, onSelectBereich, onNavigateToOrg }) {
   const detailRef = useRef(null);
   const h2Ref = useRef(null);
   const ch4Ref = useRef(null);

   const scrollToSection = ref => ref.current?.scrollIntoView({ behavior: "smooth", block: "start" });

   const current = useMemo(() => (selectedBereich ? bereiche.find(b => b.bereich === selectedBereich) : null), [selectedBereich, bereiche]);

   const orgs = useMemo(() => {
      if (!current) return [];
      return current.organisationen
         .map(nr => orgMap.get(String(nr)))
         .filter(Boolean)
         .sort((a, b) => a.abkürzung.localeCompare(b.abkürzung, "de"));
   }, [current, orgMap]);

   const hasOrgs = !!current && current.organisationen.length > 0;
   const hasH2CH4 = hasOrgs && current.zusammenfassung_H2 != null;

   // Scroll reset on selection change
   useEffect(() => {
      const viewport = detailRef.current?.querySelector('[data-slot="scroll-area-viewport"]');
      if (viewport) viewport.scrollTop = 0;
   }, [selectedBereich]);

   // Auto-select first entry if none selected
   useEffect(() => {
      if (selectedBereich === null && bereiche.length > 0) {
         onSelectBereich(bereiche[0].bereich);
      }
   }, [selectedBereich, bereiche, onSelectBereich]);

   return (
      <div className="flex h-full max-w-[1600px] mx-auto">
         {/* Sidebar */}
         <div className="w-80 lg:w-[420px] xl:w-[480px] border-r border-border flex flex-col shrink-0 overflow-hidden">
            <div className="flex-1 min-h-0">
               <ScrollArea className="h-full">
                  <div className="pt-2">
                     {bereiche.map(b => (
                        <button
                           key={b.bereich}
                           onClick={() => onSelectBereich(b.bereich)}
                           className={cn(
                              "w-full text-left px-3 py-2.5 border-b border-border/40 transition-colors",
                              selectedBereich === b.bereich ? "bg-accent border-l-2 border-l-primary" : "hover:bg-accent/50"
                           )}
                        >
                           <div className="text-sm leading-snug">{bereichLabel(b)}</div>
                           <div className="text-xs text-muted-foreground mt-1">
                              {b.organisationen.length} Organisation{b.organisationen.length !== 1 && "en"} mit inhaltlicher Position
                           </div>
                        </button>
                     ))}
                  </div>
               </ScrollArea>
            </div>
         </div>

         {/* Detail */}
         <ScrollArea className="flex-1" ref={detailRef}>
            {current ? (
               <div className="p-6 lg:p-8">
                  <h1 className="text-xl font-medium text-foreground leading-snug">{bereichLabel(current)}</h1>

                  {current.fragen.length > 0 ? (
                     <div className="mt-5">
                        <h2 className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-2">Leitfrage{current.fragen.length !== 1 && "n"} der Bundesnetzagentur</h2>
                        <div className="space-y-2">
                           {current.fragen.map((f, i) => (
                              <p key={i} className="text-sm text-foreground/80 leading-relaxed border-l-4 border-primary/40 pl-4 italic">
                                 {f}
                              </p>
                           ))}
                        </div>
                     </div>
                  ) : (
                     <p className="mt-5 text-sm text-foreground/80 leading-relaxed border-l-4 border-primary/40 pl-4">
                        Positionen, die keinem der elf Fragenkomplexe des Begleitdokuments zuzuordnen sind, z.B. zum Verfahren, zum Wasserstoff-Kernnetz, zum ausreichenden Maß an FZK, zu L-Gas, zur Verzahnung mit dem Szenariorahmen Strom oder zu Planungs- und Genehmigungsfragen.
                     </p>
                  )}

                  {hasOrgs && (
                     <>
                        <div className="mt-8">
                           <h2 className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-3">Zusammenfassung der Stellungnahmen zu diesem Bereich</h2>
                           {hasH2CH4 && (
                              <div className="flex flex-wrap items-center gap-2 mb-4 text-xs text-muted-foreground">
                                 <span>Springe zu:</span>
                                 <button onClick={() => scrollToSection(h2Ref)} className="px-2 py-0.5 rounded bg-primary/10 text-primary hover:bg-primary/20 transition-colors">
                                    Wasserstoff (H₂)
                                 </button>
                                 <button onClick={() => scrollToSection(ch4Ref)} className="px-2 py-0.5 rounded bg-primary/10 text-primary hover:bg-primary/20 transition-colors">
                                    Methan (CH₄)
                                 </button>
                              </div>
                           )}
                           <p className="text-xs text-muted-foreground leading-relaxed border-l-4 border-primary/40 pl-4 mb-5">
                              <strong className="text-foreground">Hinweis:</strong> Die Zuordnung zu den Bereichen ist inhaltlich: Eine Position erscheint in dem Bereich, zu dem sie fachlich passt — unabhängig davon, ob die Organisation die Leitfragen der Bundesnetzagentur ausdrücklich beantwortet hat oder unter welcher Überschrift die Position in ihrer Stellungnahme steht.
                           </p>
                           <p className="text-sm text-foreground/90 leading-relaxed whitespace-pre-line">{current.zusammenfassung}</p>
                           {hasH2CH4 && (
                              <>
                                 <h3 ref={h2Ref} className="scroll-mt-4 text-sm font-medium text-primary mt-6 mb-2">
                                    Wasserstoff (H₂)
                                 </h3>
                                 <p className="text-sm text-foreground/90 leading-relaxed whitespace-pre-line">{current.zusammenfassung_H2}</p>
                                 <h3 ref={ch4Ref} className="scroll-mt-4 text-sm font-medium text-primary mt-6 mb-2">
                                    Methan (CH₄)
                                 </h3>
                                 <p className="text-sm text-foreground/90 leading-relaxed whitespace-pre-line">{current.zusammenfassung_CH4}</p>
                              </>
                           )}
                        </div>

                        <div className="mt-8">
                           <h2 className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-3">Organisationen mit inhaltlicher Position ({orgs.length})</h2>
                           <OrgSummaryList orgs={orgs} onNavigateToOrg={onNavigateToOrg} resetKey={selectedBereich} />
                        </div>
                     </>
                  )}

                  {!hasOrgs && <div className="mt-8 text-sm text-muted-foreground">Keine Beiträge zu diesem Bereich.</div>}
               </div>
            ) : (
               <div className="flex items-center justify-center h-full text-muted-foreground text-sm">Bereich aus der Liste auswählen</div>
            )}
         </ScrollArea>
      </div>
   );
}
