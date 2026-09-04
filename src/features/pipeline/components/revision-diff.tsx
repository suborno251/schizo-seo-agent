import React from "react";
import { DiffToken } from "../types/pipeline";
import { defaultDiffTokens } from "../utils/diff-parser";

interface RevisionDiffProps {
  tokens?: DiffToken[];
}

export function RevisionDiff({ tokens = defaultDiffTokens }: RevisionDiffProps) {
  return (
    <section className="diff-container">
      <h3 className="diff-heading">Revision Diff</h3>
      <div className="diff-display-box">
        {tokens.map((token, index) => {
          if (token.type === "delete") {
            return (
              <span key={index} className="diff-del">
                {token.text}
              </span>
            );
          }
          if (token.type === "insert") {
            return (
              <span key={index} className="diff-ins">
                {token.text}
              </span>
            );
          }
          return <React.Fragment key={index}>{token.text}</React.Fragment>;
        })}
      </div>
    </section>
  );
}
