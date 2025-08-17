import React, { useEffect, useMemo, useState } from "react";

// Generate unique ID without external library
const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
};

// Simple encryption/decryption
const simpleEncrypt = (text, password) => {
  let result = '';
  for (let i = 0; i < text.length; i++) {
    result += String.fromCharCode(text.charCodeAt(i) ^ password.charCodeAt(i % password.length));
  }
  return btoa(result);
};

const simpleDecrypt = (encryptedText, password) => {
  try {
    const decoded = atob(encryptedText);
    let result = '';
    for (let i = 0; i < decoded.length; i++) {
      result += String.fromCharCode(decoded.charCodeAt(i) ^ password.charCodeAt(i % password.length));
    }
    return result;
  } catch {
    return null;
  }
};

// Obfuscation methods
const obfuscationMethods = {
  none: (text) => text,
  rot13: (text) => text.replace(/[a-zA-Z]/g, char => {
    const base = char <= 'Z' ? 65 : 97;
    return String.fromCharCode(((char.charCodeAt(0) - base + 13) % 26) + base);
  }),
  atbash: (text) => text.replace(/[a-zA-Z]/g, char => {
    const isUpper = char === char.toUpperCase();
    const base = isUpper ? 65 : 97;
    const reversed = base + (25 - (char.charCodeAt(0) - base));
    return String.fromCharCode(reversed);
  }),
  reverse: (text) => text.split('').reverse().join(''),
  leetspeak: (text) => {
    const leetMap = { 'a': '4', 'e': '3', 'i': '1', 'o': '0', 's': '5', 't': '7', 'b': '8', 'g': '9' };
    return text.replace(/[aeiostbg]/gi, match => leetMap[match.toLowerCase()] || match);
  },
  vigenere: (text, key = "martini") => {
    key = key.toLowerCase().replace(/[^a-z]/g, '');
    if (!key) return text;
    let keyIndex = 0;
    return text.replace(/[a-zA-Z]/g, char => {
      const base = char <= 'Z' ? 65 : 97;
      const shift = key.charCodeAt(keyIndex % key.length) - 97;
      keyIndex++;
      return String.fromCharCode(((char.charCodeAt(0) - base + shift) % 26) + base);
    });
  },
  emoji: (text) => {
    const emojiAlphabet = "😀😁😂🤣😃😄😅😆😉😊😋😍😘😗😙😚🙂🤗🤩🤔🤨😐😑😶🙄".split("");
    return text.replace(/[a-z]/gi, char => {
      const idx = char.toLowerCase().charCodeAt(0) - 97;
      return emojiAlphabet[idx] || char;
    });
  }
};

// Literary quotes
const literaryQuotes = [
  { text: "Should I kill myself, or have a cup of coffee?", author: "Albert Camus" },
  { text: "A book must be the axe for the frozen sea within us.", author: "Franz Kafka" },
  { text: "I am free and that is why I am lost.", author: "Franz Kafka" },
  { text: "In the depth of winter, I finally learned that within me lay an invincible summer.", author: "Albert Camus" },
  { text: "I desire the things which will destroy me in the end.", author: "Sylvia Plath" },
  { text: "I shut my eyes and all the world drops dead; I lift my lids and all is born again.", author: "Sylvia Plath" },
  { text: "The mystery of human existence lies not in just staying alive, but in finding something to live for.", author: "Fyodor Dostoevsky" },
  { text: "Man only likes to count his troubles; he doesn’t calculate his happiness.", author: "Fyodor Dostoevsky" },
  { text: "I am rooted, but I flow.", author: "Virginia Woolf" },
  { text: "He who has a why to live can bear almost any how.", author: "Friedrich Nietzsche" },
  { text: "The only journey is the one within.", author: "Rainer Maria Rilke" }
];

// Storage helpers
const STORAGE_KEY = "lus_journal_entries";
const SETTINGS_KEY = "lus_journal_settings";

const saveEntries = (entries) => {
  try {
    console.log('Saving entries to localStorage:', entries);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
    return true;
  } catch (e) {
    console.error('Failed to save entries to localStorage:', e);
    alert('Failed to save entries. Check if localStorage is enabled or not full.');
    return false;
  }
};

