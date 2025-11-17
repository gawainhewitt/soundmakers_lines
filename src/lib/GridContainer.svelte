<script>
  import { onMount, onDestroy } from 'svelte';
  import String from './String.svelte';
  import { ArpeggioGenerator } from './ArpeggioGenerator';
  
  let { audioEngine, settings } = $props();


  let strings = Array.from({ length: 30 }, function(_, i) { return i; });
  let cleanupInterval;
  let arpeggioGenerator = new ArpeggioGenerator;

  // Track which strings are currently animating (for keyboard)
  let animatingStrings = $state(new Set());
  
  // Define the three rows with their colors and chord configs
  let rows = $derived(settings ? [
    { 
      id: 0, 
      color: 'rgb(240, 228, 66)', 
      ...settings.topRow,
      visible: settings.topRow.visible 
    },
    { 
      id: 1, 
      color: 'rgb(204, 121, 167)', 
      ...settings.middleRow,
      visible: settings.middleRow.visible 
    },
    { 
      id: 2, 
      color: 'rgb(0, 158, 115)', 
      ...settings.bottomRow,
      visible: true // Bottom row always visible
    }
  ].filter(row => row.visible) : []); // Filter out hidden rows  
  
  const stringsPerRow = 10;
  
  // Generate scales for all three rows
  let scales = $derived(
    rows.map(row => {
      return arpeggioGenerator.generateArpeggio(
        row.root, 
        row.chordType, 
        row.octave, 
        stringsPerRow
      );
    })
  );

  // Log when scales change
  $effect(() => {
    console.log('Generated arpeggios:', scales);
  });
  
  // Map keyboard keys to string indices (30 total)
  let keyMap = $derived.by(() => {
    // Dynamically assign keys based on visible rows
    const map = {};
    const keyRows = [
      ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
      ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', ';'],
      ['z', 'x', 'c', 'v', 'b', 'n', 'm', ',', '.', '/']
    ];
    
    rows.forEach((row, rowIndex) => {
      const keys = keyRows[rowIndex] || [];
      keys.forEach((key, stringIndex) => {
        const globalIndex = rowIndex * stringsPerRow + stringIndex;
        map[key] = globalIndex;
      });
    });
    
    return map;
  });
  
  // Track which keys are currently held down
  let heldKeys = $state(new Set());

  // Track global drag state for strumming
  let isDragging = $state(false);
  
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
    if (heldKeys.has(key)) return;
    heldKeys.add(key);
    
    var stringIndex = keyMap[key];
    var rowIndex = Math.floor(stringIndex / stringsPerRow);
    var stringInRow = stringIndex % stringsPerRow;
    var stringId = rowIndex + '-' + stringInRow;
    var note = scales[rowIndex][stringInRow]; // This now works with filtered rows
    
    if (audioEngine && note) {
      audioEngine.playNote(note, stringId);
      console.log('Key pressed:', key, '→', note);
      
      animatingStrings.add(stringId);
      animatingStrings = new Set(animatingStrings); // Create new Set to trigger reactivity

      setTimeout(() => {
        animatingStrings.delete(stringId);
        animatingStrings = new Set(animatingStrings); // Create new Set to trigger reactivity
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
        <div class="chord-label">
          {row.root}{row.chordType === 'major' ? '' : row.chordType === 'minor' ? 'm' : row.chordType === 'dom7' ? '7' : row.chordType === 'maj7' ? '△' : 'm7'}
        </div>
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
    position: relative;
  }

  .chord-label {
    position: absolute;
    left: 1vw;
    font-weight: 700;
    font-size: 1.8rem;
    color: rgba(0, 0, 0, 0.35);
    pointer-events: none;
    user-select: none;
    line-height: 1;
  }

  @media (max-width: 480px) {
    .chord-label {
      font-size: 1.4rem;
      left: 0.5vw;
    }
  }

  @media (orientation: landscape) and (max-height: 500px) {
    .chord-label {
      font-size: 1.2rem;
    }
  }

  /* Portrait mode - rotated text for all portrait orientations */
  @media (orientation: portrait) {
    .chord-label {
      transform: rotate(-90deg);
      transform-origin: left center;
      font-size: 1.8rem;
      left: 4vw;
      top: 14vh;
      white-space: nowrap;
    }
  }

  /* Smaller font for mobile portrait */
  @media (max-width: 480px) and (orientation: portrait) {
    .chord-label {
      font-size: 1.2rem;
    }
  }
</style>