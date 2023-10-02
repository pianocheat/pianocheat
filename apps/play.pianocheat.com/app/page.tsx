"use client";

import { Container } from "@mantine/core";
import { useEffect, useState } from "react";
import { Header, Logo, ScoreView } from "ui";
import { createFromMusicXmlDocument } from "score";

export default function Page() {
  const [score, setScore] = useState(null);

  useEffect(() => {
    async function fetchScore() {
      const response = await fetch("/resources/01 - Pitches.musicxml");
      const scoreContents = await response.text();
      const score = createFromMusicXmlDocument(scoreContents);
      setScore(score);

      console.log("Score:", score);
    }

    fetchScore();
  }, []);

  return (
    <>
      <Header />

      <Container size="md">
        <ScoreView score={score} />
      </Container>
    </>
  );
}
