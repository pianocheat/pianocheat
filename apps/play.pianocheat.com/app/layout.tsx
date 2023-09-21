"use client";

import "@mantine/notifications/styles.css";
import "@mantine/dropzone/styles.css";
import "@mantine/spotlight/styles.css";
import "@mantine/core/styles.css";
import "./fonts.css";

import { MantineProvider, ColorSchemeScript } from "@mantine/core";
import { ModalsProvider } from "@mantine/modals";
import { Notifications } from "@mantine/notifications";
import { theme } from "../theme";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <ColorSchemeScript />
      </head>
      <body>
        <MantineProvider theme={theme}>
          <Notifications />
          <ModalsProvider>{children}</ModalsProvider>
        </MantineProvider>
      </body>
    </html>
  );
}
