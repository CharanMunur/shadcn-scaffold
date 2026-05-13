import React, { useState } from "react";
import { Text, Box, useApp } from "ink";
import { MultiSelect } from "@inkjs/ui";
import { create } from "./create.js";

type Props = {
  projectName: string;
};

export function  App({ projectName }: Props) {
  const { exit } = useApp();
  const [isDone, setIsDone] = useState(false);

  const options = [
    { label: "Zustand (State Management)", value: "zustand" },
    { label: "React Router DOM (Routing)", value: "react-router-dom" },
    { label: "TanStack Query (Data Fetching/Caching)", value: "@tanstack/react-query" },
    { label: "Axios (HTTP Client)", value: "axios" },
    { label: "Framer Motion (Animations)", value: "framer-motion" },
    { label: "React Hook Form (Forms)", value: "react-hook-form" },
    { label: "Zod (Schema Validation)", value: "zod" },
  ];

  const handleSubmit = async (selectedValues: string[]) => {
    setIsDone(true);
    exit();

    try {
      await create(projectName, selectedValues);
    } catch {
      process.exitCode = 1;
    }
  };

  if (isDone) {
    return null;
  }

  return (
    <Box flexDirection="column" gap={1} padding={1}>
      <Text color="orange">
        Select extra packages for {projectName} (Space to select, Enter to
        submit);
      </Text>
      <MultiSelect options={options} onSubmit={handleSubmit} />
    </Box>
  );
}
