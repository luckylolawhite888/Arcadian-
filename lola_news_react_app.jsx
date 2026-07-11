
import React, { useState, useEffect, useRef } from 'react';
import {
  Play, Pause, BookOpen, Search, ThumbsUp, AlertTriangle, Link, Info,
  Shield, MessageSquare, CheckCircle, Flame, Sun, Moon, Volume2, VolumeX,
  HelpCircle, FileText, Send, Sparkles, X, RotateCcw, Compass, Heart,
Share2, Award,
  Users, TrendingUp, HelpCircle as QuizIcon, BarChart2, Smile, AlertOctagon
} from 'lucide-react';

// ==========================================
// CONFIG & CONSTANTS
// ==========================================
const API_KEY = ""; // Provided at runtime by preview environment
const APP_ID = typeof __app_id !== 'undefined' ? __app_id : 'lola-news';

// Creators and their custom AI prompting parameters
const CREATORS = {
  lola: {
    id: "lola",
    name: "Lola",
    handle: "@lolas_view",
    avatar: "
https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200
",
    bio: "Unbiased, slightly sarcastic, highly caffeinated policy nerd.
Here to tell you why they're lying to you. 😏",
    color: "from-pink-500 to-rose-500",
    ringColor: "ring-pink-500",
    promptStyle: "sarcastic, witty, punchy, conversational, and deeply
critical of corporate PR. Use emojis like 😏 and 🙄."
  },
  elena: {
    id: "elena",
    name: "Elena",
    handle: "@elena_stats",
    avatar: "
https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200
",
    bio: "Data journalist. Show me the spreadsheets or it didn't happen.
Obsessed with positive progress. 📊",
    color: "from-emerald-400 to-teal-600",
    ringColor: "ring-emerald-500",
    promptStyle: "highly analytical, data-driven, obsessed with statistics
and structural progress. Format major comparisons using clean markdown
tables. Avoid fluff."
  },
  marcus: {
    id: "marcus",
    name: "Marcus",
    handle: "@marcus_explains",
    avatar: "
https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200
",
    bio: "Ex-Legacy News editor who escaped the paywalls. Deep dives on
economics, housing, and structural chaos. 🎙️",
    color: "from-violet-500 to-indigo-600",
    ringColor: "ring-indigo-500",
    promptStyle: "historical, systemic, exploring the 'why behind the why'.
Focuses on macro-economics, housing, and labor trends. Deep, editorial, and
intellectual."
  }
};

