import { useMemo, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import OrgSummaryList from "@/components/custom/OrgSummaryList";
import { groupByKlassifizierung } from "@/lib/helpers";

export default function AkteursgruppenView({ organisationen, selectedGruppe, onSelectGruppe, onNavigateToOrg }) {
   const detailRef = useRef(null);

   const gruppen = useMemo(() => groupByKlassifizierung(organisationen), [organisationen]);
   const current = gruppen.find(g => g.klassifizierung === selectedGruppe) || null;

   // Scroll reset on selection change
   useEffect(() => {
      const viewport = detailRef.current?.querySelector('[data-slot="scroll-area-viewport"]');
      if (viewport) viewport.scrollTop = 0;
   }, [selectedGruppe]);

   // Auto-select first entry if none selected
   useEffect(() => {
      if (selectedGruppe === null && gruppen.length > 0) {
         onSelectGruppe(gruppen[0].klassifizierung);
      }
   }, [selectedGruppe, gruppen, onSelectGruppe]);

   return (
      <div className="flex h-full max-w-[1600px] mx-auto">
         {/* Sidebar */}
         <div className="w-80 lg:w-[420px] xl:w-[480px] border-r border-border flex flex-col shrink-0 overflow-hidden">
            <div className="flex-1 min-h-0">
               <ScrollArea className="h-full">
                  <div className="pt-2">
                     {gruppen.map(g => (
                        <button
                           key={g.klassifizierung}
                           onClick={() => onSelectGruppe(g.klassifizierung)}
                           className={cn(
                              "w-full text-left px-3 py-2.5 border-b border-border/40 transition-colors",
                              selectedGruppe === g.klassifizierung ? "bg-accent border-l-2 border-l-primary" : "hover:bg-accent/50"
                           )}
                        >
                           <div className="text-sm leading-snug">{g.klassifizierung}</div>
                           <div className="text-xs text-muted-foreground mt-1">
                              {g.orgs.length} Organisation{g.orgs.length !== 1 && "en"}
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
                  <h1 className="text-xl font-medium text-foreground leading-snug">{current.klassifizierung}</h1>
                  <div className="mt-1 text-sm text-primary">
                     {current.orgs.length} Organisation{current.orgs.length !== 1 && "en"}
                  </div>

                  <p className="mt-5 text-xs text-muted-foreground leading-relaxed border-l-4 border-primary/40 pl-4">
                     <strong className="text-foreground">Hinweis:</strong> Die Akteursgruppe ist die Klassifizierung, die die Bundesnetzagentur auf dem Deckblatt jeder Einreichung vermerkt hat. Wo dieses Feld leer war, wurde die Gruppe nachträglich anhand der einreichenden Organisation zugeordnet.
                  </p>

                  <div className="mt-8">
                     <h2 className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-3">Organisationen dieser Akteursgruppe</h2>
                     <OrgSummaryList orgs={current.orgs} onNavigateToOrg={onNavigateToOrg} resetKey={selectedGruppe} />
                  </div>
               </div>
            ) : (
               <div className="flex items-center justify-center h-full text-muted-foreground text-sm">Akteursgruppe aus der Liste auswählen</div>
            )}
         </ScrollArea>
      </div>
   );
}
