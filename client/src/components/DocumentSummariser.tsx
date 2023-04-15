import { useState } from "react";

import styled from "styled-components";
import { useSummariser } from "../hooks/useSummariser";

type DocumentSummariserProps = {
  documentText: string;
};

// An interactive component that displays a document along with its summary
export const DocumentSummariser = ({
  documentText,
}: DocumentSummariserProps) => {
  const [loadingError, setLoadingError] = useState<Error | undefined>(
    undefined
  );
  const [paragraphs, sentences, getSimilarities] = useSummariser(
    documentText,
    setLoadingError
  );
  const [similarities, setSimilarities] = useState<number[] | undefined>(
    undefined
  );
  const [highlightedSentenceIndex, setHighlightedSentenceIndex] = useState<
    number | undefined
  >(undefined);

  const onSentenceClick = (sentenceIndex: number) => {
    setSimilarities(getSimilarities(sentenceIndex));
    setHighlightedSentenceIndex(sentenceIndex);
  };

  if (loadingError) return <div>Error: {loadingError.message}</div>;
  if (!sentences || !paragraphs) return <div>Loading...</div>;

  return (
    <DocumentSummariserPanel>
      <SummaryPanel>
        <StyledHeader>Summary</StyledHeader>
        <p>
          {sentences.map((sentence, index) => (
            <SummarySentence
              key={index}
              onClick={() => onSentenceClick(index)}
              highlighted={index === highlightedSentenceIndex}
            >
              {sentence}
            </SummarySentence>
          ))}
        </p>
      </SummaryPanel>
      <DocumentPanel>
        <StyledHeader>Document</StyledHeader>
        {paragraphs.map((paragraph, index) => (
          <DocumentParagraph key={index} similarity={similarities?.[index]}>
            {paragraph}
          </DocumentParagraph>
        ))}
      </DocumentPanel>
    </DocumentSummariserPanel>
  );
};

const StyledHeader = styled.h3`
  margin: 0.8em 0 0 0;
`;

const DocumentSummariserPanel = styled.div`
  display: grid;
  grid-template-columns: 30% 1fr;
  grid-template-rows: 0, 1fr;
  grid-gap: 1em;
`;

const SummaryPanel = styled.div`
  grid-column: 1 / span 1;
  grid-row: 1 / span 1;
  background-color: #f0f0f0;
  border-radius: 0.5em;
  padding: 0em 1em;
`;

const DocumentPanel = styled.div`
  grid-column: 2 / span 1;
  grid-row: 1 / span 2;
  background-color: #f0f0f0;
  border-radius: 0.5em;
  padding: 0em 1em;
`;

const DocumentParagraph = styled.p<{ similarity?: number }>`
  background-color: ${(props) =>
    `rgba(17,181,228,${(props.similarity ?? 0) * 0.7})`};
  transition: background-color 0.5s;
  border-radius: 0.2em;
  padding: 0.2em;
`;

const SummarySentence = styled.span<{ highlighted: boolean }>`
  background-color: ${(props) =>
    props.highlighted ? "rgba(252,171,16,0.5)" : "none"};
  margin-right: 0.2em;
  &:hover {
    background-color: yellow;
    cursor: pointer;
  }
`;