const MOCK_NEWS = [
  {
    id: "news-1",
    creator: CREATORS.lola,
    title: "The 'Right to Repair' Bill Just Passed. Why Tech Giants Are
Fuming.",
    tldr: "You can finally fix your own phone without Apple treating you
like an international spy. Massive blow to planned obsolescence.",
    category: "Tech & Freedom",
    mood: "mind-expanding",
    duration: "58s video • 3 min read",
    videoUrl: "
https://assets.mixkit.co/videos/preview/mixkit-hand-holding-a-smartphone-with-a-cracked-screen-40766-large.mp4
",
    whyItMatters: "Your devices will last longer, saving you money, and
diverting metric tons of toxic lithium-ion waste from landfills. It forces
tech giants to sell genuine parts directly to the public.",
    background: "For decades, companies utilized proprietary screws and
software locks to monopolize repair, forcing consumers into a constant
upgrade cycle. After a relentless grassroots push by creators and hackers,
regulatory dams are breaking.",
    whatNext: "Expect independent repair shops to pop up everywhere. Keep
an eye on your tech brands—some are already trying to find software
loopholes to block DIY fixes.",
    actionPlan: {
      text: "Support local repair centers or check out iFixit guides before
tossing your next cracked screen.",
      link: "https://www.ifixit.com"
    },
    working: {
      reliability: "98% (Official Legislative Docs)",
      bias: "Slightly anti-monopoly, heavily pro-consumer. We don't hide
it: tech monopolies suck.",
      sources: [
        { name: "FTC Right to Repair Report", url: "https://www.ftc.gov" },
        { name: "EU Parliament Open Directives", url: "
https://www.europarl.europa.eu" },
        { name: "Repair.org Coalition Statement", url: "
https://www.repair.org" }
      ]
    },
    talkbacks: [
      { creator: "Elena", comment: "The math is clear: Right to Repair
saves the average household $330/year and reduces electronics waste by
40,000 tons daily. Epic win. 📊" },
      { creator: "Marcus", comment: "This is a rare victory of grassroots
consumer organizing over corporate patent-monopolies. Expect massive
lobbying backlashes in swing states though." }
    ]
  },
  {
    id: "news-2",
    creator: CREATORS.elena,
    title: "Scientists Build Plastic-Devouring Enzyme That Works in 24
Hours",
    tldr: "A supercharged enzyme can break down PET plastics in hours
instead of centuries. Real, actionable hope for global trash crisis.",
    category: "Planet & Tech",
    mood: "good-news",
    duration: "1m 12s video • 2 min read",
    videoUrl: "
https://assets.mixkit.co/videos/preview/mixkit-close-up-of-plastic-bottles-in-a-recycling-bin-48906-large.mp4
",
    whyItMatters: "Standard recycling is mostly a myth (only 9% actually
gets recycled). This biological solution breaks plastic down to its base
molecular blocks, enabling infinite 100% recycling loops.",
    background: "Originally discovered in a Japanese waste dump in 2016,
researchers have spent years using AI-driven protein folding models to
engineer a variant called FAST-PETase that can survive diverse
temperatures.",
    whatNext: "Scaling up is the hard part. Industrial-sized bio-reactors
are currently being prototyped in France and Texas to handle municipal
waste streams.",
    actionPlan: {
      text: "Support groups lobbying for extended producer responsibility
(EPR) laws so companies are forced to fund bio-reactors.",
      link: "https://www.plasticpollutioncoalition.org"
    },
    working: {
      reliability: "100% (Peer-Reviewed Nature Journal)",
      bias: "Highly objective scientific data, though we are openly
enthusiastic about saving the biosphere.",
      sources: [
        { name: "Nature Journal Publication", url: "https://www.nature.com"
},
        { name: "University of Texas Research Portal", url: "
https://www.utexas.edu" }
      ]
    },
    talkbacks: [
      { creator: "Lola", comment: "Reminder: Companies will try to use this
as an excuse to produce MORE plastic. 'Don't worry, the enzymes got it!'
Don't let them off the hook. 🙄" },
      { creator: "Marcus", comment: "True structural change will require
petrochemical taxes alongside this bio-tech. It is a brilliant tool, but we
can't consume our way out of supply habits." }
    ]
  },
  {
    id: "news-3",
    creator: CREATORS.marcus,
    title: "Corporate Landlords Are Using AI to Collude and Jack Up Rent
prices",
    tldr: "An algorithm called 'YieldStar' has been helping major property
developers align pricing to ensure nobody undercuts the market.",
    category: "Housing Crisis",
    mood: "wtf",
    duration: "1m 45s video • 4 min read",
    videoUrl: "
https://assets.mixkit.co/videos/preview/mixkit-construction-site-of-a-new-apartment-building-41718-large.mp4
",
    whyItMatters: "If you feel like rent is suspiciously high, it is.
Software is automating price hikes by telling landlords to leave units
empty rather than lowering rent.",
    background: "A series of investigative leaks revealed that a software
firm acts as an algorithmic middleman, allowing competing landlords to
coordinate pricing without ever holding a secret meeting in a smoke-filled
room.",
    whatNext: "The Department of Justice and multiple state Attorney
Generals have officially launched antitrust lawsuits to ban this software.",
    actionPlan: {
      text: "Look up local Tenants Unions in your city. Knowledge is
power—knowing your rights makes landlords sweat.",
      link: "https://www.tenantstogether.org"
    },
    working: {
      reliability: "95% (Active DOJ Antitrust Lawsuits)",
      bias: "Pro-tenant, highly critical of speculative real estate
collusion.",
      sources: [
        { name: "DOJ Antitrust Division Filings", url: "
https://www.justice.gov" },
        { name: "ProPublica Algorithmic Rent Investigation", url: "
https://www.propublica.org" }
      ]
    },
    talkbacks: [
      { creator: "Lola", comment: "Literally automated cartels. They call
it 'optimizing yield,' normal people call it 'extortion.' Thrilled the DOJ
is actually doing something. 😏" },
      { creator: "Elena", comment: "The data shows cities using YieldStar
saw rent hikes 4.8% higher than adjacent cities without the tech. It is
collusion, clean and simple." }
    ]
  }
];

const PROMPT_SUGGESTIONS = [
  { label: "De-bias Headline", text: "De-bias this: 'Millennials are
completely destroying the homeownership market due to avocado toast and
laziness.'" },
  { label: "Rent Control Myths", text: "Why do news channels keep saying
rent control is bad for renters? Give me the actual corporate incentives
behind that." },
  { label: "Fast Fashion Hype", text: "What's the real ecological and labor
cost of ultra-fast-fashion apps like Temu/Shein?" }
];

// Interactive Daily BS-Detection Quiz Questions
const QUIZ_QUESTIONS = [
  {
    question: "A viral TikTok video claims: 'The government is quietly
implementing a social credit score through digital subway passes.' What's
the best immediate BS check?",
    options: [
      { text: "Share it instantly to warn others, just in case.",
isCorrect: false },
      { text: "Check if the video lists a primary source or legislative
document. Search for official press releases rather than trusting
text-to-speech commentary.", isCorrect: true },
      { text: "Trust it because the comments section is filled with people
agreeing.", isCorrect: false }
    ],
    explanation: "Alarmist claims on short-form platforms often use scary
robot voices to drive engagement. Always look for real legislative bills or
primary source references!"
  },
  {
    question: "A major headline screams: 'STUDY FINDS DRINKING 3 CUPS OF
COFFEE A DAY REDUCES LIFE EXPECTANCY BY 10 YEARS!' What should you look for
before throwing out your coffee maker?",
    options: [
      { text: "See who funded the study (e.g., was it funded by a rival
beverage group or is it peer-reviewed?).", isCorrect: true },
      { text: "Assume it's true because it uses capitalized text.",
isCorrect: false },
      { text: "Stop drinking coffee immediately to protect your life.",
isCorrect: false }
    ],
    explanation: "Many dramatic medical headlines are funded by private
interest lobby groups or based on tiny, non-peer-reviewed sample sizes.
Always inspect the research funding sources!"
  }
];

// Helper: Exponential Backoff Fetch
async function fetchWithRetry(url, options, retries = 5, delay = 1000) {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, options);
      if (response.ok) return await response.json();
      if (response.status === 429) {
        await new Promise(res => setTimeout(res, delay));
        delay *= 2;
        continue;
      }
      throw new Error(`HTTP Error: ${response.status}`);
    } catch (error) {
      if (i === retries - 1) throw error;
      await new Promise(res => setTimeout(res, delay));
      delay *= 2;
    }
  }
}

export default function App() {
  const [darkMode, setDarkMode] = useState(true);

  // Navigation: 'feed' | 'shorts' | 'detector' | 'sandbox'
  const [activeTab, setActiveTab] = useState('feed');

  // Feed filters
  const [selectedMood, setSelectedMood] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Article detail state
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [showWorking, setShowWorking] = useState(false);

  // Shorts Video Index State
  const [currentShortIdx, setCurrentShortIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);

  // Community interactive reactions
  const [reactions, setReactions] = useState({});

  // Creator AI Chatbot state (Dynamic Persona)
  const [currentChatPersona, setCurrentChatPersona] = useState('lola');
  const [chatInput, setChatInput] = useState('');
  const [chatLog, setChatLog] = useState([
    { role: 'assistant', creator: 'lola', text: "Hey! I'm Lola. Throw any
clickbait headline, complicated news topic, or paywalled article link at me
and I'll break it down with zero BS, clear sources, and some actual flavor.
😏" }
  ]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // "My News Diet" Emotional Balance Tracker
  const [newsDiet, setNewsDiet] = useState({
    goodNews: 1, // Start with small base counts
    mindExpanding: 1,
    wtf: 1
  });

  // Daily BS Check Quiz State
  const [quizIndex, setQuizIndex] = useState(0);
  const [quizAnswered, setQuizAnswered] = useState(null);
  const [quizScore, setQuizScore] = useState(0);
  const [quizCompleted, setQuizCompleted] = useState(false);

  // User Interactive "Structured Debates / Prompts" inside modal
  const [activeStructuredPrompt, setActiveStructuredPrompt] =
useState(null);
  const [promptResponse, setPromptResponse] = useState('');
  const [isPromptLoading, setIsPromptLoading] = useState(false);

  const videoRef = useRef(null);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  useEffect(() => {
    if (activeTab === 'shorts' && videoRef.current) {
      videoRef.current.load();
      if (isPlaying) {
        videoRef.current.play().catch(() => {});
      }
    }
  }, [currentShortIdx, activeTab, isPlaying]);

  // Track Article Consumption to update News Diet
  const handleArticleOpen = (article) => {
    setSelectedArticle(article);
    setShowWorking(false);
    setActiveStructuredPrompt(null);
    setPromptResponse('');

    // Increment diet counts based on category
    setNewsDiet(prev => {
      const updated = { ...prev };
      if (article.mood === 'good-news') updated.goodNews += 1;
      else if (article.mood === 'mind-expanding') updated.mindExpanding +=
1;
      else if (article.mood === 'wtf') updated.wtf += 1;
      return updated;
    });
  };

  // Run dynamic prompt based on selected AI Persona
  const handleAISubmit = async (customText = null) => {
    const textToSend = customText || chatInput;
    if (!textToSend.trim()) return;

    // Append user message
    const updatedLog = [...chatLog, { role: 'user', text: textToSend }];
    setChatLog(updatedLog);
    setChatInput('');
    setIsGenerating(true);
    setErrorMessage('');

    const persona = CREATORS[currentChatPersona];

    const systemPrompt = `
      You are ${persona.name}, a brilliant creator-curator for 18-40s with
a following handle ${persona.handle}.
      Your personality characteristics: ${persona.promptStyle}
      We strongly stand against paywalls, media manipulation, and rage-bait.

      When answering the user, format your answer with these exact
structured points and distinct style:

      1. 💥 THE RAW SCOOP: 2-3 blunt, zero-fluff sentences.
      2. 💡 CONTEXT & SYSTEMIC REASON: Why is this happening? Show us who
gains money/power here.
      3. 🛠️ BALANCED ACTION: What can normal citizens actually do about
this, or what solutions are being actively engineered?
      4. 🕵️ SOURCES TO AUDIT: Name specific unbiased organizations, public
registers, or peer scientific bodies the reader can search to verify your
claims.
    `;

    try {
      const endpoint = `
https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${API_KEY}`
;
      const response = await fetchWithRetry(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: textToSend }] }],
          systemInstruction: { parts: [{ text: systemPrompt }] }
        })
      });

      const rawText = response.candidates?.[0]?.content?.parts?.[0]?.text;
      if (rawText) {
        setChatLog(prev => [...prev, { role: 'assistant', creator:
currentChatPersona, text: rawText }]);
      } else {
        throw new Error("Empty AI response");
      }
    } catch (err) {
      console.error(err);
      setErrorMessage("Ugh, my servers are hitting a paywall. Give it
another shot!");
    } finally {
      setIsGenerating(false);
    }
  };

  // Structured discussion triggers inside Deep Dive Modal
  const triggerStructuredPrompt = async (type) => {
    setActiveStructuredPrompt(type);
    setIsPromptLoading(true);
    setPromptResponse('');

    const promptText = `
      Article Title: "${selectedArticle.title}"
      TL;DR: "${selectedArticle.tldr}"

      Task: Provide a fast ${type === 'eli5' ? 'Explain Like I\'m 5' :
'intellectual Devil\'s Advocate argument'}
      for this scenario in a witty, highly conversational paragraph. Keep
it under 100 words. Keep it fun and direct!
    `;

    try {
      const endpoint = `
https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${API_KEY}`
;
      const response = await fetchWithRetry(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: promptText }] }]
        })
      });
      const txt = response.candidates?.[0]?.content?.parts?.[0]?.text;
      setPromptResponse(txt || "Couldn't generate. Try again!");
    } catch (e) {
      setPromptResponse("Our servers are taking a collective coffee break.
Try that again in a second!");
    } finally {
      setIsPromptLoading(false);
    }
  };

  const handleQuizAnswer = (option, index) => {
    setQuizAnswered(index);
    if (option.isCorrect) {
      setQuizScore(prev => prev + 1);
    }
  };

  const nextQuizQuestion = () => {
    setQuizAnswered(null);
    if (quizIndex < QUIZ_QUESTIONS.length - 1) {
      setQuizIndex(prev => prev + 1);
    } else {
      setQuizCompleted(true);
    }
  };

  const resetQuiz = () => {
    setQuizIndex(0);
    setQuizAnswered(null);
    setQuizScore(0);
    setQuizCompleted(false);
  };

  const toggleReaction = (id, type) => {
    setReactions(prev => {
      const storyReactions = prev[id] || { support: false, eyeOpening:
false };
      return {
        ...prev,
        [id]: { ...storyReactions, [type]: !storyReactions[type] }
      };
    });
  };

  const filteredNews = MOCK_NEWS.filter(item => {
    const matchesMood = selectedMood === 'all' || item.mood ===
selectedMood;
    const matchesSearch =
item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||

item.tldr.toLowerCase().includes(searchQuery.toLowerCase()) ||

item.creator.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesMood && matchesSearch;
  });

  // Calculate percentages for the News Diet
  const totalRead = newsDiet.goodNews + newsDiet.mindExpanding +
newsDiet.wtf;
  const goodPct = Math.round((newsDiet.goodNews / totalRead) * 100);
  const mindPct = Math.round((newsDiet.mindExpanding / totalRead) * 100);
  const wtfPct = Math.round((newsDiet.wtf / totalRead) * 100);

  return (
    <div className={`min-h-screen pb-24 transition-colors duration-300
${darkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50
text-slate-800'}`}>

      {/* ==========================================
          HEADER SECTION
         ========================================== */}
      <header className={`sticky top-0 z-30 backdrop-blur-md border-b
transition-all duration-300 ${darkMode ? 'bg-slate-950/80 border-slate-800'
: 'bg-white/80 border-slate-200'}`}>
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center
justify-between">
          <div className="flex items-center space-x-2">
            <span className="p-2 bg-gradient-to-tr from-pink-500
via-rose-500 to-indigo-600 rounded-xl text-white shadow-lg">
              <Sparkles className="h-5 w-5 animate-pulse" />
            </span>
            <div>
              <h1 className="text-xl font-black tracking-tight
bg-gradient-to-r from-pink-500 via-rose-500 to-indigo-600 bg-clip-text
text-transparent">
                LOLA NEWS
              </h1>
              <p className="text-[10px] tracking-widest uppercase font-bold
text-slate-400">Zero BS. Full Vibe.</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {/* Nav tabs for wider screens */}
            <nav className="hidden md:flex space-x-1 bg-slate-100
dark:bg-slate-900 p-1 rounded-xl">
              <button
                onClick={() => setActiveTab('feed')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold
transition-all ${activeTab === 'feed' ? 'bg-white dark:bg-slate-800 shadow
text-slate-950 dark:text-white' : 'text-slate-400'}`}>
                Curated Feed
              </button>
              <button
                onClick={() => setActiveTab('shorts')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold
transition-all ${activeTab === 'shorts' ? 'bg-white dark:bg-slate-800
shadow text-slate-950 dark:text-white' : 'text-slate-400'}`}>
                Creator Shorts
              </button>
              <button
                onClick={() => setActiveTab('detector')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold
transition-all ${activeTab === 'detector' ? 'bg-white dark:bg-slate-800
shadow text-slate-950 dark:text-white' : 'text-slate-400'}`}>
                AI Detector
              </button>
              <button
                onClick={() => setActiveTab('sandbox')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold
transition-all ${activeTab === 'sandbox' ? 'bg-white dark:bg-slate-800
shadow text-slate-950 dark:text-white' : 'text-slate-400'}`}>
                Vibe Sandbox
              </button>
            </nav>

            {/* Dark Mode Toggle */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`p-2 rounded-xl border transition-all ${darkMode ?
'border-slate-800 bg-slate-900 hover:bg-slate-800 text-amber-400' :
'border-slate-200 bg-white hover:bg-slate-50 text-slate-600'}`}>
              {darkMode ? <Sun className="h-4.5 w-4.5" /> : <Moon
className="h-4.5 w-4.5" />}
            </button>
          </div>
        </div>
      </header>

      {/* ==========================================
          MAIN LAYOUT CONTENT
         ========================================== */}
      <main className="max-w-4xl mx-auto px-4 py-6">

        {/* TAB 1: CURATED FEED */}
        {activeTab === 'feed' && (
          <div className="space-y-6">

            {/* MINI DIET ALARM & HERO */}
            <div className="relative overflow-hidden rounded-3xl p-6
bg-gradient-to-br from-indigo-950/40 via-purple-900/10 to-transparent
border border-indigo-500/20 shadow-xl">
              <div className="flex flex-col md:flex-row justify-between
items-start md:items-center gap-4">
                <div className="max-w-lg space-y-1.5">
                  <span className="inline-flex items-center px-2.5 py-0.5
rounded-full text-[10px] font-semibold bg-indigo-500/20 text-indigo-300
border border-indigo-500/30">
                    <TrendingUp className="h-3 w-3 mr-1" /> My News Diet
Meter
                  </span>
                  <h2 className="text-xl font-bold tracking-tight
text-white">
                    {wtfPct > 50 ? "⚠️ Danger: High Rage-Bait Levels!" : "✨
Vibe Level: Perfectly Balanced"}
                  </h2>
                  <p className="text-xs text-slate-300">
                    {wtfPct > 50
                      ? "You've been consuming a lot of 'WTF/Rage' content.
Balance your feed out by checking some 'Good News' stories!"
                      : "Awesome. You're staying informed without getting
trapped in algorithmic rage-bait cycles."}
                  </p>
                </div>

                {/* Visual Diet Progress Meter */}
                <div className="flex items-center space-x-2 bg-black/40 p-3
rounded-2xl border border-white/5">
                  <div className="text-center">
                    <span className="block text-[10px] font-bold
text-emerald-400">☀️ Good</span>
                    <span className="text-sm
font-extrabold">{goodPct}%</span>
                  </div>
                  <div className="h-8 w-[1px] bg-slate-800" />
                  <div className="text-center">
                    <span className="block text-[10px] font-bold
text-indigo-400">🧠 Mind</span>
                    <span className="text-sm
font-extrabold">{mindPct}%</span>
                  </div>
                  <div className="h-8 w-[1px] bg-slate-800" />
                  <div className="text-center">
                    <span className="block text-[10px] font-bold
text-rose-400">🤯 WTF</span>
                    <span className="text-sm
font-extrabold">{wtfPct}%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* SEARCH & VIBE/MOOD FILTERS */}
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2
-translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search articles, topics, or creators..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`w-full pl-10 pr-4 py-3 rounded-2xl border
outline-none transition-all ${darkMode ? 'bg-slate-900 border-slate-800
focus:border-purple-500 focus:ring-1 focus:ring-purple-500' : 'bg-white
border-slate-200 focus:border-indigo-500 focus:ring-1
focus:ring-indigo-500'}`}
                />
              </div>

              {/* Mood Filters */}
              <div className="flex flex-wrap gap-2 items-center">
                <span className="text-xs font-bold uppercase tracking-wider
text-slate-400 mr-1">Vibe Filter:</span>
                {[
                  { id: 'all', label: 'All Stories', icon: <Compass
className="h-3.5 w-3.5" /> },
                  { id: 'good-news', label: 'Good News Only ☀️', icon: <Sun
className="h-3.5 w-3.5 text-emerald-400" /> },
                  { id: 'mind-expanding', label: 'Mind Expanding 🧠', icon:
<Info className="h-3.5 w-3.5 text-indigo-400" /> },
                  { id: 'wtf', label: 'WTF / Deep Dives 🤯', icon: <Flame
className="h-3.5 w-3.5 text-rose-400" /> }
                ].map((mood) => (
                  <button
                    key={mood.id}
                    onClick={() => setSelectedMood(mood.id)}
                    className={`flex items-center space-x-1.5 px-3 py-1.5
rounded-full text-xs font-semibold transition-all ${
                      selectedMood === mood.id
                        ? 'bg-purple-600 text-white shadow-md
shadow-purple-900/20 scale-105'
                        : darkMode ? 'bg-slate-900 text-slate-300 border
border-slate-800 hover:bg-slate-800' : 'bg-white text-slate-600 border
border-slate-200 hover:bg-slate-50'
                    }`}>
                    {mood.icon}
                    <span>{mood.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* FEED Grid */}
            {filteredNews.length === 0 ? (
              <div className="text-center py-12 border border-dashed
border-slate-700 rounded-3xl">
                <Compass className="h-12 w-12 mx-auto text-slate-400 mb-2
animate-bounce" />
                <p className="font-semibold">No results here.</p>
                <p className="text-xs text-slate-400 mt-1">Try toggling
different filters or searching for something else.</p>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 animate-fadeIn">
                {filteredNews.map((story) => {
                  const state = reactions[story.id] || { support: false,
eyeOpening: false };
                  return (
                    <article
                      key={story.id}
                      className={`group flex flex-col justify-between
overflow-hidden rounded-3xl border transition-all duration-300
hover:scale-[1.01] hover:shadow-xl ${
                        darkMode ? 'bg-slate-900/50 hover:bg-slate-900
border-slate-800' : 'bg-white hover:bg-slate-50 border-slate-200'
                      }`}>

                      <div className="p-5 space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <img
                              src={story.creator.avatar}
                              alt={story.creator.name}
                              className="h-8 w-8 rounded-full border
border-purple-500 object-cover"
                            />
                            <div>
                              <div className="flex items-center space-x-1">
                                <span className="text-xs font-bold
leading-none">{story.creator.name}</span>
                                <span className="text-[10px]
text-purple-400">😏</span>
                              </div>
                              <span className="text-[10px]
text-slate-400">{story.creator.handle}</span>
                            </div>
                          </div>
                          <span className={`px-2.5 py-0.5 rounded-full
text-[10px] font-bold uppercase tracking-wider ${
                            story.mood === 'good-news' ? 'bg-emerald-500/10
text-emerald-400 border border-emerald-500/20' :
                            story.mood === 'wtf' ? 'bg-rose-500/10
text-rose-400 border border-rose-500/20' :
                            'bg-indigo-500/10 text-indigo-400 border
border-indigo-500/20'
                          }`}>
                            {story.mood === 'good-news' ? 'Good News' :
story.mood === 'wtf' ? 'WTF Story' : 'Deep Dive'}
                          </span>
                        </div>

                        <div className="space-y-2">
                          <h3 className="text-lg font-bold tracking-tight
leading-snug group-hover:text-purple-400 transition-colors">
                            {story.title}
                          </h3>
                          <p className="text-xs text-slate-400 line-clamp-2
leading-relaxed">
                            {story.tldr}
                          </p>
                        </div>

                        <div className="inline-flex items-center space-x-1
text-xs text-purple-400 bg-purple-500/10 px-2.5 py-1 rounded-lg">
                          <Play className="h-3 w-3 fill-current" />
                          <span
className="font-semibold">{story.duration}</span>
                        </div>
                      </div>

                      {/* Bottom action zone */}
                      <div className={`px-5 py-4 flex items-center
justify-between border-t ${darkMode ? 'border-slate-800 bg-slate-950/40' :
'border-slate-100 bg-slate-50'}`}>
                        <div className="flex items-center space-x-3
text-slate-400">
                          <button
                            onClick={() => toggleReaction(story.id,
'support')}
                            className={`flex items-center space-x-1
hover:text-pink-500 transition-colors ${state.support ? 'text-pink-500' :
''}`}>
                            <Heart className={`h-4.5 w-4.5 ${state.support
? 'fill-current' : ''}`} />
                          </button>
                          <button
                            onClick={() => toggleReaction(story.id,
'eyeOpening')}
                            className={`flex items-center space-x-1
hover:text-amber-500 transition-colors ${state.eyeOpening ?
'text-amber-400' : ''}`}>
                            <Flame className={`h-4.5 w-4.5
${state.eyeOpening ? 'fill-current' : ''}`} />
                          </button>
                        </div>

                        <button
                          onClick={() => handleArticleOpen(story)}
                          className="flex items-center space-x-1 text-xs
font-bold text-white bg-gradient-to-r from-pink-500 to-rose-500 px-3.5
py-1.5 rounded-xl hover:shadow-lg hover:shadow-rose-500/20 active:scale-95
transition-all">
                          <span>Unwrap Story</span>
                          <BookOpen className="h-3.5 w-3.5" />
                        </button>
                      </div>

                    </article>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: SHORTS VIDEO MODE (TIKTOK EXPERIENCE) */}
        {activeTab === 'shorts' && (
          <div className="max-w-md mx-auto relative flex flex-col
items-center">

            <div className="w-full text-center mb-4">
              <span className="inline-block px-2.5 py-1 rounded-full
text-xs font-bold bg-purple-500/10 text-purple-400 border
border-purple-500/20">
                ⚡ Video Summaries • No Clickbait
              </span>
              <p className="text-[11px] text-slate-400 mt-1">Tap video to
Play/Pause. Swipe/Click arrows to cycle.</p>
            </div>

            {/* Vertical Mobile Player Shell */}
            <div className={`relative w-full aspect-[9/16] rounded-3xl
overflow-hidden shadow-2xl border ${darkMode ? 'border-slate-800
bg-slate-950' : 'border-slate-200 bg-black'}`}>

              <video
                ref={videoRef}
                src={MOCK_NEWS[currentShortIdx].videoUrl}
                className="w-full h-full object-cover pointer-events-auto
cursor-pointer"
                loop
                muted={isMuted}
                autoPlay
                onClick={() => setIsPlaying(!isPlaying)}
              />

              {/* Mute Overlay Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsMuted(!isMuted);
                }}
                className="absolute top-4 right-4 z-20 p-2.5 bg-black/60
rounded-full text-white backdrop-blur-md border border-white/10">
                {isMuted ? <VolumeX className="h-4.5 w-4.5" /> : <Volume2
className="h-4.5 w-4.5" />}
              </button>

              {/* Pause Overlay indicator */}
              {!isPlaying && (
                <div
                  onClick={() => setIsPlaying(true)}
                  className="absolute inset-0 bg-black/40 flex items-center
justify-center z-10 cursor-pointer">
                  <span className="p-4 bg-white/20 backdrop-blur-md
rounded-full text-white border border-white/30 animate-ping">
                    <Play className="h-8 w-8 fill-current" />
                  </span>
                </div>
              )}

              {/* Bottom Information overlay panel */}
              <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t
from-black/95 via-black/50 to-transparent p-5 pt-12 text-white space-y-4">

                {/* Creator Meta */}
                <div className="flex items-center space-x-2">
                  <img
                    src={MOCK_NEWS[currentShortIdx].creator.avatar}
                    alt={MOCK_NEWS[currentShortIdx].creator.name}
                    className="h-10 w-10 rounded-full border-2
border-pink-500 object-cover"
                  />
                  <div>
                    <h4 className="text-sm font-bold flex items-center">
                      {MOCK_NEWS[currentShortIdx].creator.name}
                      <span className="text-[10px] ml-1 bg-pink-500/30
text-pink-300 px-1.5 py-0.2 rounded">Creator</span>
                    </h4>
                    <p className="text-[10px]
text-slate-300">{MOCK_NEWS[currentShortIdx].creator.handle}</p>
                  </div>
                </div>

                {/* News Headline */}
                <div className="space-y-1.5">
                  <span className="px-2 py-0.5 rounded text-[9px] font-bold
bg-indigo-600/60 uppercase tracking-widest text-indigo-100 border
border-indigo-500/20">
                    {MOCK_NEWS[currentShortIdx].category}
                  </span>
                  <p className="text-base font-bold leading-tight">
                    {MOCK_NEWS[currentShortIdx].title}
                  </p>
                  <p className="text-xs text-slate-300 line-clamp-2">
                    {MOCK_NEWS[currentShortIdx].tldr}
                  </p>
                </div>

                {/* Action buttons line inside Shorts video overlay */}
                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={() =>
toggleReaction(MOCK_NEWS[currentShortIdx].id, 'support')}
                      className={`flex flex-col items-center space-y-0.5
${reactions[MOCK_NEWS[currentShortIdx].id]?.support ? 'text-pink-500' :
'text-slate-300'}`}>
                      <Heart className="h-5 w-5" />
                      <span className="text-[10px]">Like</span>
                    </button>
                    <button
                      onClick={() =>
toggleReaction(MOCK_NEWS[currentShortIdx].id, 'eyeOpening')}
                      className={`flex flex-col items-center space-y-0.5
${reactions[MOCK_NEWS[currentShortIdx].id]?.eyeOpening ? 'text-amber-400' :
'text-slate-300'}`}>
                      <Flame className="h-5 w-5" />
                      <span className="text-[10px]">Vibe</span>
                    </button>
                  </div>

                  {/* Open deep dive button */}
                  <button
                    onClick={() =>
handleArticleOpen(MOCK_NEWS[currentShortIdx])}
                    className="flex items-center space-x-1 text-xs
font-bold bg-white text-black hover:bg-slate-100 px-4 py-2 rounded-xl
active:scale-95 transition-all shadow-lg text-slate-950">
                    <span>Read Deep Dive</span>
                    <BookOpen className="h-4 w-4" />
                  </button>
                </div>

              </div>

            </div>

            {/* Cycle Control buttons underneath player */}
            <div className="flex justify-between items-center w-full mt-4">
              <button
                disabled={currentShortIdx === 0}
                onClick={() => {
                  setCurrentShortIdx(prev => prev - 1);
                  setIsPlaying(true);
                }}
                className={`flex items-center space-x-1 text-xs font-bold
px-4 py-2 rounded-xl border ${
                  currentShortIdx === 0
                    ? 'opacity-50 cursor-not-allowed border-slate-800
text-slate-500'
                    : 'border-slate-700 hover:bg-purple-600
hover:text-white transition-all'
                }`}>
                <span>← Previous</span>
              </button>

              <span className="text-xs font-semibold text-slate-400">
                {currentShortIdx + 1} of {MOCK_NEWS.length}
              </span>

              <button
                disabled={currentShortIdx === MOCK_NEWS.length - 1}
                onClick={() => {
                  setCurrentShortIdx(prev => prev + 1);
                  setIsPlaying(true);
                }}
                className={`flex items-center space-x-1 text-xs font-bold
px-4 py-2 rounded-xl border ${
                  currentShortIdx === MOCK_NEWS.length - 1
                    ? 'opacity-50 cursor-not-allowed border-slate-800
text-slate-500'
                    : 'border-slate-700 hover:bg-purple-600
hover:text-white transition-all'
                }`}>
                <span>Next →</span>
              </button>
            </div>

          </div>
        )}

        {/* TAB 3: THE AI CONTEXT ENGINE & BULLSHIT DETECTOR */}
        {activeTab === 'detector' && (
          <div className="space-y-6">

            {/* INFORMATIVE INTRO CARD */}
            <div className="p-6 rounded-3xl bg-gradient-to-br
from-purple-900/40 via-violet-900/20 to-transparent border
border-purple-500/20 shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="p-1.5 bg-purple-500/20 text-purple-400
rounded-lg">
                    <Sparkles className="h-5 w-5 animate-spin" />
                  </span>
                  <h3 className="text-lg font-bold">Unbiased Creator AI
Sandbox</h3>
                </div>
                <span className="text-xs font-semibold bg-indigo-500/10
text-indigo-400 px-3 py-1 rounded-full border border-indigo-500/20">
                  Select your Expert
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Legislation can be boring, and media feeds are dramatic.
Select a creator below to analyze any claim, link, or corporate PR
statement from their unique perspective!
              </p>

              {/* Creator Selector Buttons */}
              <div className="grid grid-cols-3 gap-3 pt-2">
                {Object.values(CREATORS).map((creator) => (
                  <button
                    key={creator.id}
                    onClick={() => {
                      setCurrentChatPersona(creator.id);
                      setChatLog([
                        { role: 'assistant', creator: creator.id, text:
`Hey! I'm ${creator.name}. Paste any headline, press release, or housing
claim, and I'll analyze it using my custom focus! Let's get to the real
data. 🚀` }
                      ]);
                    }}
                    className={`p-3 rounded-2xl border text-left
transition-all relative ${
                      currentChatPersona === creator.id
                        ? `bg-slate-900 border-purple-500 ring-2
ring-purple-500/30 scale-[1.03]`
                        : 'bg-slate-900/40 border-slate-800/80
hover:bg-slate-900/80'
                    }`}>
                    <div className="flex items-center space-x-2">
                      <img
                        src={creator.avatar}
                        alt={creator.name}
                        className={`h-7 w-7 rounded-full object-cover
ring-2 ${creator.ringColor}`}
                      />
                      <div>
                        <span className="block text-xs font-bold
leading-none">{creator.name}</span>
                        <span className="text-[9px]
text-slate-400">{creator.handle}</span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Suggestions Buttons */}
            <div className="space-y-1.5">
              <span className="text-xs font-bold text-slate-400 uppercase
tracking-wider">De-clutter popular topics:</span>
              <div className="flex flex-wrap gap-2">
                {PROMPT_SUGGESTIONS.map((sug, i) => (
                  <button
                    key={i}
                    onClick={() => handleAISubmit(sug.text)}
                    className={`text-xs px-3 py-1.5 rounded-xl border
text-left font-medium transition-all ${
                      darkMode ? 'border-slate-800 bg-slate-900/60
hover:bg-slate-800 text-slate-300' : 'border-slate-200 bg-white
hover:bg-slate-50 text-slate-600'
                    }`}>
                    🏷️ {sug.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Chat Log panel */}
            <div className={`rounded-3xl border p-4 space-y-4 max-h-[450px]
overflow-y-auto ${darkMode ? 'bg-slate-900/30 border-slate-800' :
'bg-slate-100/50 border-slate-200'}`}>

              {chatLog.map((chat, idx) => {
                const isUser = chat.role === 'user';
                const creatorObj = CREATORS[chat.creator] || CREATORS.lola;

                return (
                  <div
                    key={idx}
                    className={`flex space-x-3 max-w-[85%] ${isUser ?
'ml-auto flex-row-reverse space-x-reverse' : ''}`}>

                    {/* Avatar */}
                    <div className="flex-shrink-0">
                      {isUser ? (
                        <div className="h-8 w-8 rounded-full bg-indigo-600
flex items-center justify-center text-white text-xs font-bold">
                          ME
                        </div>
                      ) : (
                        <img
                          src={creatorObj.avatar}
                          alt={creatorObj.name}
                          className="h-8 w-8 rounded-full object-cover
border border-purple-400"
                        />
                      )}
                    </div>

                    {/* Body Text Bubble */}
                    <div className={`p-3.5 rounded-2xl text-xs
leading-relaxed space-y-2 whitespace-pre-wrap ${
                      isUser
                        ? 'bg-purple-600 text-white rounded-tr-none'
                        : darkMode ? 'bg-slate-900 border border-slate-800
rounded-tl-none text-slate-200' : 'bg-white rounded-tl-none border
border-slate-200 text-slate-700 shadow-sm'
                    }`}>
                      {chat.text}
                    </div>

                  </div>
                );
              })}

              {isGenerating && (
                <div className="flex items-center space-x-2 text-xs
text-purple-400 animate-pulse">
                  <RotateCcw className="h-4 w-4 animate-spin" />
                  <span>{CREATORS[currentChatPersona].name} is analyzing
corporate PR tactics...</span>
                </div>
              )}

              {errorMessage && (
                <div className="flex items-center space-x-2 text-xs
text-red-400 bg-red-500/10 p-3 rounded-xl border border-red-500/20">
                  <AlertTriangle className="h-4.5 w-4.5" />
                  <span>{errorMessage}</span>
                </div>
              )}

            </div>

            {/* Input Form area */}
            <div className="flex space-x-2">
              <input
                type="text"
                placeholder={`Ask ${CREATORS[currentChatPersona].name}
about rent, tax loop claims, or corporate PR...`}
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleAISubmit();
                }}
                className={`flex-1 px-4 py-3 rounded-2xl outline-none
border transition-all ${
                  darkMode ? 'bg-slate-900 border-slate-800
focus:border-purple-500 focus:ring-1 focus:ring-purple-500' : 'bg-white
border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500'
                }`}
              />
              <button
                onClick={() => handleAISubmit()}
                disabled={isGenerating}
                className="p-3.5 bg-purple-600 text-white
hover:bg-purple-700 active:scale-95 transition-all rounded-2xl flex
items-center justify-center shadow-lg shadow-purple-900/20">
                <Send className="h-4.5 w-4.5" />
              </button>
            </div>

          </div>
        )}

        {/* TAB 4: VIBE SANDBOX (DIET TRACKER & SPOT-THE-BS QUIZ) */}
        {activeTab === 'sandbox' && (
          <div className="space-y-6">

            {/* Diet breakdown ring */}
            <div className="p-6 rounded-3xl bg-slate-900 border
border-slate-800 space-y-4">
              <div className="flex items-center space-x-2 text-indigo-400">
                <BarChart2 className="h-5 w-5" />
                <h3 className="font-bold">Your Comprehensive News Diet
Balance</h3>
              </div>
              <p className="text-xs text-slate-300">
                Young people suffer from heavy algorithmic outrage fatigue.
We track your read articles to make sure you balance high-alert deep dives
with positive environmental/scientific solutions.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                <div className="p-4 rounded-2xl bg-emerald-500/5 border
border-emerald-500/20 text-center">
                  <Sun className="h-6 w-6 mx-auto text-emerald-400 mb-1" />
                  <span className="block text-[10px] text-slate-400
uppercase font-bold">Good News Only</span>
                  <span className="text-2xl font-black
text-emerald-300">{newsDiet.goodNews} articles</span>
                  <p className="text-[10px] text-slate-400 mt-1">Direct
community actions & constructive updates.</p>
                </div>

                <div className="p-4 rounded-2xl bg-indigo-500/5 border
border-indigo-500/20 text-center">
                  <Info className="h-6 w-6 mx-auto text-indigo-400 mb-1" />
                  <span className="block text-[10px] text-slate-400
uppercase font-bold">Mind Expanding</span>
                  <span className="text-2xl font-black
text-indigo-300">{newsDiet.mindExpanding} articles</span>
                  <p className="text-[10px] text-slate-400 mt-1">Socratic
frameworks, history, and scientific papers.</p>
                </div>

                <div className="p-4 rounded-2xl bg-rose-500/5 border
border-rose-500/20 text-center">
                  <Flame className="h-6 w-6 mx-auto text-rose-400 mb-1" />
                  <span className="block text-[10px] text-slate-400
uppercase font-bold">WTF / Speculative</span>
                  <span className="text-2xl font-black
text-rose-300">{newsDiet.wtf} articles</span>
                  <p className="text-[10px] text-slate-400 mt-1">High-bias
alerts, automated rent collusion reports, etc.</p>
                </div>
              </div>

              {/* Reset button */}
              <div className="flex justify-end">
                <button
                  onClick={() => setNewsDiet({ goodNews: 1, mindExpanding:
1, wtf: 1 })}
                  className="text-xs font-bold text-slate-400
hover:text-white flex items-center space-x-1">
                  <RotateCcw className="h-3.5 w-3.5" />
                  <span>Reset Tracker</span>
                </button>
              </div>
            </div>

            {/* Spot-the-BS Interactive Game Zone */}
            <div className="p-6 rounded-3xl bg-gradient-to-tr
from-purple-900/30 to-slate-900 border border-purple-500/20 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2
text-purple-400">
                  <QuizIcon className="h-5 w-5 animate-pulse" />
                  <h3 className="font-bold">The Spot-the-BS Daily
Challenge</h3>
                </div>
                <span className="text-xs font-semibold bg-purple-500/10
text-purple-400 px-2.5 py-0.5 rounded-full">
                  Skill Test
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Tired of algorithms forcing fake news and dramatic
narratives onto your screen? Test your skills to spot corporate framing and
bad primary data with our daily scenario challenges!
              </p>

              {!quizCompleted ? (
                <div className="p-4 rounded-2xl bg-black/40 border
border-white/5 space-y-4">
                  <div className="space-y-1">
                    <span className="text-[10px] text-slate-400 font-bold
uppercase tracking-widest">
                      Scenario {quizIndex + 1} of {QUIZ_QUESTIONS.length}
                    </span>
                    <h4 className="text-sm font-bold text-white">
                      {QUIZ_QUESTIONS[quizIndex].question}
                    </h4>
                  </div>

                  <div className="space-y-2">
                    {QUIZ_QUESTIONS[quizIndex].options.map((opt, i) => {
                      const isSelected = quizAnswered === i;
                      const showCorrect = quizAnswered !== null &&
opt.isCorrect;
                      const showIncorrect = quizAnswered !== null &&
isSelected && !opt.isCorrect;

                      return (
                        <button
                          key={i}
                          disabled={quizAnswered !== null}
                          onClick={() => handleQuizAnswer(opt, i)}
                          className={`w-full p-3.5 text-xs text-left
rounded-xl border transition-all ${
                            showCorrect ? 'bg-emerald-500/20
border-emerald-500 text-emerald-200' :
                            showIncorrect ? 'bg-red-500/20 border-red-500
text-red-200' :
                            isSelected ? 'bg-purple-600/30
border-purple-500 text-white' :
                            'bg-slate-900/60 border-slate-800
hover:bg-slate-800 text-slate-300'
                          }`}>
                          <span>{opt.text}</span>
                        </button>
                      );
                    })}
                  </div>

                  {quizAnswered !== null && (
                    <div className="space-y-3 pt-2">
                      <div className="p-3 bg-purple-500/10 rounded-xl
border border-purple-500/15 text-xs text-purple-300">
                        <strong>Curator Tip:</strong>
{QUIZ_QUESTIONS[quizIndex].explanation}
                      </div>
                      <button
                        onClick={nextQuizQuestion}
                        className="w-full py-2 bg-purple-600 text-white
text-xs font-bold rounded-xl hover:bg-purple-700 transition-all">
                        {quizIndex < QUIZ_QUESTIONS.length - 1 ? "Next
Scenario" : "Finish Challenge"}
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-6 space-y-4 bg-emerald-500/5
rounded-2xl border border-emerald-500/20">
                  <CheckCircle className="h-12 w-12 mx-auto
text-emerald-400" />
                  <div>
                    <h4 className="text-lg font-bold text-white">Challenge
Completed!</h4>
                    <p className="text-xs text-slate-300 mt-0.5">Your
Score: {quizScore} / {QUIZ_QUESTIONS.length}</p>
                  </div>
                  <button
                    onClick={resetQuiz}
                    className="px-6 py-2 bg-emerald-600 text-white text-xs
font-bold rounded-xl hover:bg-emerald-700 transition-all">
                    Test Again
                  </button>
                </div>
              )}
            </div>

          </div>
        )}

      </main>

      {/* ==========================================
          MODAL: DEEP-DIVE NEWS EXPLORER
         ========================================== */}
      {selectedArticle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center
bg-black/85 backdrop-blur-sm p-4 overflow-y-auto">

          <div className={`w-full max-w-2xl rounded-3xl overflow-hidden
border shadow-2xl transition-all my-8 ${
            darkMode ? 'bg-slate-950 border-slate-800 text-slate-200' :
'bg-white border-slate-200 text-slate-800'
          }`}>

            <div className="flex items-center justify-between px-6 py-4
border-b dark:border-slate-800">
              <div className="flex items-center space-x-2 text-xs
text-slate-400">
                <span className="font-bold uppercase tracking-wider
text-purple-400">{selectedArticle.category}</span>
                <span>•</span>
                <span>Curated by {selectedArticle.creator.name}</span>
              </div>
              <button
                onClick={() => setSelectedArticle(null)}
                className="p-1.5 rounded-full hover:bg-slate-800
transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Main Content Area */}
            <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">

              {/* Creator Card */}
              <div className={`flex items-start space-x-3 p-4 rounded-2xl
${darkMode ? 'bg-slate-900/50' : 'bg-slate-50'}`}>
                <img
                  src={selectedArticle.creator.avatar}
                  alt={selectedArticle.creator.name}
                  className="h-10 w-10 rounded-full border border-pink-500
object-cover"
                />
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase
tracking-widest">Witty Curator Bio</h4>
                  <p className="text-sm font-semibold italic
mt-0.5">"{selectedArticle.creator.bio}"</p>
                </div>
              </div>

              {/* Title & Core Video Container */}
              <div className="space-y-3">
                <h2 className="text-2xl font-black tracking-tight
leading-tight">
                  {selectedArticle.title}
                </h2>
                <div className="relative aspect-video rounded-2xl
overflow-hidden bg-black border border-slate-800">
                  <video
                    src={selectedArticle.videoUrl}
                    className="w-full h-full object-cover"
                    controls
                    autoPlay
                    muted
                  />
                  <div className="absolute top-2 left-2 bg-black/60
backdrop-blur-md px-2.5 py-1 rounded-lg text-[10px] text-white flex
items-center space-x-1">
                    <Volume2 className="h-3 w-3" />
                    <span>Video Summary Playing</span>
                  </div>
                </div>
              </div>

              {/* Structured Context Engine */}
              <div className="space-y-5">

                <div className="space-y-1">
                  <span className="flex items-center space-x-1.5 text-xs
font-extrabold uppercase tracking-widest text-indigo-400">
                    <Info className="h-3.5 w-3.5" />
                    <span>Why This Matters</span>
                  </span>
                  <p className="text-sm leading-relaxed text-slate-300">
                    {selectedArticle.whyItMatters}
                  </p>
                </div>

                <div className="space-y-1">
                  <span className="flex items-center space-x-1.5 text-xs
font-extrabold uppercase tracking-widest text-purple-400">
                    <BookOpen className="h-3.5 w-3.5" />
                    <span>The Background Context</span>
                  </span>
                  <p className="text-sm leading-relaxed text-slate-300">
                    {selectedArticle.background}
                  </p>
                </div>

                <div className="space-y-1">
                  <span className="flex items-center space-x-1.5 text-xs
font-extrabold uppercase tracking-widest text-pink-400">
                    <Compass className="h-3.5 w-3.5" />
                    <span>What Happens Next</span>
                  </span>
                  <p className="text-sm leading-relaxed text-slate-300">
                    {selectedArticle.whatNext}
                  </p>
                </div>

                {/* What You Can Do About It */}
                <div className="p-4 rounded-2xl bg-emerald-500/10 border
border-emerald-500/20 space-y-2">
                  <span className="flex items-center space-x-1.5 text-xs
font-extrabold uppercase tracking-widest text-emerald-400">
                    <CheckCircle className="h-4 w-4" />
                    <span>Action Plan (Anti-Doom Vibe)</span>
                  </span>
                  <p className="text-xs text-slate-200 leading-relaxed">
                    {selectedArticle.actionPlan.text}
                  </p>
                  <a
                    href={selectedArticle.actionPlan.link}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center space-x-1 text-xs
font-bold text-emerald-400 hover:underline">
                    <span>Activism Portal / Guides</span>
                    <Link className="h-3 w-3" />
                  </a>
                </div>

              </div>

              {/* NON-TOXIC CREATOR TALKBACK (Alternative to Comment
Sections) */}
              <div className="p-4 rounded-2xl bg-slate-900 border
border-slate-800 space-y-3">
                <span className="flex items-center space-x-1.5 text-xs
font-bold uppercase tracking-widest text-purple-400">
                  <Users className="h-4 w-4" />
                  <span>Verified Creator Peer Reviews</span>
                </span>
                <p className="text-[11px] text-slate-400">
                  Instead of generic internet rage comments, here is what
our other independent creators have added:
                </p>

                <div className="space-y-2 pt-1">
                  {selectedArticle.talkbacks?.map((tb, idx) => (
                    <div key={idx} className="p-3 bg-black/40 rounded-xl
border border-white/5 space-y-1">
                      <span className="text-xs font-bold
text-indigo-300">@{tb.creator.toLowerCase()}_view</span>
                      <p className="text-xs text-slate-300
italic">"{tb.comment}"</p>
                    </div>
                  ))}
                </div>

                {/* Structured user interactive debate triggers */}
                <div className="pt-2 border-t border-slate-800">
                  <span className="block text-[10px] font-bold
text-slate-400 uppercase tracking-widest mb-2">Interactive AI Explainer
Tools:</span>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => triggerStructuredPrompt('eli5')}
                      className="flex-1 py-2 bg-slate-950
hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs font-bold
rounded-lg transition-all">
                      👶 Explain Like I'm 5
                    </button>
                    <button
                      onClick={() =>
triggerStructuredPrompt('devils_advocate')}
                      className="flex-1 py-2 bg-slate-950
hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs font-bold
rounded-lg transition-all">
                      ⚖️ Devil's Advocate
                    </button>
                  </div>

                  {/* AI response block inside modal */}
                  {activeStructuredPrompt && (
                    <div className="mt-3 p-3 bg-indigo-500/10 rounded-xl
border border-indigo-500/15">
                      <div className="flex items-center space-x-1.5
text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-1">
                        <Sparkles className="h-3 w-3" />
                        <span>{activeStructuredPrompt === 'eli5' ?
"Socratic Toddler Mode" : "System Debate Angle"}</span>
                      </div>
                      {isPromptLoading ? (
                        <div className="text-xs text-slate-400
animate-pulse">Running engine prompt...</div>
                      ) : (
                        <p className="text-xs text-slate-300
leading-relaxed italic">
                          "{promptResponse}"
                        </p>
                      )}
                    </div>
                  )}
                </div>

              </div>

              {/* RADICAL TRANSPARENCY: "SHOW YOUR WORKING" */}
              <div className={`rounded-2xl border transition-all ${
                showWorking ? 'border-purple-500 bg-purple-500/5' :
'border-slate-800 hover:border-slate-700'
              }`}>
                <button
                  onClick={() => setShowWorking(!showWorking)}
                  className="w-full flex items-center justify-between p-4
font-bold text-sm">
                  <div className="flex items-center space-x-2
text-purple-400">
                    <Shield className="h-4.5 w-4.5" />
                    <span>Show Your Working (Audit Trails)</span>
                  </div>
                  <span className="text-xs text-slate-400">{showWorking ?
"Hide" : "Show Sources"}</span>
                </button>

                {showWorking && (
                  <div className="p-4 pt-0 border-t border-slate-800
space-y-3.5 text-xs">

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="block text-[10px] text-slate-400
font-bold uppercase tracking-wider">Reliability Rating:</span>
                        <span className="font-bold text-emerald-400 flex
items-center mt-0.5">
                          <CheckCircle className="h-3.5 w-3.5 mr-1
text-emerald-400" />
                          {selectedArticle.working.reliability}
                        </span>
                      </div>
                      <div>
                        <span className="block text-[10px] text-slate-400
font-bold uppercase tracking-wider">Corporate Funding Bias:</span>
                        <span className="font-bold text-indigo-400 mt-0.5
block">{selectedArticle.working.bias}</span>
                      </div>
                    </div>

                    <div>
                      <span className="block text-[10px] text-slate-400
font-bold uppercase tracking-wider mb-1">Verified References:</span>
                      <div className="space-y-1">
                        {selectedArticle.working.sources.map((src, i) => (
                          <div key={i} className="flex items-center
justify-between py-1 border-b border-slate-800/55">
                            <span className="text-slate-300 font-medium">✔️
{src.name}</span>
                            <a
                              href={src.url}
                              target="_blank"
                              rel="noreferrer"
                              className="text-purple-400 hover:underline
inline-flex items-center space-x-1">
                              <span>Audit link</span>
                              <Link className="h-3 w-3" />
                            </a>
                          </div>
                        ))}
                      </div>
                    </div>

                  </div>
                )}
              </div>

            </div>

            {/* Bottom Actions of Modal */}
            <div className="px-6 py-4 border-t dark:border-slate-800 flex
justify-between items-center">
              <button
                onClick={() => toggleReaction(selectedArticle.id,
'support')}
                className={`flex items-center space-x-1 text-xs font-bold
px-3 py-1.5 rounded-xl transition-all ${
                  reactions[selectedArticle.id]?.support ? 'bg-pink-500/10
text-pink-500' : 'hover:bg-slate-800 text-slate-400'
                }`}>
                <Heart className="h-4.5 w-4.5 fill-current" />
                <span>Support Creator</span>
              </button>

              <button
                onClick={() => setSelectedArticle(null)}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700
text-white font-bold text-xs rounded-xl active:scale-95 transition-all
shadow-lg">
                Close Explorer
              </button>
            </div>

          </div>

        </div>
      )}

      {/* ==========================================
          MOBILE BOTTOM NAVIGATION TAB BAR
         ========================================== */}
      <footer className={`fixed bottom-0 inset-x-0 z-40 md:hidden border-t
backdrop-blur-md transition-all duration-300 ${darkMode ? 'bg-slate-950/95
border-slate-800' : 'bg-white/95 border-slate-200'}`}>
        <div className="flex justify-around items-center h-16">
          <button
            onClick={() => setActiveTab('feed')}
            className={`flex flex-col items-center space-y-1
transition-colors ${activeTab === 'feed' ? 'text-pink-500' :
'text-slate-400'}`}>
            <Compass className="h-5 w-5" />
            <span className="text-[10px] font-bold">Curated Feed</span>
          </button>

          <button
            onClick={() => setActiveTab('shorts')}
            className={`flex flex-col items-center space-y-1
transition-colors ${activeTab === 'shorts' ? 'text-pink-500' :
'text-slate-400'}`}>
            <Play className="h-5 w-5 fill-current" />
            <span className="text-[10px] font-bold">Shorts Feed</span>
          </button>

          <button
            onClick={() => setActiveTab('detector')}
            className={`flex flex-col items-center space-y-1
transition-colors ${activeTab === 'detector' ? 'text-pink-500' :
'text-slate-400'}`}>
            <Sparkles className="h-5 w-5" />
            <span className="text-[10px] font-bold">AI Detector</span>
          </button>

          <button
            onClick={() => setActiveTab('sandbox')}
            className={`flex flex-col items-center space-y-1
transition-colors ${activeTab === 'sandbox' ? 'text-pink-500' :
'text-slate-400'}`}>
            <Smile className="h-5 w-5" />
            <span className="text-[10px] font-bold">Vibe Check</span>
          </button>
        </div>
      </footer>

    </div>
  );
}

```