const loadEntries = () => {
  try {
    if (!window.localStorage) {
      console.error('localStorage is not available.');
      alert('localStorage is disabled in your browser. Notes cannot be saved.');
      return [];
    }
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      console.log('Loaded entries from localStorage:', parsed);
      return Array.isArray(parsed) ? parsed : [];
    }
    console.log('No entries found in localStorage, returning empty array');
    return [];
  } catch (e) {
    console.error('Failed to load entries from localStorage:', e);
    alert('Failed to load entries. Check console for details.');
    return [];
  }
};

const saveSettings = (settings) => {
  try {
    console.log('Saving settings to localStorage:', settings);
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (e) {
    console.error('Failed to save settings to localStorage:', e);
    alert('Failed to save settings. Check console for details.');
  }
};

const loadSettings = () => {
  try {
    if (!window.localStorage) {
      console.error('localStorage is not available.');
      return { theme: "martini", blurPreview: true };
    }
    const saved = localStorage.getItem(SETTINGS_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      console.log('Loaded settings from localStorage:', parsed);
      return parsed || { theme: "martini", blurPreview: true };
    }
    console.log('No settings found in localStorage, returning default');
    return { theme: "martini", blurPreview: true };
  } catch (e) {
    console.error('Failed to load settings from localStorage:', e);
    alert('Failed to load settings. Check console for details.');
    return { theme: "martini", blurPreview: true };
  }
};

// Icon components
const PenIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/>
  </svg>
);

const BookOpenIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
  </svg>
);

const LockIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
  </svg>
);

const UnlockIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z"/>
  </svg>
);

const EyeIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0zm6.5 0c0 3.038-4.462 5.5-9.5 5.5S2.5 15.038 2.5 12 6.962 6.5 12 6.5 21.5 8.962 21.5 12z"/>
  </svg>
);

const EyeOffIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/>
  </svg>
);

const SearchIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 1116.65 16.65z"/>
  </svg>
);

const SettingsIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100-4m0 4v2m0-6V4"/>
  </svg>
);

const TrashIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5-4h4M9 7v12m6-12v12M10 3h4"/>
  </svg>
);

const TagsIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h10l-5 5-5-5zm0 10h10l-5-5-5 5z"/>
  </svg>
);

const DownloadIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
  </svg>
);

const UploadIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/>
  </svg>
);

const ShieldCheckIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 3c-2.616 0-5.13.815-7.147 2.32A11.956 11.956 0 003 12c0 5.256 3.364 9.726 8.079 11.326.4.138.804.26 1.216.367.412-.107.816-.229 1.216-.367C18.636 21.726 22 17.256 22 12a11.956 11.956 0 00-1.382-6.016z"/>
  </svg>
);

const RefreshCwIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h5m-5 0a9 9 0 1111.314 2.708M20 20v-5h-5m5 0a9 9 0 01-11.314-2.708"/>
  </svg>
);

