import { useCallback, useEffect, useState } from "react";

type Sentence = {
  text: string;
  embedding: number[];
};

type Paragraph = {
  text: string;
  embedding: number[];
};

type Summary = Sentence[];
type Document = Paragraph[];

type SummariserData = {
  summary: Summary;
  document: Document;
};

type SummariserReturn = [
  string[] | undefined,
  string[] | undefined,
  (sentenceIndex: number) => number[] | undefined
];

// A hook that takes care of document summarisation and similarity calculation. This hook expects
// as input a document (as a string) and a callback function to handle errors. It will use the known
// backend endpoint to fetch a summary of the input document along with relevant embeddings.
export const useSummariser = (
  document: string,
  onError: (err: Error) => void
): SummariserReturn => {
  const [summariserData, setSummariserData] = useState<
    SummariserData | undefined
  >(undefined);

  // Computes the (unit interval) similarity between an embedding and an array of embeddings.
  const computeSimilarities = (
    embedding: number[],
    embeddings: number[][]
  ): number[] => {
    const dotProduct = (a: number[], b: number[]): number =>
      a.map((e, i) => e * b[i]).reduce((x, y) => x + y);
    return embeddings.map((e) => dotProduct(e, embedding));
  };

  // Redistributes an array of unit intervals so that the min value is 0 and the max value is 1.
  const redistributeArray = (values: number[]): number[] => {
    const min = Math.min(...values);
    return values.map((v) => (v - min) / (Math.max(...values) - min));
  };

  // Computes the (unit interval) similarities between a sentence and each paragraph in the
  // document, where the least similar paragraph has a value of 0 and the most similar has a value
  // of 1. Note: though this is derived from the cosine similarity, the returned values are scaled
  // to span the interval [0, 1].
  const getParagraphSimilarities = useCallback(
    (sentenceIndex: number): number[] | undefined => {
      if (!summariserData || sentenceIndex >= summariserData.summary.length)
        return;
      const embedding = summariserData.summary[sentenceIndex].embedding;
      const similarities = computeSimilarities(
        embedding,
        summariserData.document.map((p) => p.embedding)
      );
      return redistributeArray(similarities);
    },
    [summariserData]
  );

  // Fetches the summariser data from the backend.
  const getSummariserData = async (
    document: string
  ): Promise<SummariserData> => {
    if (document.length === 0) throw new Error("No document to summarise.");
    const response: Response = await fetch("get-summarisation-data", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ document }),
    });
    const body = await response.json();
    if (!response.ok)
      throw new Error(`Non-OK response (${response.status}): ${body.detail}`);
    return body;
  };

  const onErrorCallback = useCallback(onError, [onError]);

  useEffect((): void => {
    (async () => {
      const data = await getSummariserData(document);
      setSummariserData(data);
    })().catch(onErrorCallback);
  }, [document, onErrorCallback]);

  return [
    summariserData?.document.map((paragraph) => paragraph.text),
    summariserData?.summary.map((sentence) => sentence.text),
    getParagraphSimilarities,
  ];
};
