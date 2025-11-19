<script>
  import { createEventDispatcher, onMount, onDestroy } from 'svelte';
  
  let { 
    title = '', 
    instructions = '', 
    footerNote = '',
    showModeButtons = false 
  } = $props();
  
  const dispatch = createEventDispatcher();
  
  function handleClick() {
    if (!showModeButtons) {
      dispatch('click');
    }
  }
  
  function handleKeydown(e) {
    if (!showModeButtons) {
      dispatch('click');
    }
  }
  
  function handleFullMode() {
    dispatch('selectMode', { mode: 'full' });
  }
  
  function handleKeyboardMode() {
    dispatch('selectMode', { mode: 'keyboard' });
  }
  
  onMount(() => {
    window.addEventListener('keydown', handleKeydown);
  });
  
  onDestroy(() => {
    window.removeEventListener('keydown', handleKeydown);
  });
</script>

<div class="splash-screen" 
     onclick={handleClick} 
     onkeydown={handleClick}
     role={showModeButtons ? "main" : "button"}
     tabindex={showModeButtons ? -1 : 0}>
  
  <div class="top-logo">
      <img src="/images/orchlablogo.png" alt="Orch Lab Logo" class="top-logo-img"/>
  </div>
  
  <div class="content">
    <h1>{title}</h1>
    
    {#if showModeButtons}
      <p class="subtitle">Accessible Music Sequencer</p>
      
      <div class="mode-buttons">
        <button class="mode-button" onclick={handleFullMode}>
          <span class="mode-title">Mouse & Touch Sequencer</span>
          <span class="mode-description">7 harp rows + 3 drum rows</span>
        </button>
        
        <button class="mode-button" onclick={handleKeyboardMode}>
          <span class="mode-title">Keyboard Sequencer</span>
          <span class="mode-description">4 harp rows (QWERTY keys)</span>
        </button>
      </div>
    {/if}
    
    <p class="instructions">{instructions}</p>
    <p class="footer-note">{footerNote}</p>
  </div>
  
  <div class="bottom-logos">
    <img src="/images/LPO_logo.png" alt="LPO Logo" class="bottom-logo" />
    <img src="/images/DMLogo.png" alt="DM Logo" class="bottom-logo" />
  </div>
</div>

<style>
  .splash-screen {
    width: 100%;
    height: 100%;
    background-color: white;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-between;
    cursor: pointer;
    padding: 2vh 3vw;
    box-sizing: border-box;
  }
  
  .top-logo {
    flex: 0 0 auto;
    display: flex;
    justify-content: center;
    align-items: flex-start;
    width: 100%;
  }

  .top-logo-img {
    display: block;
    max-width: 300px !important;  /* But don't exceed container */
    height: auto !important;
    margin: 0 auto;
  }
  
  .content {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    text-align: center;
    width: 100%;
    max-width: 600px;
    padding: 2vh 0;
  }
  
  h1 {
    font-size: 4rem;
    margin: 0 0 1rem 0;
    color: #333;
  }
  
  .subtitle {
    font-size: 1.5rem;
    color: #666;
    margin: 0 0 1.5rem 0;
  }
  
  .mode-buttons {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    width: 100%;
    max-width: 400px;
    margin-bottom: 1.5rem;
  }
  
  .mode-button {
    background-color: #06C0F0;
    color: white;
    border: none;
    padding: 1.2rem 1.5rem;
    border-radius: 15px;
    cursor: pointer;
    transition: all 0.2s ease;
    box-shadow: 0 4px 12px rgba(6, 192, 240, 0.3);
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    width: 100%;
    text-align: center;
    -webkit-appearance: none;
    font-family: inherit;
    line-height: 1.3;
    min-height: 85px;
    box-sizing: border-box;
  }
  
  .mode-button:hover {
    background-color: #05A8D6;
    box-shadow: 0 6px 16px rgba(6, 192, 240, 0.4);
  }
  
  .mode-button:active {
    box-shadow: 0 2px 8px rgba(6, 192, 240, 0.3);
  }
  
  .mode-title,
  .mode-description {
    display: block;
    margin: 0;
    padding: 0;
    width: 100%;
  }
  
  .mode-title {
    font-size: 1.2rem;
    font-weight: 600;
    margin-bottom: 0.3rem;
  }
  
  .mode-description {
    font-size: 0.95rem;
    opacity: 0.9;
  }
  
  .instructions {
    font-size: 2rem;
    margin: 0 0 1rem 0;
    color: #555;
    line-height: 1.5;
  }
  
  .footer-note {
    font-size: 1.2rem;
    color: #777;
    font-style: italic;
    margin: 0;
  }
  
  .bottom-logos {
    flex: 0 0 auto;
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    gap: 1rem;
  }
  
  .bottom-logo {
    max-width: 150px;
    height: auto;
    flex: 0 0 auto;
  }
  
  /* Tablet and mobile adjustments */
  @media (max-width: 768px) {

    .top-logo-img {
      max-width: 300px !important;
    }

    h1 {
      font-size: 3rem;
    }
    
    .subtitle {
      font-size: 1.2rem;
    }
    
    .mode-button {
      min-height: 80px;
      padding: 1rem 1.2rem;
    }
    
    .mode-title {
      font-size: 1.1rem;
    }
    
    .mode-description {
      font-size: 0.9rem;
    }
    
    .instructions {
      font-size: 1.5rem;
    }
    
    .footer-note {
      font-size: 1rem;
    }
    
    .bottom-logo {
      max-width: 100px;
    }
  }
  
  @media (max-width: 480px) {
    
    .top-logo-img {
      max-width: 300px !important;
    }

    h1 {
      font-size: 2.5rem;
    }
    
    .subtitle {
      font-size: 1rem;
      margin-bottom: 1rem;
    }
    
    .mode-buttons {
      gap: 0.8rem;
      margin-bottom: 1rem;
    }
    
    .mode-button {
      min-height: 70px;
      padding: 0.8rem 1rem;
    }
    
    .mode-title {
      font-size: 1rem;
    }
    
    .mode-description {
      font-size: 0.8rem;
    }
    
    .instructions {
      font-size: 1.2rem;
    }
    
    .footer-note {
      font-size: 0.9rem;
    }
    
    .bottom-logo {
      max-width: 70px;
    }
  }
  
  @media (orientation: landscape) and (max-height: 900px) {
  .splash-screen {
    padding: 1vh 2vw;
  }
  
  .top-logo {
    flex: 0 0 auto;
  }
  
  .top-logo-img {
    max-width: 300px !important;
  }
  
  .content {
    padding: 0.5vh 0;
    flex: 1;
    min-height: 0; /* CRITICAL for iOS 12 - allows flex shrinking */
  }
  
  h1 {
    font-size: 2rem;
    margin-bottom: 0.3rem;
  }
  
  .subtitle {
    font-size: 1.2rem;
    margin-bottom: 0.5rem;
  }
  
  .mode-buttons {
    flex-direction: row;
    gap: 0.8rem;
    margin-bottom: 0.5rem;
  }
  
  .mode-button {
    min-height: 60px;
    padding: 0.5rem 0.8rem;
  }
  
  .mode-title {
    font-size: 0.85rem;
  }
  
  .mode-description {
    font-size: 0.7rem;
  }
  
  .instructions {
    font-size: 1rem;
    margin-bottom: 0.3rem;
    line-height: 1.3;
  }
  
  .footer-note {
    font-size: 0.8rem;
  }
  
  .bottom-logos {
    flex: 0 0 auto;
  }
  
  .bottom-logo {
    max-width: 100px;
  }

  .mode-buttons {
    flex-direction: row;
    gap: 1rem;
    margin-bottom: 0.5rem;
  }
  
  .mode-button {
    min-height: 60px;
    padding: 0.5rem 0.8rem;
    margin: 0 0.5rem; /* Add horizontal margin for iOS 12 */
  }
  
  .mode-button:first-child {
    margin-left: 0;
  }
  
  .mode-button:last-child {
    margin-right: 0;
  }
}

/* iPhone landscape - two column layout */
@media (max-width: 932px) and (orientation: landscape) and (max-height: 450px) {
  .splash-screen {
    padding: 1vh 3vw;
  }
  
  .top-logo-img {
    max-width: 100px !important;
  }
  
  .content {
    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-template-rows: auto auto auto auto;
    gap: 0.5rem 1rem;
    align-items: start;
    padding: 0.5vh 0;
  }
  
  h1 {
    grid-column: 1 / -1;
    font-size: 1.2rem;
    margin-bottom: 0;
    text-align: center;
  }
  
  .subtitle {
    grid-column: 1 / -1;
    font-size: 0.8rem;
    margin-bottom: 0;
    text-align: center;
  }
  
  .mode-buttons {
    grid-column: 1;
    grid-row: 3 / 5;
    flex-direction: column;
    gap: 0.5rem;
    margin-bottom: 0;
  }
  
  .mode-button {
    min-height: 50px;
    padding: 0.4rem 0.6rem;
  }
  
  .instructions {
    grid-column: 2;
    grid-row: 3;
    font-size: 0.7rem;
    margin: 0;
    text-align: left;
  }
  
  .footer-note {
    grid-column: 2;
    grid-row: 4;
    font-size: 0.6rem;
    text-align: left;
    align-self: end;
  }
  
  .bottom-logo {
    max-width: 80px;
  }
}
</style>