function LUs() {
  const [entries, setEntries] = useState(loadEntries());
  const [settings, setSettings] = useState(loadSettings());
  const [searchQuery, setSearchQuery] = useState("");
  const [unlockedId, setUnlockedId] = useState(null);
  const [unlockPass, setUnlockPass] = useState("");
  const [obfsMode, setObfsMode] = useState("none");
  const [vigenereKey, setVigenereKey] = useState("");
  const [showContent, setShowContent] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState("");
  const [passphrase, setPassphrase] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(null);
  const [currentQuote, setCurrentQuote] = useState(0);
  const [typewriterText, setTypewriterText] = useState("");
  const [saveMessage, setSaveMessage] = useState("");

  // Load entries on mount
  useEffect(() => {
    const loadedEntries = loadEntries();
    console.log('Initial entries set:', loadedEntries);
    setEntries(loadedEntries);
  }, []);

  // Save entries when they change
  useEffect(() => {
    if (entries.length > 0) {
      const saved = saveEntries(entries);
      if (saved) {
        setSaveMessage("Verse saved successfully!");
        setTimeout(() => setSaveMessage(""), 3000);
      }
    }
  }, [entries]);

  // Save settings when they change
  useEffect(() => {
    saveSettings(settings);
  }, [settings]);

  // Debug localStorage state
  useEffect(() => {
    console.log('Current localStorage state:', localStorage.getItem(STORAGE_KEY));
  }, [entries]);

  // Typewriter effect
  useEffect(() => {
    const texts = ["LU's Lounge", "Welcome back, Lu — the silence has been restless.", "LU's Lounge"];
    let textIndex = 0;
    let charIndex = 0;
    let isDeleting = false;

    const typewriter = () => {
      const currentText = texts[textIndex];

      if (isDeleting) {
        setTypewriterText(currentText.substring(0, charIndex - 1));
        charIndex--;

        if (charIndex === 0) {
          isDeleting = false;
          textIndex = (textIndex + 1) % texts.length;
        }
      } else {
        setTypewriterText(currentText.substring(0, charIndex + 1));
        charIndex++;

        if (charIndex === currentText.length) {
          setTimeout(() => {
            isDeleting = true;
          }, 2500);
        }
      }
    };

    const interval = setInterval(typewriter, isDeleting ? 60 : 120);
    return () => clearInterval(interval);
  }, []);

  // Quote rotation
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentQuote((prev) => (prev + 1) % literaryQuotes.length);
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const filteredEntries = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return entries;
    return entries.filter(e =>
      e.title.toLowerCase().includes(q) ||
      (e.tags || []).some(t => t.toLowerCase().includes(q))
    );
  }, [entries, searchQuery]);

  const themeClasses = settings.theme === "martini"
    ? "min-h-screen bg-gradient-to-br from-[#2A1B1A] via-[#3C2F2F] to-[#1C2526] text-[#F5E6CC] font-serif"
    : "min-h-screen bg-gradient-to-br from-[#F5E6CC] via-[#E6D5B8] to-[#3C2F2F] text-[#2A1B1A] font-serif";

  const handleAddEntry = () => {
    if (!title.trim() || !content.trim() || !passphrase.trim()) {
      alert('Please fill in title, content, and passphrase.');
      return;
    }

    const encrypted = simpleEncrypt(content, passphrase.trim());
    const entry = {
      id: generateId(),
      title: title.trim(),
      tags: tags.split(',').map(t => t.trim()).filter(Boolean),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      encrypted: encrypted,
      wordCount: content.trim().split(/\s+/).length
    };

    const newEntries = [entry, ...entries];
    setEntries(newEntries);
    saveEntries(newEntries); // Force immediate save
    setShowModal(false);
    setTitle("");
    setContent("");
    setTags("");
    setPassphrase("");
  };

  const handleDelete = (id) => {
    const newEntries = entries.filter(e => e.id !== id);
    setEntries(newEntries);
    saveEntries(newEntries); // Force immediate save
    if (unlockedId === id) {
      setUnlockedId(null);
      setUnlockPass("");
    }
  };

  const exportData = () => {
    const blob = new Blob([JSON.stringify(entries, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "lus-journal-export.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const importData = (evt) => {
    const file = evt.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result);
        if (Array.isArray(data)) {
          const newEntries = [...data, ...entries];
          setEntries(newEntries);
          saveEntries(newEntries); // Force immediate save
        } else {
          alert('Invalid file format: Must be an array.');
        }
      } catch (e) {
        alert('Failed to import file. Check console for details.');
        console.error('Import error:', e);
      }
    };
    reader.readAsText(file);
    evt.target.value = "";
  };

  const applyObfuscation = (text) => {
    if (obfsMode === "none") return text;
    if (obfsMode === "vigenere") return obfuscationMethods.vigenere(text, vigenereKey || "martini");
    return obfuscationMethods[obfsMode] ? obfuscationMethods[obfsMode](text) : text;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const chipColor = (theme) => {
    return theme === "martini" ? "bg-[#3C4F2F]/40 border-[#D4A017]/50" : "bg-[#2A1B1A]/30 border-[#4A1C2A]/50";
  };

  return (
    <div className={`${themeClasses} transition-all duration-400`}>
      <style>
        {`
          @keyframes jazzMartiniPulse {
            0%, 100% { opacity: 0.3; }
            50% { opacity: 0.6; }
          }
        `}
      </style>
      {/* Animated background particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(50)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-[#D4A017]/30 rounded-full animate-[jazzMartiniPulse_4s_ease-in-out_infinite]"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 6}s`,
              animationDuration: `${3 + Math.random() * 4}s`
            }}
          />
        ))}
      </div>

      <div className="relative z-10 container mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Save Notification */}
        {saveMessage && (
          <div className="fixed top-4 right-4 bg-[#3C4F2F]/80 backdrop-blur-sm text-[#F5E6CC] px-3 py-2 rounded-xl shadow-[0_4px_15px_rgba(0,0,0,0.3)] transition-all duration-400 text-sm sm:text-base">
            {saveMessage}
          </div>
        )}

        {/* Header */}
        <header className="text-center mb-8 sm:mb-12">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4 tracking-wide">
            <span className="bg-gradient-to-r from-[#D4A017] via-[#B8860B] to-[#6B4226] bg-clip-text text-transparent">
              {typewriterText}
            </span>
            <span className="animate-pulse">|</span>
          </h1>

          <div className="max-w-xl sm:max-w-2xl mx-auto mb-6 sm:mb-8">
            <blockquote className="text-base sm:text-lg md:text-xl italic opacity-80 transform transition-all duration-1000">
              "{literaryQuotes[currentQuote].text}"
            </blockquote>
            <cite className="block mt-2 text-xs sm:text-sm opacity-60">
              — {literaryQuotes[currentQuote].author}
            </cite>
          </div>
        </header>

        {/* Controls */}
        <div className="flex flex-col gap-4 mb-6 sm:mb-8">
          <div className="flex flex-wrap items-center gap-2 sm:gap-4">
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 px-4 py-2 sm:px-6 sm:py-3 bg-gradient-to-r from-[#4A1C2A] to-[#3C4F2F] rounded-xl text-[#F5E6CC] font-medium hover:from-[#3C2F2F] hover:to-[#2A3D1F] transition-all duration-400 transform hover:scale-105 shadow-[0_4px_15px_rgba(0,0,0,0.3)]"
            >
              <PenIcon />
              New Verse
            </button>

            <div className="relative">
              <button
                onClick={() => setDropdownOpen(dropdownOpen === "settings" ? null : "settings")}
                className="p-2 sm:p-3 bg-[#2A1B1A]/70 backdrop-blur-sm rounded-xl hover:bg-[#2A1B1A]/90 transition-all duration-400 shadow-[0_4px_15px_rgba(0,0,0,0.3)]"
              >
                <SettingsIcon />
              </button>

              {dropdownOpen === "settings" && (
                <div className="absolute top-full mt-2 left-0 bg-[#2A1B1A]/80 backdrop-blur-md border border-[#D4A017]/50 rounded-xl p-3 sm:p-4 min-w-[200px] sm:min-w-[240px] z-50 shadow-[0_4px_15px_rgba(0,0,0,0.3)]">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs sm:text-sm font-medium mb-2">Theme</label>
                      <div className="space-y-2">
                        <label className="flex items-center text-sm">
                          <input
                            type="radio"
                            name="theme"
                            value="martini"
                            checked={settings.theme === "martini"}
                            onChange={() => setSettings(s => ({ ...s, theme: "martini" }))}
                            className="mr-2"
                          />
                          Martini
                        </label>
                        <label className="flex items-center text-sm">
                          <input
                            type="radio"
                            name="theme"
                            value="espresso"
                            checked={settings.theme === "espresso"}
                            onChange={() => setSettings(s => ({ ...s, theme: "espresso" }))}
                            className="mr-2"
                          />
                          Espresso
                        </label>
                      </div>
                    </div>

                    <div>
                      <button
                        onClick={() => setSettings(s => ({ ...s, blurPreview: !s.blurPreview }))}
                        className="flex items-center w-full text-left hover:bg-[#3C4F2F]/40 rounded-lg p-2 transition-all duration-400 text-sm"
                      >
                        {settings.blurPreview ? <EyeOffIcon /> : <EyeIcon />}
                        <span className="ml-2">Blur content preview</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <div className="relative w-full sm:w-auto flex-1 sm:flex-none">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 opacity-50" />
              <input
                type="text"
                placeholder="Search verses..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full sm:w-64 pl-10 pr-4 py-2 bg-[#2A1B1A]/70 backdrop-blur-sm border border-[#D4A017]/50 rounded-xl text-[#F5E6CC] placeholder-[#F5E6CC]/50 focus:outline-none focus:border-[#D4A017] transition-all duration-400 text-sm sm:text-base"
              />
            </div>

            <div className="relative">
              <button
                onClick={() => setDropdownOpen(dropdownOpen === "obfuscate" ? null : "obfuscate")}
                className="flex items-center gap-2 px-3 py-2 bg-[#2A1B1A]/70 backdrop-blur-sm border border-[#D4A017]/50 rounded-xl hover:bg-[#2A1B1A]/90 transition-all duration-400 text-sm sm:text-base"
              >
                <LockIcon />
                Cipher
              </button>

              {dropdownOpen === "obfuscate" && (
                <div className="absolute top-full mt-2 right-0 bg-[#2A1B1A]/80 backdrop-blur-md border border-[#D4A017]/50 rounded-xl p-3 sm:p-4 min-w-[200px] sm:min-w-[240px] z-50 shadow-[0_4px_15px_rgba(0,0,0,0.3)]">
                  <div className="space-y-2">
                    {Object.entries({
                      none: "None (plain)",
                      rot13: "ROT13",
                      atbash: "Atbash",
                      reverse: "Reverse",
                      leetspeak: "Leetspeak",
                      emoji: "Emoji Mask",
                      vigenere: "Vigenère"
                    }).map(([key, name]) => (
                      <label key={key} className="flex items-center hover:bg-[#3C4F2F]/40 rounded-lg p-2 transition-all duration-400 text-sm">
                        <input
                          type="radio"
                          name="obfsMode"
                          value={key}
                          checked={obfsMode === key}
                          onChange={() => setObfsMode(key)}
                          className="mr-2"
                        />
                        {name}
                      </label>
                    ))}

                    {obfsMode === "vigenere" && (
                      <input
                        type="text"
                        placeholder="Cipher key..."
                        value={vigenereKey}
                        onChange={(e) => setVigenereKey(e.target.value)}
                        className="w-full mt-2 px-3 py-2 bg-[#2A1B1A]/70 border border-[#D4A017]/50 rounded-xl text-[#F5E6CC] placeholder-[#F5E6CC]/50 focus:outline-none focus:border-[#D4A017] transition-all duration-400 text-sm"
                      />
                    )}
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={() => setShowContent(!showContent)}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-all duration-400 text-sm sm:text-base ${
                showContent 
                  ? "bg-[#4A1C2A] text-[#F5E6CC]" 
                  : "bg-[#2A1B1A]/70 backdrop-blur-sm border border-[#D4A017]/50 hover:bg-[#2A1B1A]/90"
              }`}
            >
              {showContent ? <EyeIcon /> : <EyeOffIcon />}
              Content
            </button>

            <button
              onClick={exportData}
              className="flex items-center gap-2 px-3 py-2 bg-[#2A1B1A]/70 backdrop-blur-sm border border-[#D4A017]/50 rounded-xl hover:bg-[#2A1B1A]/90 transition-all duration-400 text-sm sm:text-base"
            >
              <DownloadIcon />
              Export
            </button>

            <label className="flex items-center gap-2 px-3 py-2 bg-[#2A1B1A]/70 backdrop-blur-sm border border-[#D4A017]/50 rounded-xl hover:bg-[#2A1B1A]/90 transition-all duration-400 cursor-pointer text-sm sm:text-base">
              <UploadIcon />
              Import
              <input
                type="file"
                accept=".json"
                onChange={importData}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {/* Entry Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-[#2A1B1A]/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-[#2A1B1A]/80 backdrop-blur-md rounded-2xl border border-[#D4A017]/50 p-4 sm:p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-[0_4px_15px_rgba(0,0,0,0.3)]">
              <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-center text-[#F5E6CC]">Pour Your Soul into LU's</h2>
              <p className="text-xs sm:text-sm opacity-80 mb-4 sm:mb-6 text-center text-[#F5E6CC]/80">Encrypted on save. Only your passphrase unlocks the melody.</p>

              <div className="space-y-3 sm:space-y-4">
                <input
                  type="text"
                  placeholder="Verse Title..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full p-3 sm:p-4 bg-[#2A1B1A]/70 border border-[#D4A017]/50 rounded-xl text-[#F5E6CC] placeholder-[#F5E6CC]/50 focus:outline-none focus:border-[#D4A017] transition-all duration-400 text-sm sm:text-base"
                />

                <textarea
                  placeholder="Whispers of thoughts, waiting to be penned."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={8}
                  className="w-full p-3 sm:p-4 bg-[#2A1B1A]/70 border border-[#D4A017]/50 rounded-xl text-[#F5E6CC] placeholder-[#F5E6CC]/50 focus:outline-none focus:border-[#D4A017] transition-all duration-400 resize-none text-sm sm:text-base"
                />

                <div className="flex items-center gap-2">
                  <TagsIcon />
                  <input
                    type="text"
                    placeholder="tags, like poetry in a bottle..."
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    className="flex-1 p-3 sm:p-4 bg-[#2A1B1A]/70 border border-[#D4A017]/50 rounded-xl text-[#F5E6CC] placeholder-[#F5E6CC]/50 focus:outline-none focus:border-[#D4A017] transition-all duration-400 text-sm sm:text-base"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <LockIcon />
                  <input
                    type="password"
                    placeholder="passphrase (your secret chord)"
                    value={passphrase}
                    onChange={(e) => setPassphrase(e.target.value)}
                    className="flex-1 p-3 sm:p-4 bg-[#2A1B1A]/70 border border-[#D4A017]/50 rounded-xl text-[#F5E6CC] placeholder-[#F5E6CC]/50 focus:outline-none focus:border-[#D4A017] transition-all duration-400 text-sm sm:text-base"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-3 sm:pt-4">
                  <button
                    onClick={() => setShowModal(false)}
                    className="px-4 sm:px-6 py-2 sm:py-3 bg-[#2A1B1A]/70 rounded-xl hover:bg-[#2A1B1A]/90 text-[#F5E6CC] transition-all duration-400 text-sm sm:text-base"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddEntry}
                    className="flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-[#4A1C2A] to-[#3C4F2F] rounded-xl hover:from-[#3C2F2F] hover:to-[#2A3D1F] text-[#F5E6CC] transition-all duration-400 transform hover:scale-105 shadow-[0_4px_15px_rgba(0,0,0,0.3)] text-sm sm:text-base"
                  >
                    <ShieldCheckIcon />
                    Save encrypted
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Entries Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {filteredEntries.map((entry, index) => (
            <div
              key={entry.id}
              className="group bg-[#2A1B1A]/70 backdrop-blur-md rounded-2xl border border-[#D4A017]/50 p-4 sm:p-6 hover:bg-[#2A1B1A]/90 transition-all duration-400 transform hover:scale-105 shadow-[0_4px_15px_rgba(0,0,0,0.3)]"
              style={{
                animationDelay: `${index * 100}ms`
              }}
            >
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg sm:text-xl font-bold line-clamp-2 group-hover:text-[#D4A017] transition-all duration-400">
                  {entry.title}
                </h3>
                <button
                  onClick={() => handleDelete(entry.id)}
                  className="p-2 bg-[#4A1C2A]/50 hover:bg-[#4A1C2A]/70 rounded-lg transition-all duration-400"
                >
                  <TrashIcon />
                </button>
              </div>

              <div className="mb-4">
                {/* Unlock bar */}
                {unlockedId !== entry.id ? (
                  <div className="flex flex-col sm:flex-row items-center gap-2 mb-3">
                    <input
                      type="password"
                      placeholder="passphrase to unlock the verse"
                      value={unlockPass}
                      onChange={(e) => setUnlockPass(e.target.value)}
                      className="flex-1 px-3 py-2 bg-[#2A1B1A]/70 border border-[#D4A017]/50 rounded-xl text-[#F5E6CC] placeholder-[#F5E6CC]/50 focus:outline-none focus:border-[#D4A017] transition-all duration-400 text-sm sm:text-base"
                    />
                    <button
                      onClick={() => {
                        const text = simpleDecrypt(entry.encrypted, unlockPass);
                        if (text !== null) {
                          setUnlockedId(entry.id);
                        } else {
                          alert("Wrong passphrase");
                        }
                      }}
                      className="flex items-center gap-1 px-3 py-2 bg-[#4A1C2A] text-[#F5E6CC] rounded-xl hover:bg-[#3C2F2F] transition-all duration-400 text-sm sm:text-base"
                    >
                      <UnlockIcon />
                      Unlock
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    <span className="flex items-center gap-1 px-2 py-1 bg-[#3C4F2F]/40 text-[#90EE90] text-xs rounded-xl">
                      <UnlockIcon />
                      Unlocked
                    </span>
                    <button
                      onClick={() => { setUnlockedId(null); setUnlockPass(""); }}
                      className="flex items-center gap-1 px-2 py-1 text-xs sm:text-sm hover:bg-[#2A1B1A]/90 rounded-xl transition-all duration-400"
                    >
                      <LockIcon />
                      Lock
                    </button>
                    <button
                      onClick={() => {
                        const text = simpleDecrypt(entry.encrypted, unlockPass);
                        if (text === null) return alert("Passphrase lost? You cannot recover encrypted text.");
                        const newPass = prompt("New passphrase:") || "";
                        if (!newPass) return;
                        const reEncrypted = simpleEncrypt(text, newPass);
                        const updated = { ...entry, encrypted: reEncrypted, updatedAt: new Date().toISOString() };
                        const newEntries = entries.map(x => x.id === entry.id ? updated : x);
                        setEntries(newEntries);
                        saveEntries(newEntries); // Force immediate save
                      }}
                      className="flex items-center gap-1 px-2 py-1 text-xs sm:text-sm hover:bg-[#2A1B1A]/90 rounded-xl transition-all duration-400"
                    >
                      <RefreshCwIcon />
                      Change Pass
                    </button>
                  </div>
                )}

                <div className={`${settings.blurPreview && showContent ? "blur-sm hover:blur-none transition-all duration-400" : ""} whitespace-pre-wrap leading-relaxed rounded-xl p-3 border border-[#D4A017]/50 bg-[#2A1B1A]/50 text-sm sm:text-base`}>
                  {(() => {
                    let text = "(locked)";
                    if (unlockedId === entry.id) {
                      const plain = simpleDecrypt(entry.encrypted, unlockPass);
                      if (plain === null) {
                        text = "Can't decrypt with current passphrase.";
                      } else {
                        text = showContent ? applyObfuscation(plain) : "•••••••";
                      }
                    }
                    return text;
                  })()}
                </div>
              </div>

              {entry.tags && entry.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {entry.tags.map((tag, tagIndex) => (
                    <span
                      key={tagIndex}
                      className={`px-2 sm:px-3 py-1 ${chipColor(settings.theme)} rounded-xl text-xs`}
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              <div className="flex justify-between items-center text-xs opacity-60">
                <span>{formatDate(entry.createdAt)}</span>
                <span>{entry.wordCount} words</span>
              </div>
            </div>
          ))}
        </div>

        {entries.length === 0 && (
          <div className="text-center py-16 sm:py-20">
            <BookOpenIcon className="w-12 sm:w-16 h-12 sm:h-16 mx-auto mb-4 opacity-50" />
            <h3 className="text-xl sm:text-2xl font-bold mb-2 opacity-70">Welcome to LU's Lounge</h3>
            <p className="text-base sm:text-lg opacity-50">
              Sip your thoughts and let the jazz flow. Start your first verse.
            </p>
          </div>
        )}

        {filteredEntries.length === 0 && entries.length > 0 && (
          <div className="text-center py-16 sm:py-20">
            <SearchIcon className="w-12 sm:w-16 h-12 sm:h-16 mx-auto mb-4 opacity-50" />
            <h3 className="text-xl sm:text-2xl font-bold mb-2 opacity-70">No Verses Found</h3>
            <p className="text-base sm:text-lg opacity-50">
              Adjust your search or pour a new martini of words.
            </p>
          </div>
        )}

        {/* Footer note */}
        <div className="mt-12 sm:mt-16 text-xs sm:text-sm opacity-60 text-center">
          <p>Tip: Savor your verses in ciphers (ROT13, Atbash, Emoji). For true secrecy, trust your passphrase.</p>
        </div>
      </div>
    </div>
  );
}

export default LUs;