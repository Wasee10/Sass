'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import { useToast } from '@/context/ToastContext';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { fetchKeywordResearch } from '@/client/keyword-research';
import {
  Search,
  Sparkles,
  Copy,
  Check,
  Download,
  Filter,
  RefreshCw,
  Globe,
  MapPin,
  AlertCircle,
  ExternalLink,
  ChevronDown,
  Layers,
  CheckSquare,
  Square,
  ArrowRight,
  X,
  SlidersHorizontal,
  Flame,
  FileSpreadsheet,
} from 'lucide-react';

// Supported Search Platforms
const PLATFORMS = [
  {
    id: 'google',
    name: 'Google Search',
    badge: 'Autocomplete API',
    description: 'General web search autocomplete suggestions directly from Google.',
    color: '#3161F8',
    bg: 'rgba(49, 97, 248, 0.1)',
  },
  {
    id: 'youtube',
    name: 'YouTube',
    badge: 'Video Autocomplete',
    description: 'High-intent video search suggestions via Google YouTube autocomplete (ds=yt).',
    color: '#FF0000',
    bg: 'rgba(255, 0, 0, 0.1)',
  },
];

// Supported Languages
const LANGUAGES = [
  { code: 'en', name: 'English', native: 'English' },
  { code: 'bn', name: 'Bengali', native: 'বাংলা' },
  { code: 'es', name: 'Spanish', native: 'Español' },
  { code: 'fr', name: 'French', native: 'Français' },
  { code: 'de', name: 'German', native: 'Deutsch' },
  { code: 'hi', name: 'Hindi', native: 'हिन्दी' },
  { code: 'pt', name: 'Portuguese', native: 'Português' },
  { code: 'ar', name: 'Arabic', native: 'العربية' },
  { code: 'ja', name: 'Japanese', native: '日本語' },
  { code: 'zh-CN', name: 'Chinese (Simplified)', native: '简体中文' },
  { code: 'it', name: 'Italian', native: 'Italiano' },
  { code: 'ru', name: 'Russian', native: 'Русский' },
  { code: 'tr', name: 'Turkish', native: 'Türkçe' },
  { code: 'id', name: 'Indonesian', native: 'Bahasa Indonesia' },
  { code: 'ur', name: 'Urdu', native: 'اردو' },
  { code: 'ko', name: 'Korean', native: '한국어' },
];

// Supported Countries (mapped to ISO 3166-1 alpha-2 code)
const COUNTRIES = [
  { code: 'us', name: 'United States', flag: '🇺🇸' },
  { code: 'bd', name: 'Bangladesh', flag: '🇧🇩' },
  { code: 'gb', name: 'United Kingdom', flag: '🇬🇧' },
  { code: 'ca', name: 'Canada', flag: '🇨🇦' },
  { code: 'au', name: 'Australia', flag: '🇦🇺' },
  { code: 'in', name: 'India', flag: '🇮🇳' },
  { code: 'de', name: 'Germany', flag: '🇩🇪' },
  { code: 'fr', name: 'France', flag: '🇫🇷' },
  { code: 'br', name: 'Brazil', flag: '🇧🇷' },
  { code: 'ae', name: 'United Arab Emirates', flag: '🇦🇪' },
  { code: 'sa', name: 'Saudi Arabia', flag: '🇸🇦' },
  { code: 'jp', name: 'Japan', flag: '🇯🇵' },
  { code: 'sg', name: 'Singapore', flag: '🇸🇬' },
  { code: 'es', name: 'Spain', flag: '🇪🇸' },
  { code: 'it', name: 'Italy', flag: '🇮🇹' },
  { code: 'pk', name: 'Pakistan', flag: '🇵🇰' },
];

const SUGGESTED_SEEDS = [
  'best travel backpacks',
  'ai automation tools',
  'nextjs saas template',
  'digital marketing course',
  'cloud storage pricing',
];

