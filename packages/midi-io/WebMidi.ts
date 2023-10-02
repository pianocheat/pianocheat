import { WebMidi } from "webmidi";

async function enableWebMidiApi() {
  if (WebMidi.enabled) {
    return;
  }

  return WebMidi.enable();
}

async function getMidiInputs() {
  await enableWebMidiApi();
  return WebMidi.inputs;
}

async function getMidiOutputs() {
  await enableWebMidiApi();
  return WebMidi.outputs;
}

// export default class Midi {  }

//   connectInput() {
//     console.log("MIDI Inputs:", WebMidi.inputs.map((x) => x.name).sort());
//     const pedalInput = WebMidi.inputs.find((x) =>
//       x.name.toLowerCase().includes("usb midi")
//     );
//     const digitalPianoInput = WebMidi.inputs.find(
//       (x) =>
//         x.name.toLowerCase().includes("roland") ||
//         x.name.toLowerCase().includes("mpk mini") ||
//         x.name.toLowerCase().includes("usb-midi")
//     );
//     const input = digitalPianoInput;

//     if (!input) {
//       console.log("No MIDI input found.");
//       return;
//     }

//     if (pedalInput) {
//       console.log("pedal input found:", pedalInput);
//       pedalInput.removeListener("controlchange");
//       pedalInput.addListener("controlchange", "all", (e) => {
//         console.log(e);
//         this.processor.processControlChange(e);
//       });
//     } else {
//       input.removeListener("controlchange");
//       input.addListener("controlchange", "all", (e) => {
//         this.processor.processControlChange(e);
//       });
//     }

//     input.removeListener("noteon");
//     input.addListener("noteon", "all", (e) => {
//       this.processor.processNoteOnOrOff(e);
//     });

//     input.removeListener("noteoff");
//     input.addListener("noteoff", "all", (e) => {
//       this.processor.processNoteOnOrOff(e);
//     });
//   }

//   setProcessor(processor: SingleVoicePlayback) {
//     this.processor = processor;

//     if (!WebMidi.enabled) {
//       return;
//     }

//     WebMidi.removeListener("disconnected");
//     WebMidi.addListener("disconnected", (e) => {
//       console.log("Disconnected:", e);
//     });

//     WebMidi.removeListener("connected");
//     WebMidi.addListener("connected", (e) => {
//       console.log("Connected:", e);
//     });

//     this.connectInput();
//   }
// }
