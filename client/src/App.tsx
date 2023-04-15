import styled from "styled-components";
import { DocumentSummariser } from "./components/DocumentSummariser";
import { useState } from "react";
import { DocumentInput } from "./components/DocumentInput";

export const App = () => {
  const [documentToSummarise, setDocumentToSummarise] = useState<
    string | undefined
  >(undefined);

  return (
    <Panel>
      <Header>Document Summariser</Header>
      <p>
        A tool that generates an interactive summary of an arbitrary input text.
        (© Michael Barlow {new Date().getFullYear()})
      </p>
      {documentToSummarise ? (
        <DocumentSummariser documentText={documentToSummarise} />
      ) : (
        <DocumentInput onDocumentInput={(doc) => setDocumentToSummarise(doc)} />
      )}
    </Panel>
  );
};

const Header = styled.h2`
  margin: 0;
`;

const Panel = styled.div`
  display: flex;
  flex-direction: column;
  margin: 1em;
`;
