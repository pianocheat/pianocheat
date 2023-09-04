import { ParsedNote } from "../parser/interfaces.js";
import { Player } from "./interfaces.js";

export default class EmptyNoteSetsProcessor {
  constructor(private input: Record<Player, Record<number, ParsedNote[]>>) {}

  public process(): Record<Player, Record<number, ParsedNote[]>> {
    for (const [player, playerNotes] of Object.entries(this.input)) {
      this.processPlayerNotes(player as Player, playerNotes);
    }

    return this.input;
  }

  private processPlayerNotes(
    player: Player,
    playerNotes: Record<number, ParsedNote[]>
  ) {
    const noteSetTimes = Object.keys(playerNotes)
      .map((x) => parseFloat(x))
      .sort((a, b) => a - b);

    for (
      let noteSetTimeIdx = noteSetTimes.length - 1;
      noteSetTimeIdx >= 0;
      noteSetTimeIdx--
    ) {
      const noteSetTime = noteSetTimes[noteSetTimeIdx];

      playerNotes[noteSetTime] = playerNotes[noteSetTime].filter(
        (x) => !x.rest
      );

      if (!playerNotes[noteSetTime].length) {
        delete playerNotes[noteSetTime];
      }
    }
  }
}
