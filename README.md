# PianoCheat

If you have a piano keyboard and want to play songs without learning the notes, PianoCheat allows you to easily play songs by pressing any wrong keys.

PianoCheat uses the Web MIDI API to connect to your piano keyboard and uses sheet music data from MusicXML files to know how to correct wrong notes you play. As the piano player, you still control the dynamics, rhythm, and pedaling of a song.

## Development

This repository includes the following packages/apps:

### Layout

- `apps/www.pianocheat.com`: the home landing page for pianocheat.com
- `apps/play.pianocheat.com`: the piano playing page for pianocheat.com
- `packages/ui`: various shared UI components
- `packages/tsconfig`: TypeScript configuration files used throughout the repository

### Develop

To run the website for pianocheat.com and play.pianocheat.com, run the following command:

```
pnpm dev
```

This will automatically build any related packages each app depends on.

### Build

To build a production release for the website for pianocheat.com and play.pianocheat.com, run the following command:

```
pnpm build
```
