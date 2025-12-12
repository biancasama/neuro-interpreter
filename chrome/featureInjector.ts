import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import RightDecoder from '../components/RightDecoder';
import { translations } from '../utils/translations';
import { LanguageManager } from '../services/languageManager';
import { Language } from '../types';

// --- Configuration ---
const SIDEBAR_ID = 'neuro-sense-sidebar-root';
const LANDING_PAGE_MARKER = 'extension-installed'; // The marker class the landing page looks for

declare var chrome: any;

// --- Main Initialization ---
export function initializeFeatureInjection(isPrivacyMode: boolean) {
  
  // 1. Landing Page Logic (Smart Button Swap)
  // Check if we are on the marketing site or localhost (dev)
  if (window.location.hostname.includes('neuro-sense.com') || window.location.hostname.includes('localhost')) {
    // Announce presence to the Landing Page by adding a class to body
    // This triggers the CSS in App.tsx to swap the "Install" button with "Open WhatsApp"
    document.body.classList.add(LANDING_PAGE_MARKER);
    return; // Stop here; we don't want to inject the chat sidebar on the landing page
  }

  // 2. Chat Injection Logic (WhatsApp, Instagram, Messenger)
  if (!isPrivacyMode) {
    observeChatApp();
  }
}

// --- SPA Observer & Injection Logic ---
function observeChatApp() {
  let debounceTimer: any;

  // MutationObserver is critical for SPAs like WhatsApp/Instagram where the DOM changes without page loads
  const observer = new MutationObserver(() => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      handleUrlChangeOrDomUpdate();
    }, 500); // Debounce to prevent performance issues during rapid DOM mutations
  });

  observer.observe(document.body, { childList: true, subtree: true });
  
  // Initial check on load
  handleUrlChangeOrDomUpdate();
}

function handleUrlChangeOrDomUpdate() {
  // A. Check if Sidebar already exists to prevent duplicate injection
  if (document.getElementById(SIDEBAR_ID)) return;

  // B. Detect Active Chat Context using Robust Selectors
  
  // WhatsApp: Looks for the main chat pane ID (#main)
  const isWhatsAppChatOpen = 
    window.location.hostname.includes('whatsapp') && 
    !!document.getElementById('main'); 

  // Instagram: Looks for the direct message URL pattern
  const isInstagramChatOpen = 
    window.location.hostname.includes('instagram') && 
    window.location.pathname.includes('/direct/t/'); 

  // Messenger: General check
  const isMessengerChatOpen = 
     window.location.hostname.includes('messenger');

  if (isWhatsAppChatOpen || isInstagramChatOpen || isMessengerChatOpen) {
    injectSidebarOverlay();
  }
}

// --- DOM Injection ---
function injectSidebarOverlay() {
  if (document.getElementById(SIDEBAR_ID)) return;

  const host = document.createElement('div');
  host.id = SIDEBAR_ID;
  
  // Create a container that doesn't block clicks on the main app until expanded
  Object.assign(host.style, {
    position: 'fixed',
    top: '0',
    right: '0',
    height: '100vh',
    width: '0px', 
    zIndex: '9999',
    pointerEvents: 'none'
  });

  document.body.appendChild(host);

  // Use Shadow DOM to isolate styles from the host page
  const shadow = host.attachShadow({ mode: 'open' });
  
  const style = document.createElement('style');
  style.textContent = `
    :host {
      font-family: 'Inter', sans-serif;
    }
    .sidebar-container {
      width: 320px;
      height: 100%;
      background: white;
      box-shadow: -5px 0 15px rgba(0,0,0,0.1);
      position: absolute;
      top: 0;
      right: -320px; 
      pointer-events: auto; /* Re-enable clicks inside the sidebar */
      display: flex;
      flex-direction: column;
      transform: translateX(0);
      transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }
    .sidebar-container.open {
      transform: translateX(-320px); 
    }
    .sidebar-toggle {
      position: absolute;
      left: -40px;
      top: 50%;
      width: 40px;
      height: 40px;
      background: #F0EAD6;
      border: 1px solid #e5e7eb;
      border-right: none;
      border-radius: 8px 0 0 8px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      pointer-events: auto;
      box-shadow: -2px 0 5px rgba(0,0,0,0.05);
      z-index: 10;
      transition: background 0.2s;
    }
    .sidebar-toggle:hover {
      background: #fff;
    }
  `;
  shadow.appendChild(style);

  const root = createRoot(host.shadowRoot!);
  root.render(React.createElement(SidebarWrapper));
}

// --- Sidebar React Component ---
const SidebarWrapper: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  
  // 1. Language State Management
  const [currentLang, setCurrentLang] = useState<Language>(() => LanguageManager.getSavedLanguage());

  // 2. Persist changes
  useEffect(() => {
    LanguageManager.saveLanguage(currentLang);
  }, [currentLang]);

  // 3. Dynamic Dictionary Selection
  const t = translations[currentLang];

  const handleAnalyze = async (text: string, useDeepContext: boolean, imageBase64?: string, imageMimeType?: string) => {
    setIsAnalyzing(true);
    setResult(null);
    
    // We send the FULL target language name (e.g. "Spanish") to the background script
    const targetLanguageName = LanguageManager.getGeminiTargetLanguage(currentLang);

    chrome.runtime.sendMessage({ 
      action: "ANALYZE_TEXT", 
      text: text,
      audioBase64: undefined, // Audio not supported in sidebar yet
      audioMimeType: undefined,
      targetLanguage: targetLanguageName // Pass this new param to background
    }, (response: any) => {
      setIsAnalyzing(false);
      if (response && response.success) {
        setResult(response.data);
      } else {
        console.error("Analysis failed", response?.error);
      }
    });
  };

  return React.createElement('div', { className: `sidebar-container ${isOpen ? 'open' : ''}` },
    React.createElement('button', {
      className: 'sidebar-toggle',
      onClick: () => setIsOpen(!isOpen),
      title: 'Toggle Neuro-Sense'
    }, '🧠'),
    
    React.createElement('div', { style: { height: '100%', overflow: 'hidden', display: 'flex', flexDirection: 'column' } },
        React.createElement(RightDecoder, { 
          onAnalyze: handleAnalyze,
          isAnalyzing: isAnalyzing,
          result: result,
          onSaveMemory: () => {},
          t: t, 
          currentLanguage: currentLang,
          onLanguageChange: setCurrentLang
        })
    )
  );
};