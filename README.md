# gb-emu

This is a game boy emulator written for self-educational purposes.

## Next immediate steps

## TODO

- [X] Memory map
- [X] CPU and execution loop (not all instructions, just enough to ensure the main loop works)
- [X] Create some debugging UI
- [ ] Boot some test roms and make them run all the way without
      technical errors
- [ ] Cartridge reading
- [ ] Screen
  - [x] Debug LCD control
  - [x] Debug LCD registers
  - [x] Debug palette
  - [ ] Debug tilemap
  - [ ] Debug bg
  - [ ] Debug window
  - [ ] Debug OAM
  - [ ] Debug objects
  - [ ] Display bg
  - [ ] Display window
  - [ ] Display objects
- [ ] Input
- [ ] Sound
- [ ] Save / load
- [ ] Game boy color

## Resources

- [Mooneye-GB test roms](https://github.com/Gekkio/mooneye-gb)

## Suggested TODO by LLM

Here's a suggested order for implementing the different components of a Game Boy/Game Boy Color emulator to have a smooth and enjoyable development experience:

1. **CPU and Memory Management**: Start by implementing the Z80 CPU and the memory management unit (MMU) that handles the Game Boy's memory map. This includes the different memory banks, I/O registers, and interrupt handling.

2. **Rendering Pipeline**: Implement the rendering pipeline, including the display controller (PPU) and the graphics processing. This involves handling the different display modes, tile and sprite rendering, and handling the VRAM and OAM (Object Attribute Memory).

3. **Input Handling**: Implement the input handling, including reading the state of the D-Pad, buttons, and any other input devices.

4. **Timer and Interrupts**: Implement the timers and interrupts, which are crucial for the proper timing of the overall system.

5. **Audio Processing**: Implement the audio processing, including the different audio channels and the audio control registers.

6. **Cartridge and ROM Loading**: Implement the cartridge and ROM loading functionality, which includes handling the different cartridge types and memory bank controllers.

7. **Debugging and Utilities**: Implement debugging tools and utilities, such as a debugger, disassembler, and profiling tools, to help with the development and testing process.

8. **Peripheral Support**: Implement support for additional peripherals, such as the Game Link Cable, if your emulator needs to support them.

9. **Advanced Features**: Implement any advanced features, such as support for Game Boy Color-specific functionality, or additional hardware features like the Super Game Boy.

By following this order, you'll be able to build up the core functionality of the emulator step-by-step, ensuring a stable and manageable development process. This approach allows you to test and validate each component before moving on to the next, which can help prevent issues and make the overall development experience more enjoyable.
