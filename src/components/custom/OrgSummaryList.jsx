import { useState, useEffect } from "react";
import { ChevronRight, ChevronDown, ArrowRight } from "lucide-react";

// Aufklappbare Liste von Organisationen mit ihrer Zusammenfassung.
// resetKey: bei Änderung (z.B. anderes Thema ausgewählt) werden alle Einträge zugeklappt.
export default function OrgSummaryList({ orgs, onNavigateToOrg, resetKey }) {
   const [expanded, setExpanded] = useState(new Set());

   useEffect(() => setExpanded(new Set()), [resetKey]);

   const toggle = nr =>
      setExpanded(prev => {
         const next = new Set(prev);
         if (next.has(nr)) next.delete(nr);
         else next.add(nr);
         return next;
      });

   return (
      <div className="space-y-1.5">
         {orgs.map(org => {
            const isExpanded = expanded.has(org.nr);
            return (
               <div key={org.nr} className="rounded-lg border border-border/60 overflow-hidden">
                  <button onClick={() => toggle(org.nr)} className="w-full flex items-center gap-2 px-3 py-2.5 text-left hover:bg-accent/50 transition-colors">
                     {isExpanded ? <ChevronDown className="size-3.5 text-muted-foreground shrink-0" /> : <ChevronRight className="size-3.5 text-muted-foreground shrink-0" />}
                     <span className="text-sm font-medium text-primary shrink-0">{org.abkürzung}</span>
                     <span className="text-xs text-muted-foreground truncate">{org.organisation}</span>
                  </button>
                  {isExpanded && (
                     <div className="px-3 pb-3 pt-2 border-t border-border/40 space-y-2">
                        <p className="text-3xs uppercase tracking-wider text-muted-foreground">Zusammenfassung der Stellungnahme</p>
                        <p className="text-xs text-foreground/70 leading-relaxed whitespace-pre-line">{org.zusammenfassung}</p>
                        <button onClick={() => onNavigateToOrg(org.nr)} className="flex items-center gap-1 text-xs text-primary hover:underline">
                           Ungekürzte Stellungnahme der Organisation ansehen
                           <ArrowRight className="size-3" />
                        </button>
                     </div>
                  )}
               </div>
            );
         })}
      </div>
   );
}
