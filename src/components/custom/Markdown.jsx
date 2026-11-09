import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

// Externe Links in neuem Tab öffnen, sonst verlässt der Klick die App und die geladenen Daten sind weg.
// Fußnoten-Links (#...) bleiben auf der Seite.
const components = {
   a: ({ node, ...props }) => (props.href?.startsWith("#") ? <a {...props} /> : <a {...props} target="_blank" rel="noreferrer" />)
};

export default function Markdown({ children }) {
   return (
      <div className="markdown">
         <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
            {children}
         </ReactMarkdown>
      </div>
   );
}
