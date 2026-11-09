import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { BarChart3, List, Building2, BookOpen, Users, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { buildOrgMap } from "@/lib/helpers";
import Dashboard from "@/components/Dashboard";
import ThemenView from "@/components/ThemenView";
import OrgView from "@/components/OrgView";
import BereicheView from "@/components/BereicheView";
import AkteursgruppenView from "@/components/AkteursgruppenView";
import SucheView from "@/components/SucheView";

const TABS = [
   { key: "dashboard", label: "Übersicht", icon: BarChart3 },
   { key: "themen", label: "Themen", icon: List },
   { key: "organisationen", label: "Organisationen", icon: Building2 },
   { key: "bereiche", label: "Bereiche", icon: BookOpen },
   { key: "akteursgruppen", label: "Akteursgruppen", icon: Users },
   { key: "suche", label: "Suche", icon: Search }
];

const NAV_KEY = "mainview";

function makeState({ view, themaIdx = null, orgNr = null, selectedBereich = null, selectedGruppe = null } = {}) {
   return { _nav: NAV_KEY, view, themaIdx, orgNr, selectedBereich, selectedGruppe };
}

export default function MainView({ organisationen, themen, bereiche }) {
   const [navState, setNavState] = useState(() => makeState({ view: "dashboard" }));
   const skipPushRef = useRef(false);

   const orgMap = useMemo(() => buildOrgMap(organisationen), [organisationen]);

   const gruppenCount = useMemo(() => new Set(organisationen.map(o => o.klassifizierung)).size, [organisationen]);

   // Push to browser history on state change (unless triggered by popstate)
   useEffect(() => {
      if (skipPushRef.current) {
         skipPushRef.current = false;
         return;
      }
      window.history.pushState(navState, "");
   }, [navState]);

   // Initialize + listen to browser back/forward
   useEffect(() => {
      window.history.replaceState(makeState({ view: "dashboard" }), "");
      const onPopstate = e => {
         if (e.state?._nav === NAV_KEY) {
            skipPushRef.current = true;
            setNavState(makeState(e.state));
         }
      };
      window.addEventListener("popstate", onPopstate);
      return () => window.removeEventListener("popstate", onPopstate);
   }, []);

   // Navigation: pushState (major nav = cross-view)
   const navigateToOrg = useCallback(nr => setNavState(() => makeState({ view: "organisationen", orgNr: String(nr) })), []);
   const navigateToThema = useCallback(idx => setNavState(() => makeState({ view: "themen", themaIdx: idx })), []);
   const navigateToBereich = useCallback(bereich => setNavState(() => makeState({ view: "bereiche", selectedBereich: bereich })), []);
   const navigateToGruppe = useCallback(gruppe => setNavState(() => makeState({ view: "akteursgruppen", selectedGruppe: gruppe })), []);

   // Tab switch and in-view selection: replaceState (no new history entry)
   const replaceNav = useCallback(changes => {
      setNavState(prev => {
         const next = makeState({ ...prev, ...changes });
         window.history.replaceState(next, "");
         skipPushRef.current = true;
         return next;
      });
   }, []);

   const setView = useCallback(key => replaceNav({ view: key }), [replaceNav]);
   const selectThemaIdx = useCallback(idx => replaceNav({ view: "themen", themaIdx: idx }), [replaceNav]);
   const selectOrgNr = useCallback(nr => replaceNav({ view: "organisationen", orgNr: nr }), [replaceNav]);
   const selectBereich = useCallback(bereich => replaceNav({ view: "bereiche", selectedBereich: bereich }), [replaceNav]);
   const selectGruppe = useCallback(gruppe => replaceNav({ view: "akteursgruppen", selectedGruppe: gruppe }), [replaceNav]);

   const tabCounts = { themen: themen.length, organisationen: organisationen.length, bereiche: bereiche.length, akteursgruppen: gruppenCount };

   return (
      <div className="h-screen flex flex-col overflow-hidden">
         <nav className="flex items-center justify-center border-b border-border shrink-0 mb-2">
            <div className="flex items-center">
               {TABS.map(t => {
                  const Icon = t.icon;
                  const isActive = navState.view === t.key;
                  return (
                     <button
                        key={t.key}
                        onClick={() => setView(t.key)}
                        className={cn(
                           "flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 lg:px-5 py-3 sm:py-3.5 text-xs sm:text-sm transition-colors border-b-2 -mb-px",
                           isActive ? "text-primary border-primary" : "text-muted-foreground border-transparent hover:text-foreground hover:border-border"
                        )}
                     >
                        <Icon className="size-3.5" />
                        <span className="hidden xs:inline">{t.label}</span>
                        {t.key in tabCounts && <span className="text-2xs sm:text-xs text-muted-foreground ml-0.5">({tabCounts[t.key]})</span>}
                     </button>
                  );
               })}
            </div>
         </nav>

         <main className="flex-1 min-h-0 overflow-hidden">
            {navState.view === "dashboard" && (
               <Dashboard
                  themen={themen}
                  organisationen={organisationen}
                  orgMap={orgMap}
                  bereiche={bereiche}
                  onNavigateToThema={navigateToThema}
                  onNavigateToOrg={navigateToOrg}
                  onNavigateToBereich={navigateToBereich}
                  onNavigateToGruppe={navigateToGruppe}
               />
            )}
            {navState.view === "themen" && <ThemenView themen={themen} orgMap={orgMap} selectedIdx={navState.themaIdx} onSelectIdx={selectThemaIdx} onNavigateToOrg={navigateToOrg} />}
            {navState.view === "organisationen" && (
               <OrgView
                  organisationen={organisationen}
                  themen={themen}
                  bereiche={bereiche}
                  orgMap={orgMap}
                  selectedNr={navState.orgNr}
                  onSelectNr={selectOrgNr}
                  onNavigateToThema={navigateToThema}
                  onNavigateToBereich={navigateToBereich}
                  onNavigateToGruppe={navigateToGruppe}
               />
            )}
            {navState.view === "bereiche" && <BereicheView bereiche={bereiche} orgMap={orgMap} selectedBereich={navState.selectedBereich} onSelectBereich={selectBereich} onNavigateToOrg={navigateToOrg} />}
            {navState.view === "akteursgruppen" && (
               <AkteursgruppenView organisationen={organisationen} selectedGruppe={navState.selectedGruppe} onSelectGruppe={selectGruppe} onNavigateToOrg={navigateToOrg} />
            )}
            {navState.view === "suche" && <SucheView organisationen={organisationen} onNavigateToOrg={navigateToOrg} />}
         </main>
      </div>
   );
}
