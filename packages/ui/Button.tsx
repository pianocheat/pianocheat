"use client";

import { Button as MuiButton } from "@mui/joy";

export const Button = () => {
  return <MuiButton onClick={() => alert("boop")}>Boop</MuiButton>;
};
