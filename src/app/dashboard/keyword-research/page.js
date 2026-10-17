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
  Zap,
  CheckCircle2,
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
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingStage, setLoadingStage] = useState(0);
  const [error, setError] = useState(null);
  const [resultsData, setResultsData] = useState(null);
  const resultsRef = useRef(null);
  const [selectedKeywords, setSelectedKeywords] = useState(new Set());
  const [tableFilter, setTableFilter] = useState('');
  const [copiedKeyword, setCopiedKeyword] = useState(null);

  // Smoothly increment loader progress and stage during keyword collection
  useEffect(() => {
    if (!loading) {
      setLoadingProgress(0);
      setLoadingStage(0);
      return;
    }

    setLoadingProgress(14);
    setLoadingStage(0);

    const timer = setInterval(() => {
      setLoadingProgress((prev) => {
        if (prev < 38) {
          setLoadingStage(0);
          return prev + 6;
        } else if (prev < 72) {
          setLoadingStage(1);
          return prev + 4;
        } else if (prev < 93) {
          setLoadingStage(2);
          return prev + 2;
        }
        return prev;
      });
    }, 160);

    return () => clearInterval(timer);
  }, [loading]);

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

    setResultsData(null);
    setLoading(true);
    try {
      toast.info('Researching Keywords', `Collecting genuine suggestions for "${topic.trim()}"...`);

      // Guarantee minimum duration so the user sees the beautiful spinner smoothly
      const [data] = await Promise.all([
        fetchKeywordResearch({
          topic: topic.trim(),
          platform,
          language: language.code,
          country: country.code,
          maxLimit: 100,
        }),
        new Promise((resolve) => setTimeout(resolve, 850)),
      ]);

      if (data.success) {
        setLoadingProgress(100);

        setTimeout(() => {
          setResultsData(data);
          setSelectedKeywords(new Set());
          setTableFilter('');
          setLoading(false);

          setTimeout(() => {
            resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }, 80);
        }, 220);

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
        setLoading(false);
        setError(data.error || 'Failed to collect keyword suggestions.');
        toast.error('Search Notice', data.error || 'Provider returned no results.');
      }
    } catch (err) {
      setLoading(false);
      console.error('Keyword research fetch error:', err);
      setError(err.message || 'Network error while contacting keyword research service.');
      toast.error('Network Error', 'Failed to reach keyword research service.');
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
                  gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))',
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
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 220px), 1fr))', gap: '1.25rem' }}>
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
          <div className="research-action-row" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
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
                background: loading ? 'var(--brand-primary-hover)' : 'var(--brand-primary)',
                borderColor: 'var(--brand-primary)',
                boxShadow: '0 4px 15px rgba(49, 97, 248, 0.35)',
                transition: 'all 0.2s ease',
              }}
            >
              {loading ? (
                <>
                  <RefreshCw size={18} className="spin-animation" />
                  <span>Harvesting Keywords...</span>
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

      {/* Beautiful Dedicated Loading Spinner Section */}
      {loading && (
        <Card
          className="fade-in-up"
          style={{
            padding: '3rem 2rem',
            textAlign: 'center',
            position: 'relative',
            overflow: 'hidden',
            border: '1.5px solid rgba(99, 102, 241, 0.3)',
            boxShadow: '0 20px 40px -15px rgba(79, 70, 229, 0.15)',
            background: 'var(--bg-card)',
          }}
        >
          {/* Ambient Background Radial Glow */}
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '380px',
              height: '380px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, rgba(6, 182, 212, 0.08) 50%, transparent 75%)',
              pointerEvents: 'none',
              zIndex: 0,
            }}
          />

          <div style={{ position: 'relative', zIndex: 1, maxWidth: '640px', margin: '0 auto' }}>
            {/* Dynamic Concentric Orbital Spinner */}
            <div
              style={{
                position: 'relative',
                width: '100px',
                height: '100px',
                margin: '0 auto 1.75rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {/* Radar Ping Wave */}
              <div
                className="radar-ping"
                style={{
                  position: 'absolute',
                  width: '100%',
                  height: '100%',
                  borderRadius: '50%',
                  border: `2px solid ${platform === 'youtube' ? 'rgba(255, 0, 0, 0.35)' : 'rgba(6, 182, 212, 0.45)'}`,
                  pointerEvents: 'none',
                }}
              />

              {/* Outer Conic/Gradient Rotating Ring */}
              <div
                className="spin-animation"
                style={{
                  position: 'absolute',
                  width: '100%',
                  height: '100%',
                  borderRadius: '50%',
                  border: '3px solid transparent',
                  borderTopColor: platform === 'youtube' ? '#FF0000' : '#4F46E5',
                  borderRightColor: platform === 'youtube' ? '#FF7A00' : '#06B6D4',
                  borderBottomColor: 'transparent',
                  borderLeftColor: 'transparent',
                }}
              />

              {/* Middle Dashed Reverse Ring */}
              <div
                className="spin-reverse-slow"
                style={{
                  position: 'absolute',
                  width: '76%',
                  height: '76%',
                  borderRadius: '50%',
                  border: '2px dashed rgba(99, 102, 241, 0.5)',
                }}
              />

              {/* Central Glowing Core */}
              <div
                className="pulse-orb"
                style={{
                  width: '52px',
                  height: '52px',
                  borderRadius: '16px',
                  background: platform === 'youtube' 
                    ? 'linear-gradient(135deg, #FF0000, #FF5E3A)' 
                    : 'linear-gradient(135deg, #4F46E5, #06B6D4)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff',
                  boxShadow: platform === 'youtube'
                    ? '0 6px 20px rgba(255, 0, 0, 0.4)'
                    : '0 6px 20px rgba(79, 70, 229, 0.45)',
                }}
              >
                <Sparkles size={24} />
              </div>
            </div>

            {/* Main Status Headline */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
              <span
                style={{
                  display: 'inline-block',
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: '#10b981',
                  boxShadow: '0 0 10px #10b981',
                }}
              />
              <h3
                style={{
                  fontSize: '1.35rem',
                  fontWeight: 800,
                  margin: 0,
                  color: 'var(--text-primary)',
                  letterSpacing: '-0.02em',
                }}
              >
                Generating Genuine Keywords...
              </h3>
            </div>

            {/* Query Target Details */}
            <p
              style={{
                fontSize: '0.9375rem',
                color: 'var(--text-secondary)',
                margin: '0 auto 1.5rem',
                lineHeight: 1.5,
              }}
            >
              Collecting high-intent search suggestions for{' '}
              <strong style={{ color: 'var(--brand-primary)', fontWeight: 700 }}>
                &ldquo;{topic.trim()}&rdquo;
              </strong>{' '}
              directly from{' '}
              <span style={{ fontWeight: 600, color: platform === 'youtube' ? '#ff0000' : '#3161F8' }}>
                {platform === 'youtube' ? 'YouTube Autocomplete' : 'Google Autocomplete'}
              </span>
              .
            </p>

            {/* Dynamic Animated Progress Bar */}
            <div style={{ marginBottom: '1.75rem' }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontSize: '0.75rem',
                  color: 'var(--text-muted)',
                  fontWeight: 600,
                  marginBottom: '0.5rem',
                }}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <RefreshCw size={13} className="spin-animation" style={{ color: 'var(--brand-primary)' }} />
                  {loadingStage === 0 && 'Stage 1/3: Establishing telemetry session...'}
                  {loadingStage === 1 && 'Stage 2/3: Probing A–Z alphabet extensions & modifiers...'}
                  {loadingStage === 2 && 'Stage 3/3: Deduplicating and indexing top 100 suggestions...'}
                </span>
                <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{Math.min(loadingProgress, 100)}%</span>
              </div>

              {/* Progress Track */}
              <div
                style={{
                  width: '100%',
                  height: '7px',
                  borderRadius: '9999px',
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-primary)',
                  overflow: 'hidden',
                }}
              >
                <div
                  className="shimmer-progress"
                  style={{
                    width: `${Math.min(loadingProgress, 100)}%`,
                    height: '100%',
                    borderRadius: '9999px',
                    transition: 'width 0.25s ease-out',
                  }}
                />
              </div>
            </div>

            {/* Live Stage Indicators */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                gap: '0.75rem',
                textAlign: 'left',
                padding: '1rem',
                background: 'var(--bg-secondary)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-primary)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <div
                  style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: loadingStage >= 0 ? 'var(--brand-primary-light)' : 'transparent',
                    color: loadingStage >= 0 ? 'var(--brand-primary)' : 'var(--text-muted)',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                  }}
                >
                  {loadingStage > 0 ? '✓' : <RefreshCw size={12} className="spin-animation" />}
                </div>
                <div>
                  <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)' }}>Autocomplete Connect</div>
                  <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>Verified API Gateway</div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <div
                  style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: loadingStage >= 1 ? 'var(--brand-primary-light)' : 'transparent',
                    color: loadingStage >= 1 ? 'var(--brand-primary)' : 'var(--text-muted)',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                  }}
                >
                  {loadingStage > 1 ? '✓' : loadingStage === 1 ? <RefreshCw size={12} className="spin-animation" /> : '2'}
                </div>
                <div>
                  <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)' }}>Alphabet Expansions</div>
                  <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>a–z Variations & Intent</div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <div
                  style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: loadingStage >= 2 ? 'var(--brand-primary-light)' : 'transparent',
                    color: loadingStage >= 2 ? 'var(--brand-primary)' : 'var(--text-muted)',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                  }}
                >
                  {loadingStage === 2 ? <RefreshCw size={12} className="spin-animation" /> : '3'}
                </div>
                <div>
                  <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)' }}>100 Unique Cap</div>
                  <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>In-Memory Deduplication</div>
                </div>
              </div>
            </div>

            {/* Target Config Chips */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginTop: '1.25rem', flexWrap: 'wrap' }}>
              <span
                style={{
                  fontSize: '0.75rem',
                  padding: '0.2rem 0.65rem',
                  borderRadius: '9999px',
                  background: platform === 'youtube' ? 'rgba(255, 0, 0, 0.1)' : 'rgba(49, 97, 248, 0.1)',
                  color: platform === 'youtube' ? '#ff0000' : '#3161F8',
                  fontWeight: 600,
                }}
              >
                {platform === 'youtube' ? 'YouTube Autocomplete' : 'Google Autocomplete'}
              </span>
              <span
                style={{
                  fontSize: '0.75rem',
                  padding: '0.2rem 0.65rem',
                  borderRadius: '9999px',
                  background: 'var(--bg-secondary)',
                  color: 'var(--text-secondary)',
                  border: '1px solid var(--border-primary)',
                  fontWeight: 500,
                }}
              >
                🌐 {language.name} ({language.code})
              </span>
              <span
                style={{
                  fontSize: '0.75rem',
                  padding: '0.2rem 0.65rem',
                  borderRadius: '9999px',
                  background: 'var(--bg-secondary)',
                  color: 'var(--text-secondary)',
                  border: '1px solid var(--border-primary)',
                  fontWeight: 500,
                }}
              >
                {country.flag} {country.name}
              </span>
            </div>
          </div>
        </Card>
      )}

      {/* Results Section */}
      {resultsData && !loading && (
        <div ref={resultsRef} className="fade-in-up">
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
            <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
              <table style={{ width: '100%', minWidth: '540px', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
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
        </div>
      )}

      {/* Educational Guidance Footer Card */}
      {!resultsData && !loading && (
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

      <style jsx global>{`
        @media (max-width: 640px) {
          .research-action-row {
            flex-direction: column !important;
            align-items: stretch !important;
          }
          .research-action-row button[type="submit"] {
            width: 100% !important;
            justify-content: center !important;
          }
        }
      `}</style>
    </div>
  );
}
