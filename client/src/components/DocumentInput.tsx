import styled from "styled-components";
import { useRef } from "react";

type DocumentInputProps = {
  onDocumentInput: (doc: string) => void;
};

export const DocumentInput = ({ onDocumentInput }: DocumentInputProps) => {
  const inputRef = useRef<any>(null);
  return (
    <DocumentInputPanel>
      <StyledTextArea
        ref={inputRef}
        rows={40}
        placeholder="Enter the document to summarise here."
      />
      <StyledButton
        onClick={() => {
          if (inputRef.current) onDocumentInput(inputRef.current.value);
        }}
      >
        Summarise
      </StyledButton>
    </DocumentInputPanel>
  );
};

const StyledTextArea = styled.textarea`
  resize: vertical;
  font: inherit;
  border-radius: 0.3em;
  padding: 0.5em;
`;

const StyledButton = styled.button`
  font: inherit;
  padding: 0.5em 1em;
  align-self: center;
`;

const DocumentInputPanel = styled.div`
  display: flex;
  flex-direction: column;
  row-gap: 1em;
`;
