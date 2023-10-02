import { create } from "zustand";
import type { Draft } from "immer";
import { immer } from "zustand/middleware/immer";

export interface NotePress {
  pitch: number;
  velocity: number;
}

export interface NoteRelease {
  pitch: number;
}

export interface ActiveScore {
  musicXmlPath: string;
  name: string;
  performance: Performance;
}

export enum ActiveMode {
  Perform = "mode-perform",
  Preview = "mode-preview",
  Annotate = "mode-annotate",
}

export interface PreviewMode {
  time: number;
  active: boolean;
}

export interface PerformanceHistoryEntry {
  played: boolean;
}

export interface ActivePerformance {
  score: ActiveScore;
  mode: ActiveMode;
  preview: PreviewMode;
  cursors: Record<string, number>;
  pageNumber: number;
  // history: Record<Player, Record<number, PerformanceHistoryEntry>>;
}

export type ColorsConfig = {
  [x in string]: {
    boxShadow: string;
    background: string;
  };
};

export interface AppConfig {
  colors: ColorsConfig;
  defaultScore: string;
}

export type AppState = {
  performance?: ActivePerformance;
  appConfig: AppConfig;
};

export type AppStateActions = {
  update: (fn: (state: Draft<AppState & AppStateActions>) => void) => void;
};

export const useAppStateStore = create(
  immer<AppState & AppStateActions>((set) => ({
    appConfig: {
      defaultScore: "",
      colors: {
        "player-right-hand": {
          background:
            "linear-gradient(hsla(39, 74%, 72%, 1) 20%, rgb(229, 176, 79) 65%, hsla(39, 74%, 72%, 1) 100%)",
          boxShadow:
            "rgba(60, 64, 67, 0.3) 0px 1px 2px 0px, rgba(60, 64, 67, 0.15) 0px 1px 3px 1px",
        },
        "player-left-hand": {
          background:
            "linear-gradient(hsla(192, 47%, 65%, 1) 20%, #59aec3 65%, hsla(192, 47%, 65%, 1) 100%)",
          boxShadow:
            "rgba(60, 64, 67, 0.3) 0px 1px 2px 0px, rgba(60, 64, 67, 0.15) 0px 1px 3px 1px",
        },
        "player-computer": {
          background:
            "linear-gradient(hsla(25, 47%, 65%, 1) 20%, #59aec3 65%, hsla(192, 47%, 65%, 1) 100%)",
          boxShadow:
            "rgba(60, 64, 67, 0.3) 0px 1px 2px 0px, rgba(60, 64, 67, 0.15) 0px 1px 3px 1px",
        },
        "player-muted": {
          background:
            "linear-gradient(hsla(70, 47%, 65%, 1) 20%, #59aec3 65%, hsla(192, 47%, 65%, 1) 100%)",
          boxShadow:
            "rgba(60, 64, 67, 0.3) 0px 1px 2px 0px, rgba(60, 64, 67, 0.15) 0px 1px 3px 1px",
        },
      },
    },
    update: (fn: (state: Draft<AppState & AppStateActions>) => void) =>
      set((state) => {
        fn(state);
      }),
  }))
);