export default function KeywordResearchPage() {
  const toast = useToast();

  // Search Settings State
  const [platform, setPlatform] = useState('google');
  const [language, setLanguage] = useState(LANGUAGES[0]); // English
  const [country, setCountry] = useState(COUNTRIES[0]); // United States
  const [topic, setTopic] = useState('');

  // Dropdown UI states
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const [langSearch, setLangSearch] = useState('');
  const [countryDropdownOpen, setCountryDropdownOpen] = useState(false);
  const [countrySearch, setCountrySearch] = useState('');

  const langRef = useRef(null);
  const countryRef = useRef(null);

  // Results State
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [resultsData, setResultsData] = useState(null);
  const [selectedKeywords, setSelectedKeywords] = useState(new Set());
  const [tableFilter, setTableFilter] = useState('');
  const [copiedKeyword, setCopiedKeyword] = useState(null);

  // Close dropdowns on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (langRef.current && !langRef.current.contains(event.target)) {
        setLangDropdownOpen(false);
      }
      if (countryRef.current && !countryRef.current.contains(event.target)) {
        setCountryDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filtered Languages
  const filteredLanguages = useMemo(() => {
    if (!langSearch.trim()) return LANGUAGES;
    const q = langSearch.toLowerCase();
    return LANGUAGES.filter(
      (l) => l.name.toLowerCase().includes(q) || l.native.toLowerCase().includes(q) || l.code.toLowerCase().includes(q)
    );
  }, [langSearch]);

  // Filtered Countries
  const filteredCountries = useMemo(() => {
    if (!countrySearch.trim()) return COUNTRIES;
    const q = countrySearch.toLowerCase();
    return COUNTRIES.filter(
      (c) => c.name.toLowerCase().includes(q) || c.code.toLowerCase().includes(q)
    );
  }, [countrySearch]);

  // Handle Form Submission
  const handleGenerateKeywords = async (e) => {
    e?.preventDefault();
    setError(null);

    if (!topic || !topic.trim()) {
      setError('Please enter a topic or seed keyword before generating.');
      toast.error('Topic Required', 'Please enter a seed topic or keyword.');
      return;
    }

    setLoading(true);
    try {
      toast.info('Researching Keywords', `Collecting genuine suggestions for "${topic.trim()}"...`);

      const data = await fetchKeywordResearch({
        topic: topic.trim(),
        platform,
        language: language.code,
        country: country.code,
        maxLimit: 100,
      });

      if (data.success) {
        setResultsData(data);
        setSelectedKeywords(new Set());
        setTableFilter('');

        // Synchronize with dashboard telemetry via localStorage
        if (typeof window !== 'undefined') {
          try {
            const rawHist = localStorage.getItem('stratum_keyword_research_history');
            let hist = [];
            if (rawHist) {
              try { hist = JSON.parse(rawHist); } catch {}
            }
            const newEntry = {
              id: 'kw-' + Date.now(),
              topic: data.topic,
              platform: data.platform,
              language: language.name,
              country: `${country.flag} ${country.name}`,
              total: data.total,
              sampleKeywords: data.keywords.slice(0, 8),
              timestamp: new Date().toISOString(),
            };
            const updatedHist = [newEntry, ...hist.filter(h => h.topic.toLowerCase() !== data.topic.toLowerCase())].slice(0, 10);
            localStorage.setItem('stratum_keyword_research_history', JSON.stringify(updatedHist));

            const cumulativeTotal = updatedHist.reduce((acc, item) => acc + (item.total || 0), 0);
            localStorage.setItem(
              'stratum_keyword_research_latest',
              JSON.stringify({
                latestTopic: data.topic,
                latestPlatform: data.platform,
                latestLanguage: language.name,
                latestCountry: `${country.flag} ${country.name}`,
                totalKeywords: data.total,
                cumulativeTotal,
                totalSearches: updatedHist.length,
                topKeywords: data.keywords.slice(0, 8),
                timestamp: new Date().toISOString(),
              })
            );

            window.dispatchEvent(new Event('stratum_keyword_research_updated'));
          } catch (e) {
            console.warn('LocalStorage keyword save error:', e);
          }
        }

        toast.success(
          'Keywords Ready!',
          `Collected ${data.total} unique suggestions from ${platform === 'youtube' ? 'YouTube' : 'Google'}.`
        );
      } else {
        setError(data.error || 'Failed to collect keyword suggestions.');
        toast.error('Search Notice', data.error || 'Provider returned no results.');
      }
    } catch (err) {
      console.error('Keyword research fetch error:', err);
      setError(err.message || 'Network error while contacting keyword research service.');
      toast.error('Network Error', 'Failed to reach keyword research service.');
    } finally {
      setLoading(false);
    }
  };

  // Filtered keyword suggestions in table
  const displayedKeywords = useMemo(() => {
    if (!resultsData?.keywords) return [];
    if (!tableFilter.trim()) return resultsData.keywords;
    const q = tableFilter.toLowerCase();
    return resultsData.keywords.filter((kw) => kw.toLowerCase().includes(q));
  }, [resultsData, tableFilter]);

  // Checkbox selection handlers
  const handleToggleSelectKeyword = (kw) => {
    setSelectedKeywords((prev) => {
      const next = new Set(prev);
      if (next.has(kw)) {
        next.delete(kw);
      } else {
        next.add(kw);
      }
      return next;
    });
  };

  const handleSelectAll = () => {
    if (selectedKeywords.size === displayedKeywords.length) {
      setSelectedKeywords(new Set());
    } else {
      setSelectedKeywords(new Set(displayedKeywords));
    }
  };

  // Copy Handlers
  const handleCopySingle = (kw) => {
    navigator.clipboard.writeText(kw);
    setCopiedKeyword(kw);
    toast.success('Keyword Copied', `"${kw}" copied to clipboard.`);
    setTimeout(() => setCopiedKeyword(null), 2000);
  };

  const handleCopySelected = () => {
    if (selectedKeywords.size === 0) {
      toast.warning('No Keywords Selected', 'Please select at least one keyword using checkboxes.');
      return;
    }
    const text = Array.from(selectedKeywords).join('\n');
    navigator.clipboard.writeText(text);
    toast.success('Keywords Copied!', `${selectedKeywords.size} selected keywords copied to clipboard.`);
  };

  const handleCopyAll = () => {
    if (!resultsData?.keywords || resultsData.keywords.length === 0) return;
    const text = resultsData.keywords.join('\n');
    navigator.clipboard.writeText(text);
    toast.success('All Keywords Copied!', `${resultsData.keywords.length} keywords copied to clipboard.`);
  };

  // Export to CSV
  const handleExportCSV = () => {
    if (!resultsData?.keywords || resultsData.keywords.length === 0) return;

    const rows = [
      ['Row', 'Keyword', 'Word Count', 'Platform', 'Language', 'Country'],
      ...resultsData.keywords.map((kw, index) => [
        index + 1,
        `"${kw.replace(/"/g, '""')}"`,
        kw.split(/\s+/).length,
        resultsData.platform,
        resultsData.language,
        resultsData.country.toUpperCase(),
      ]),
    ];

    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map((e) => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    const safeTopic = resultsData.topic.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    link.setAttribute('download', `stratum-keywords-${safeTopic}-${resultsData.platform}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success('CSV Exported!', `Downloaded ${resultsData.keywords.length} keywords as CSV.`);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', paddingBottom: '3rem' }}>
      {/* Page Header */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
          <span
            style={{
              fontSize: '0.75rem',
              fontWeight: 800,
              color: 'var(--brand-primary)',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              background: 'var(--brand-primary-light)',
              padding: '0.2rem 0.65rem',
              borderRadius: '9999px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
            }}
          >
            <Sparkles size={12} /> Search Engine Intelligence
          </span>
        </div>
        <h1 style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontWeight: 800, margin: 0, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
          Keyword Research
        </h1>
        <p style={{ margin: '0.35rem 0 0 0', color: 'var(--text-secondary)', fontSize: '0.9375rem' }}>
          Collect up to 100 genuine, unique keyword suggestions directly from Google Autocomplete and YouTube suggestion engines.
        </p>
      </div>

      {/* Main Search Configuration Card */}
      <Card style={{ padding: '2rem' }}>
        <form onSubmit={handleGenerateKeywords}>
          {/* Settings Section: Platform, Language, Country */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginBottom: '1.75rem' }}>
            {/* Setting 1: Search Platform */}
            <div>
              <label style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '0.65rem' }}>
                1. Select Search Platform
              </label>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                  gap: '0.85rem',
                }}
              >
                {PLATFORMS.map((p) => {
                  const isSelected = platform === p.id;
                  return (
                    <div
                      key={p.id}
                      onClick={() => setPlatform(p.id)}
                      style={{
                        padding: '1rem',
                        borderRadius: 'var(--radius-lg)',
                        border: isSelected
                          ? `2px solid ${p.color}`
                          : '1px solid var(--border-primary)',
                        background: isSelected ? p.bg : 'var(--bg-secondary)',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                        position: 'relative',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <div
                            style={{
                              width: '18px',
                              height: '18px',
                              borderRadius: '50%',
                              border: isSelected ? `5px solid ${p.color}` : '2px solid var(--border-secondary)',
                              background: '#ffffff',
                            }}
                          />
                          <strong style={{ fontSize: '0.9375rem', color: 'var(--text-primary)' }}>
                            {p.name}
                          </strong>
                        </div>
                        <span
                          style={{
                            fontSize: '0.65rem',
                            fontWeight: 700,
                            padding: '0.15rem 0.45rem',
                            borderRadius: '4px',
                            background: p.unavailable ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                            color: p.unavailable ? '#ef4444' : '#10b981',
                            letterSpacing: '0.02em',
                          }}
                        >
                          {p.badge}
                        </span>
                      </div>
                      <p style={{ margin: 0, fontSize: '0.78125rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                        {p.description}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Setting 2 & 3: Language & Country (Searchable Dropdowns) */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem' }}>
              {/* Language Searchable Dropdown */}
              <div style={{ position: 'relative' }} ref={langRef}>
                <label style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '0.45rem' }}>
                  2. Language (hl)
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setLangDropdownOpen(!langDropdownOpen);
                    setCountryDropdownOpen(false);
                    setLangSearch('');
                  }}
                  style={{
                    width: '100%',
                    height: '44px',
                    padding: '0 0.85rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-primary)',
                    background: 'var(--bg-secondary)',
                    color: 'var(--text-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                    fontWeight: 500,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Globe size={16} color="var(--brand-primary)" />
                    <span>{language.name} ({language.native})</span>
                    <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>[{language.code}]</span>
                  </div>
                  <ChevronDown size={16} color="var(--text-muted)" />
                </button>

                {/* Dropdown Menu */}
                {langDropdownOpen && (
                  <div
                    style={{
                      position: 'absolute',
                      top: '100%',
                      left: 0,
                      right: 0,
                      marginTop: '4px',
                      background: 'var(--bg-card)',
                      border: '1px solid var(--border-primary)',
                      borderRadius: 'var(--radius-md)',
                      boxShadow: 'var(--shadow-lg)',
                      zIndex: 30,
                      maxHeight: '260px',
                      overflowY: 'auto',
                      padding: '0.5rem',
                    }}
                  >
                    {/* Search Input inside Dropdown */}
                    <div style={{ position: 'relative', marginBottom: '0.5rem' }}>
                      <Search size={14} style={{ position: 'absolute', left: '8px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                      <input
                        type="text"
                        placeholder="Search language..."
                        value={langSearch}
                        onChange={(e) => setLangSearch(e.target.value)}
                        autoFocus
                        style={{
                          width: '100%',
                          height: '32px',
                          paddingLeft: '28px',
                          paddingRight: '8px',
                          fontSize: '0.8125rem',
                          borderRadius: 'var(--radius-sm)',
                          border: '1px solid var(--border-primary)',
                          background: 'var(--bg-secondary)',
                          color: 'var(--text-primary)',
                        }}
                      />
                    </div>

                    {filteredLanguages.length === 0 ? (
                      <div style={{ padding: '0.5rem', fontSize: '0.8125rem', color: 'var(--text-muted)', textAlign: 'center' }}>
                        No language found
                      </div>
                    ) : (
                      filteredLanguages.map((l) => {
                        const isCurrent = l.code === language.code;
                        return (
                          <div
                            key={l.code}
                            onClick={() => {
                              setLanguage(l);
                              setLangDropdownOpen(false);
                            }}
                            style={{
                              padding: '0.5rem 0.65rem',
                              borderRadius: 'var(--radius-sm)',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              background: isCurrent ? 'var(--brand-primary-light)' : 'transparent',
                              color: isCurrent ? 'var(--brand-primary)' : 'var(--text-primary)',
                              fontSize: '0.8125rem',
                              fontWeight: isCurrent ? 700 : 400,
                            }}
                          >
                            <span>{l.name} ({l.native})</span>
                            <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>{l.code}</span>
                          </div>
                        );
                      })
                    )}
                  </div>
                )}
              </div>

              {/* Country Searchable Dropdown */}
              <div style={{ position: 'relative' }} ref={countryRef}>
                <label style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '0.45rem' }}>
                  3. Country (gl)
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setCountryDropdownOpen(!countryDropdownOpen);
                    setLangDropdownOpen(false);
                    setCountrySearch('');
                  }}
                  style={{
                    width: '100%',
                    height: '44px',
                    padding: '0 0.85rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-primary)',
                    background: 'var(--bg-secondary)',
                    color: 'var(--text-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                    fontWeight: 500,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '1.15rem' }}>{country.flag}</span>
                    <span>{country.name}</span>
                    <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>[{country.code.toUpperCase()}]</span>
                  </div>
                  <ChevronDown size={16} color="var(--text-muted)" />
                </button>

                {/* Dropdown Menu */}
                {countryDropdownOpen && (
                  <div
                    style={{
                      position: 'absolute',
                      top: '100%',
                      left: 0,
                      right: 0,
                      marginTop: '4px',
                      background: 'var(--bg-card)',
                      border: '1px solid var(--border-primary)',
                      borderRadius: 'var(--radius-md)',
                      boxShadow: 'var(--shadow-lg)',
                      zIndex: 30,
                      maxHeight: '260px',
                      overflowY: 'auto',
                      padding: '0.5rem',
                    }}
                  >
                    {/* Search Input inside Dropdown */}
                    <div style={{ position: 'relative', marginBottom: '0.5rem' }}>
                      <Search size={14} style={{ position: 'absolute', left: '8px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                      <input
                        type="text"
                        placeholder="Search country..."
                        value={countrySearch}
                        onChange={(e) => setCountrySearch(e.target.value)}
                        autoFocus
                        style={{
                          width: '100%',
                          height: '32px',
                          paddingLeft: '28px',
                          paddingRight: '8px',
                          fontSize: '0.8125rem',
                          borderRadius: 'var(--radius-sm)',
                          border: '1px solid var(--border-primary)',
                          background: 'var(--bg-secondary)',
                          color: 'var(--text-primary)',
                        }}
                      />
                    </div>

                    {filteredCountries.length === 0 ? (
                      <div style={{ padding: '0.5rem', fontSize: '0.8125rem', color: 'var(--text-muted)', textAlign: 'center' }}>
                        No country found
                      </div>
                    ) : (
                      filteredCountries.map((c) => {
                        const isCurrent = c.code === country.code;
                        return (
                          <div
                            key={c.code}
                            onClick={() => {
                              setCountry(c);
                              setCountryDropdownOpen(false);
                            }}
                            style={{
                              padding: '0.5rem 0.65rem',
                              borderRadius: 'var(--radius-sm)',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              background: isCurrent ? 'var(--brand-primary-light)' : 'transparent',
                              color: isCurrent ? 'var(--brand-primary)' : 'var(--text-primary)',
                              fontSize: '0.8125rem',
                              fontWeight: isCurrent ? 700 : 400,
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <span>{c.flag}</span>
                              <span>{c.name}</span>
                            </div>
                            <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>{c.code.toUpperCase()}</span>
                          </div>
                        );
                      })
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Prominent Topic Input Field */}
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)', display: 'block', marginBottom: '0.5rem' }}>
              Enter Your Topic *
            </label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Search
                size={18}
                style={{
                  position: 'absolute',
                  left: '1rem',
                  color: 'var(--text-muted)',
                  pointerEvents: 'none',
                }}
              />
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g., best travel backpacks"
                disabled={loading}
                style={{
                  width: '100%',
                  height: '48px',
                  paddingLeft: '2.75rem',
                  paddingRight: '1rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1.5px solid var(--border-primary)',
                  background: 'var(--bg-secondary)',
                  color: 'var(--text-primary)',
                  fontSize: '0.9375rem',
                  outline: 'none',
                  transition: 'border-color 0.15s ease',
                }}
              />
            </div>

            {/* Quick Seeds */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginTop: '0.65rem', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Try sample:</span>
              {SUGGESTED_SEEDS.map((seed) => (
                <button
                  key={seed}
                  type="button"
                  onClick={() => setTopic(seed)}
                  style={{
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border-primary)',
                    borderRadius: '9999px',
                    padding: '0.15rem 0.65rem',
                    fontSize: '0.75rem',
                    color: 'var(--text-secondary)',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {seed}
                </button>
              ))}
            </div>
          </div>

          {/* Error Banner if any */}
          {error && (
            <div
              className="alert alert-error"
              style={{
                marginBottom: '1.25rem',
                fontSize: '0.8125rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          {/* Action Row */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
            <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Layers size={14} />
              <span>Collects base queries, alphabet variations (a-z), and intent modifiers up to 100 unique results.</span>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
              style={{
                padding: '0.75rem 1.75rem',
                fontWeight: 700,
                fontSize: '0.9375rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                background: 'var(--brand-primary)',
                borderColor: 'var(--brand-primary)',
                boxShadow: '0 4px 15px rgba(49, 97, 248, 0.35)',
              }}
            >
              {loading ? (
                <>
                  <RefreshCw size={18} className="spin-animation" />
                  <span>Collecting 100 Keywords...</span>
                </>
              ) : (
                <>
                  <Sparkles size={18} />
                  <span>Generate Keywords</span>
                </>
              )}
            </button>
          </div>
        </form>
      </Card>

      {/* Results Section */}
      {resultsData && (
        <Card style={{ padding: '2rem' }}>
          {/* Metadata Summary Banner Above Table */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingBottom: '1.25rem',
              borderBottom: '1px solid var(--border-primary)',
              marginBottom: '1.5rem',
              flexWrap: 'wrap',
              gap: '1rem',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem', flexWrap: 'wrap' }}>
                <span
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    padding: '0.2rem 0.65rem',
                    borderRadius: '9999px',
                    background: resultsData.platform === 'youtube' ? 'rgba(255, 0, 0, 0.12)' : 'rgba(49, 97, 248, 0.12)',
                    color: resultsData.platform === 'youtube' ? '#ff0000' : '#3161F8',
                    border: `1px solid ${resultsData.platform === 'youtube' ? '#ff000033' : '#3161F833'}`,
                  }}
                >
                  {resultsData.platform === 'youtube' ? 'YouTube Autocomplete' : 'Google Search Autocomplete'}
                </span>
                <span
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    padding: '0.2rem 0.65rem',
                    borderRadius: '9999px',
                    background: 'var(--bg-secondary)',
                    color: 'var(--text-secondary)',
                    border: '1px solid var(--border-primary)',
                  }}
                >
                  {language.name} ({resultsData.language})
                </span>
                <span
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    padding: '0.2rem 0.65rem',
                    borderRadius: '9999px',
                    background: 'var(--bg-secondary)',
                    color: 'var(--text-secondary)',
                    border: '1px solid var(--border-primary)',
                  }}
                >
                  {country.flag} {country.name} ({resultsData.country.toUpperCase()})
                </span>
              </div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
                {resultsData.total} Unique Suggestions for &ldquo;{resultsData.topic}&rdquo;
              </h2>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  padding: '0.25rem 0.65rem',
                  borderRadius: '6px',
                  background: 'rgba(16, 185, 129, 0.15)',
                  color: '#10b981',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                }}
              >
                ✓ Genuine Provider Suggestions · 0 Fabricated Data
              </span>
            </div>
          </div>

          {/* Table Actions Toolbar */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '1rem',
              marginBottom: '1.25rem',
              flexWrap: 'wrap',
            }}
          >
            {/* Filter Input */}
            <div style={{ position: 'relative', minWidth: '240px', flex: '1 1 240px' }}>
              <Filter
                size={15}
                style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}
              />
              <input
                type="text"
                placeholder="Filter keywords in results..."
                value={tableFilter}
                onChange={(e) => setTableFilter(e.target.value)}
                style={{
                  width: '100%',
                  height: '38px',
                  paddingLeft: '32px',
                  paddingRight: '10px',
                  fontSize: '0.8125rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-primary)',
                  background: 'var(--bg-secondary)',
                  color: 'var(--text-primary)',
                }}
              />
              {tableFilter && (
                <button
                  type="button"
                  onClick={() => setTableFilter('')}
                  style={{
                    position: 'absolute',
                    right: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                  }}
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Bulk Action Buttons */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              {/* Select All Toggle */}
              <button
                type="button"
                onClick={handleSelectAll}
                className="btn btn-secondary btn-sm"
                style={{ fontSize: '0.8125rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
              >
                {selectedKeywords.size === displayedKeywords.length && displayedKeywords.length > 0 ? (
                  <>
                    <CheckSquare size={14} color="var(--brand-primary)" />
                    <span>Deselect All</span>
                  </>
                ) : (
                  <>
                    <Square size={14} />
                    <span>Select All ({displayedKeywords.length})</span>
                  </>
                )}
              </button>

              {/* Copy Selected */}
              <button
                type="button"
                onClick={handleCopySelected}
                disabled={selectedKeywords.size === 0}
                className="btn btn-secondary btn-sm"
                style={{
                  fontSize: '0.8125rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  opacity: selectedKeywords.size === 0 ? 0.6 : 1,
                }}
              >
                <Copy size={14} />
                <span>Copy Selected ({selectedKeywords.size})</span>
              </button>

              {/* Copy All */}
              <button
                type="button"
                onClick={handleCopyAll}
                className="btn btn-secondary btn-sm"
                style={{ fontSize: '0.8125rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
              >
                <Copy size={14} />
                <span>Copy All ({resultsData.keywords.length})</span>
              </button>

              {/* Export CSV */}
              <button
                type="button"
                onClick={handleExportCSV}
                className="btn btn-primary btn-sm"
                style={{
                  fontSize: '0.8125rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  background: '#10b981',
                  borderColor: '#10b981',
                }}
              >
                <Download size={14} />
                <span>Export CSV</span>
              </button>
            </div>
          </div>

          {/* Results Table */}
          <div
            style={{
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border-primary)',
              overflow: 'hidden',
              background: 'var(--bg-secondary)',
            }}
          >
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
                <thead>
                  <tr
                    style={{
                      background: 'var(--bg-card)',
                      borderBottom: '1px solid var(--border-primary)',
                      color: 'var(--text-muted)',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                    }}
                  >
                    <th style={{ padding: '0.85rem 1rem', width: '42px', textAlign: 'center' }}>
                      <input
                        type="checkbox"
                        checked={selectedKeywords.size === displayedKeywords.length && displayedKeywords.length > 0}
                        onChange={handleSelectAll}
                        style={{ cursor: 'pointer', accentColor: 'var(--brand-primary)' }}
                      />
                    </th>
                    <th style={{ padding: '0.85rem 1rem', width: '50px' }}>#</th>
                    <th style={{ padding: '0.85rem 1rem' }}>Keyword Suggestion</th>
                    <th style={{ padding: '0.85rem 1rem', width: '120px' }}>Words</th>
                    <th style={{ padding: '0.85rem 1rem', width: '140px', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {displayedKeywords.length === 0 ? (
                    <tr>
                      <td colSpan={5} style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                        No keyword suggestions match your filter &ldquo;{tableFilter}&rdquo;.
                      </td>
                    </tr>
                  ) : (
                    displayedKeywords.map((kw, index) => {
                      const isSelected = selectedKeywords.has(kw);
                      const isJustCopied = copiedKeyword === kw;
                      const wordCount = kw.split(/\s+/).filter(Boolean).length;
                      const searchUrl =
                        resultsData.platform === 'youtube'
                          ? `https://www.youtube.com/results?search_query=${encodeURIComponent(kw)}`
                          : `https://www.google.com/search?q=${encodeURIComponent(kw)}&hl=${resultsData.language}&gl=${resultsData.country}`;

                      return (
                        <tr
                          key={kw + index}
                          onClick={() => handleToggleSelectKeyword(kw)}
                          style={{
                            borderBottom: '1px solid var(--border-primary)',
                            background: isSelected ? 'rgba(49, 97, 248, 0.06)' : 'transparent',
                            cursor: 'pointer',
                            transition: 'background 0.15s ease',
                          }}
                        >
                          <td style={{ padding: '0.85rem 1rem', textAlign: 'center' }} onClick={(e) => e.stopPropagation()}>
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handleToggleSelectKeyword(kw)}
                              style={{ cursor: 'pointer', accentColor: 'var(--brand-primary)' }}
                            />
                          </td>
                          <td style={{ padding: '0.85rem 1rem', color: 'var(--text-muted)', fontSize: '0.8125rem' }}>
                            {index + 1}
                          </td>
                          <td style={{ padding: '0.85rem 1rem' }}>
                            <strong style={{ color: 'var(--text-primary)', fontWeight: 600 }}>
                              {kw}
                            </strong>
                          </td>
                          <td style={{ padding: '0.85rem 1rem' }}>
                            <span
                              style={{
                                fontSize: '0.6875rem',
                                padding: '0.15rem 0.5rem',
                                borderRadius: '4px',
                                background: 'var(--bg-card)',
                                border: '1px solid var(--border-primary)',
                                color: 'var(--text-secondary)',
                              }}
                            >
                              {wordCount} {wordCount === 1 ? 'word' : 'words'}
                            </span>
                          </td>
                          <td style={{ padding: '0.85rem 1rem', textAlign: 'right' }} onClick={(e) => e.stopPropagation()}>
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                              <button
                                type="button"
                                onClick={() => handleCopySingle(kw)}
                                title="Copy keyword"
                                style={{
                                  background: 'var(--bg-card)',
                                  border: '1px solid var(--border-primary)',
                                  borderRadius: 'var(--radius-sm)',
                                  padding: '0.3rem 0.55rem',
                                  fontSize: '0.75rem',
                                  color: isJustCopied ? '#10b981' : 'var(--text-secondary)',
                                  cursor: 'pointer',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '0.25rem',
                                }}
                              >
                                {isJustCopied ? <Check size={13} color="#10b981" /> : <Copy size={13} />}
                                <span>{isJustCopied ? 'Copied' : 'Copy'}</span>
                              </button>
                              <a
                                href={searchUrl}
                                target="_blank"
                                rel="noreferrer"
                                title={`Search on ${resultsData.platform === 'youtube' ? 'YouTube' : 'Google'}`}
                                style={{
                                  background: 'var(--bg-card)',
                                  border: '1px solid var(--border-primary)',
                                  borderRadius: 'var(--radius-sm)',
                                  padding: '0.3rem 0.45rem',
                                  color: 'var(--text-muted)',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                }}
                              >
                                <ExternalLink size={13} />
                              </a>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Table Footer Stats */}
            <div
              style={{
                padding: '0.85rem 1.25rem',
                borderTop: '1px solid var(--border-primary)',
                background: 'var(--bg-card)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: '0.8125rem',
                color: 'var(--text-secondary)',
                flexWrap: 'wrap',
                gap: '0.5rem',
              }}
            >
              <div>
                Showing <strong>{displayedKeywords.length}</strong> of <strong>{resultsData.total}</strong> suggestions
                {selectedKeywords.size > 0 && ` · ${selectedKeywords.size} selected`}
              </div>
              <button
                type="button"
                onClick={() => {
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--brand-primary)',
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  textDecoration: 'underline',
                }}
              >
                Back to top / Search another topic
              </button>
            </div>
          </div>
        </Card>
      )}

      {/* Educational Guidance Footer Card */}
      {!resultsData && (
        <Card style={{ padding: '2rem' }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: 800, margin: '0 0 0.85rem 0', color: 'var(--text-primary)' }}>
            How Does Controlled Keyword Research Work?
          </h3>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: '1.5rem',
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                <span style={{ width: '22px', height: '22px', borderRadius: '50%', background: 'var(--brand-primary-light)', color: 'var(--brand-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem' }}>1</span>
                <span>Genuine Autocomplete Telemetry</span>
              </div>
              <p style={{ margin: 0, fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                Queries are routed directly to Google and YouTube suggestion endpoints using genuine <code style={{ fontSize: '0.75rem', background: 'var(--bg-secondary)', padding: '2px 4px', borderRadius: '3px' }}>client=chrome</code> parameters without artificial estimations.
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                <span style={{ width: '22px', height: '22px', borderRadius: '50%', background: 'var(--brand-primary-light)', color: 'var(--brand-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem' }}>2</span>
                <span>Alphabet & Intent Expansion</span>
              </div>
              <p style={{ margin: 0, fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                Stratum systematically probes the seed topic through letter variations (a-z) and intent modifiers (how to, best, for, vs) with bounded concurrency to discover high-intent long-tail phrases.
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                <span style={{ width: '22px', height: '22px', borderRadius: '50%', background: 'var(--brand-primary-light)', color: 'var(--brand-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem' }}>3</span>
                <span>100 Unique Keyword Cap</span>
              </div>
              <p style={{ margin: 0, fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                Deduplication is handled automatically in memory. Results halt at 100 unique items or report the exact count discovered without synthetic padding.
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
