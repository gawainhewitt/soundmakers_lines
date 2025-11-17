<script>
  import { onMount, onDestroy } from 'svelte';
  import String from './String.svelte';
  import { ScaleGenerator } from './ScaleGenerator.js';
  
  export let audioEngine;
  
  let strings = Array.from({ length: 30 }, function(_, i) { return i; });
  let cleanupInterval;
  let scaleGenerator = new ScaleGenerator();

  // Track which strings are currently animating (for keyboard)
  let animatingStrings = new Set();
  
  // Define the three rows with their colors and scale configs
  const rows = [
    { id: 0, color: 'rgb(240, 228, 66)', key: 'G', scale: 'major', octave: 4 },   // yellow - G major
    { id: 1, color: 'rgb(204, 121, 167)', key: 'F', scale: 'major', octave: 4 },  // pink - F major
    { id: 2, color: 'rgb(0, 158, 115)', key: 'C', scale: 'major', octave: 4 }     // green - C major
  ];
  
  const stringsPerRow = 10;
  
  // Generate scales for all three rows
  let scales = [];
  $: {
    scales = rows.map(row => {
      // Generate scale spanning enough octaves to get 10 notes
      var scale = scaleGenerator.generateScale(row.key, row.scale, row.octave);
      // If we don't have enough notes, extend into next octave
      if (scale.length < stringsPerRow) {
        var nextOctaveScale = scaleGenerator.generateScale(row.key, row.scale, row.octave + 1);
        scale = scale.concat(nextOctaveScale.slice(2));
      }
      return scale.slice(0, stringsPerRow);
    });
    console.log('Generated scales:', scales);
  }
  
  // Map keyboard keys to string indices (30 total)
  var keyMap = {
    // Top row - G major
    'q': 0, 'w': 1, 'e': 2, 'r': 3, 't': 4, 'y': 5, 'u': 6, 'i': 7, 'o': 8, 'p': 9,
    // Middle row - F major  
    'a': 10, 's': 11, 'd': 12, 'f': 13, 'g': 14, 'h': 15, 'j': 16, 'k': 17, 'l': 18, ';': 19,
    // Bottom row - C major
    'z': 20, 'x': 21, 'c': 22, 'v': 23, 'b': 24, 'n': 25, 'm': 26, ',': 27, '.': 28, '/': 29
  };
  
  // Track which keys are currently held down
  let heldKeys = new Set();

  // Track global drag state for strumming
  let isDragging = false;
  
  onMount(() => {
    window.addEventListener('keydown', handleKeydown);
    window.addEventListener('keyup', handleKeyup);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleWindowBlur);
  });
  
  onDestroy(() => {
    window.removeEventListener('keydown', handleKeydown);
    window.removeEventListener('keyup', handleKeyup);
    document.removeEventListener('visibilitychange', handleVisibilityChange);
    window.removeEventListener('blur', handleWindowBlur);
    
    if (audioEngine) {
      audioEngine.panic();
    }
  });
  
  function handleVisibilityChange() {
    if (document.hidden && audioEngine) {
      console.log('Page hidden - stopping all notes');
      audioEngine.panic();
      heldKeys.clear();
    }
  }

  function handleWindowBlur() {
    if (audioEngine) {
      console.log('Window blur - stopping all notes');
      audioEngine.panic();
      heldKeys.clear();
    }
  }
  
function handleKeydown(e) {
  if (e.key === 'Escape') {
    if (audioEngine) {
      audioEngine.panic();
      heldKeys.clear();
    }
    return;
  }
  
  var key = e.key.toLowerCase();
    if (keyMap.hasOwnProperty(key)) {
      // Prevent key repeat - only trigger on first press
      if (heldKeys.has(key)) return;
      heldKeys.add(key);
      
      var stringIndex = keyMap[key];
      var rowIndex = Math.floor(stringIndex / stringsPerRow);
      var stringInRow = stringIndex % stringsPerRow;
      var stringId = rowIndex + '-' + stringInRow; // ADD THIS
      var note = scales[rowIndex][stringInRow];
      
      if (audioEngine && note) {
        audioEngine.playNote(note, stringId);
        console.log('Key pressed:', key, '→', note);
        
        // ADD THESE LINES - trigger animation:
        animatingStrings.add(stringId);
        animatingStrings = animatingStrings; // Trigger reactivity
        
        // Remove from animating set after animation duration
        setTimeout(() => {
          animatingStrings.delete(stringId);
          animatingStrings = animatingStrings; // Trigger reactivity
        }, 300);
      }
    }
  }

  function handleKeyup(e) {
    var key = e.key.toLowerCase();
    if (keyMap.hasOwnProperty(key)) {
      heldKeys.delete(key);
    }
  }
  
  function handleGlobalMouseDown() {
    isDragging = true;
  }

  function handleGlobalMouseUp() {
    isDragging = false;
  }
</script>

<svelte:window 
  on:mousedown={handleGlobalMouseDown}
  on:mouseup={handleGlobalMouseUp}
/>

<div class="grid-container">
  {#each rows as row, rowIndex}
    <div class="row" style="background-color: {row.color};">
      {#each Array(stringsPerRow) as _, stringIndex}
        {@const globalIndex = rowIndex * stringsPerRow + stringIndex}
        {@const stringId = rowIndex + '-' + stringIndex}
        {@const note = scales[rowIndex][stringIndex]}
        <String
          index={globalIndex}
          {stringId}
          {note}
          {audioEngine}
          {isDragging}
          isAnimating={animatingStrings.has(stringId)}
        />
      {/each}
    </div>
  {/each}
</div>

<style>
  .grid-container {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    gap: 0;
  }

  .row {
    flex: 1;
    display: flex;
    flex-direction: row;
    justify-content: space-evenly;
    align-items: center;
    padding: 0 2vw;
  }
</style>