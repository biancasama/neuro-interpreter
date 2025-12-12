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
  
  // WhatsApp: Looks for the main