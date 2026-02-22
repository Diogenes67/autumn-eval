"use client";

import { useState, useCallback, useMemo } from "react";
import CASE_DOCUMENTS from "../data/documents";
import CASE_LETTERS from "../data/letters";
import HARBOUR_BG from "../data/harbour-bg";


const DOMAINS = [
  { id: "upToDate", name: "Up-to-Date", type: "pdqi9", anchor: "The note is current.",
    definition: "The letter reflects the most current assessment findings and recommendations at the time of writing.",
    descriptors: {
      1: "Contains outdated findings; does not reflect final diagnostic conclusions",
      2: "Mostly current but includes some outdated information",
      3: "Reflects current findings; minor temporal gaps",
      4: "Current and well-aligned with latest assessment data",
      5: "Fully current; clearly anchored with explicit dates"
    }},
  { id: "accurate", name: "Accurate", type: "pdqi9", anchor: "The note is true.",
    definition: "The letter correctly represents findings, diagnoses, and clinical observations without errors.",
    descriptors: {
      1: "Multiple factual errors; diagnosis misrepresented",
      2: "Core diagnosis correct but secondary details contain inaccuracies",
      3: "Mostly accurate; minor imprecisions that wouldn't mislead management",
      4: "Accurate representation of all key findings",
      5: "Flawless accuracy with appropriate clinical nuance"
    }},
  { id: "thorough", name: "Thorough", type: "pdqi9", anchor: "The note is complete.",
    definition: "All information a GP needs: diagnosis, functional profile, comorbidities, medications, referrals, follow-up.",
    descriptors: {
      1: "Major gaps — missing diagnosis, comorbidities, or management plan",
      2: "Key info present but missing important secondary details",
      3: "Adequate coverage; some useful detail missing but GP could act",
      4: "Comprehensive; all major clinical domains covered",
      5: "Exemplary completeness; nothing to look up separately"
    }},
  { id: "useful", name: "Useful", type: "pdqi9", anchor: "The note is helpful.",
    definition: "The letter provides clinically relevant information that helps the GP manage this patient.",
    descriptors: {
      1: "Not useful; GP would need to request a new letter",
      2: "Limited utility; serves as starting point only",
      3: "Adequate; GP could manage with this plus own judgement",
      4: "Very useful; GP could confidently manage based on this",
      5: "Exceptional; enhances GP understanding beyond standard"
    }},
  { id: "organised", name: "Organised", type: "pdqi9", anchor: "The note is well-formed.",
    definition: "Logical structure that allows the GP to quickly find key information.",
    descriptors: {
      1: "Disorganised; key information buried or scattered",
      2: "Some structure but important sections hard to find",
      3: "Reasonable structure; could be easier to scan",
      4: "Well-structured with clear headings; easy to locate info",
      5: "Exemplary; optimised for busy GP workflow"
    }},
  { id: "comprehensible", name: "Comprehensible", type: "pdqi9", anchor: "The note can be understood.",
    definition: "Language is clear and appropriate for a GP — professional without excessive specialist jargon.",
    descriptors: {
      1: "Confusing; excessive jargon; hard to interpret",
      2: "Understandable but some passages unclear or overly technical",
      3: "Clear language; occasional specialist terms understood in context",
      4: "Consistently clear with brief explanations where needed",
      5: "Exceptionally clear; model of interprofessional communication"
    }},
  { id: "succinct", name: "Succinct", type: "pdqi9", anchor: "The note is brief.",
    definition: "Only relevant information; no unnecessary repetition or excessive detail.",
    descriptors: {
      1: "Extremely verbose; large sections irrelevant to GP needs",
      2: "Noticeably wordy; could be significantly shortened",
      3: "Reasonable length; minor redundancies",
      4: "Well-edited; high information density with minimal filler",
      5: "Optimally concise; every sentence earns its place"
    }},
  { id: "synthesised", name: "Synthesised", type: "pdqi9", anchor: "The note is more than a list of findings.",
    definition: "Integrates findings from multiple sources into a coherent narrative rather than listing raw data.",
    descriptors: {
      1: "Raw data dump; findings listed without interpretation",
      2: "Some synthesis but largely a list of results",
      3: "Reasonable integration; narrative could be more cohesive",
      4: "Well-synthesised; coherent clinical picture",
      5: "Masterful synthesis; complex data distilled into clear narrative"
    }},
  { id: "consistent", name: "Consistent", type: "pdqi9", anchor: "The note is not internally contradictory.",
    definition: "No contradictions between sections; overall impression aligns with diagnosis and recommendations.",
    descriptors: {
      1: "Clear contradictions between sections",
      2: "Minor inconsistencies creating ambiguity",
      3: "Generally consistent; occasional minor discrepancies",
      4: "Internally consistent throughout",
      5: "Perfectly consistent; every element reinforces the picture"
    }},
  { id: "actionability", name: "Actionability", type: "extension", anchor: "The GP knows exactly what to do next.",
    definition: "Clear, specific next steps: what to monitor, prescribe, refer, and when to review.",
    descriptors: {
      1: "No actionable recommendations",
      2: "Vague recommendations (e.g. 'consider referral' without specifying)",
      3: "Adequate action items; could benefit from more specificity",
      4: "Clear and specific; GP knows what to do and when to review",
      5: "Outstanding; prioritised with timelines and contingency plans"
    }},
  { id: "asdUtility", name: "ASD-Specific Utility", type: "extension", anchor: "The letter covers what makes ASD management unique.",
    definition: "Addresses ASD-specific info: sensory profile, communication style, co-occurring conditions, NDIS/funding, family context.",
    descriptors: {
      1: "No ASD-specific content beyond the diagnostic label",
      2: "Mentions ASD areas superficially; insufficient detail",
      3: "Covers key ASD domains with adequate detail",
      4: "Comprehensive ASD-specific content; clear autistic profile",
      5: "Exceptional; integrates ASD detail with practical GP guidance including funding"
    }},
];

const CHILDREN = [
  "Tom",
  "George",
  "Lindsey",
  "Ethan",
  "Jessica",
  "Brandon",
  "Noah",
  "Claude",
  "Elliot",
  "Robert",
];

const ACCEPTABILITY_OPTIONS = [
  { value: "yes", label: "Yes", color: "text-emerald-700 bg-emerald-50 border-emerald-300" },
  { value: "modifications", label: "Yes, with modifications", color: "text-amber-700 bg-amber-50 border-amber-300" },
  { value: "no", label: "No", color: "text-red-700 bg-red-50 border-red-300" },
];

const COMPARISON_OPTIONS = [
  { value: 1, label: "Much worse", color: "text-red-700 bg-red-50 border-red-300" },
  { value: 2, label: "Somewhat worse", color: "text-orange-700 bg-orange-50 border-orange-300" },
  { value: 3, label: "About the same", color: "text-gray-700 bg-gray-50 border-gray-300" },
  { value: 4, label: "Somewhat better", color: "text-blue-700 bg-blue-50 border-blue-300" },
  { value: 5, label: "Much better", color: "text-emerald-700 bg-emerald-50 border-emerald-300" },
];

function DocumentViewer({ child }) {
  const [activeTab, setActiveTab] = useState("letter");
  const docs = CASE_DOCUMENTS[child] || [];
  const letter = CASE_LETTERS[child] || "No letter available.";

  const tabs = [
    { id: "letter", label: "Letter for GP" },
    ...docs.map((d, i) => ({ id: `doc-${i}`, label: d.title })),
  ];

  const activeContent = activeTab === "letter"
    ? letter
    : docs[parseInt(activeTab.split("-")[1])]?.text || "";

  return (
    <div className="mb-4 border border-gray-200 rounded-lg bg-white overflow-hidden">
      <div className="bg-gray-50 border-b border-gray-200 px-4 py-2">
        <h3 className="font-semibold text-gray-900 text-sm">Case Documents</h3>
      </div>
      <div className="flex flex-wrap gap-1 px-3 py-2 bg-gray-50 border-b border-gray-100">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              activeTab === tab.id
                ? tab.id === "letter"
                  ? "bg-orange-700 text-white shadow-sm"
                  : "bg-amber-600 text-white shadow-sm"
                : "bg-white text-gray-600 border border-gray-300 hover:bg-gray-50"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="p-4 max-h-96 overflow-y-auto">
        <pre className="whitespace-pre-wrap text-sm text-gray-800 font-sans leading-relaxed">{activeContent}</pre>
      </div>
    </div>
  );
}

function ScoreButton({ value, selected, onClick, descriptor }) {
  const colors = selected
    ? "bg-amber-700 text-white shadow-md ring-2 ring-amber-400"
    : "bg-white text-gray-700 hover:bg-amber-50 border border-gray-300 hover:border-amber-400";
  return (
    <button onClick={() => onClick(value)} className={`relative group w-10 h-10 rounded-full font-semibold text-sm transition-all ${colors}`}>
      {value}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 p-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-lg">
        {descriptor}
      </div>
    </button>
  );
}

function DomainRow({ domain, score, onChange }) {
  const isExt = domain.type === "extension";
  return (
    <div className={`p-4 rounded-lg border ${isExt ? "border-orange-200 bg-orange-50/50" : "border-gray-200 bg-white"}`}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-gray-900 text-sm">{domain.name}</h3>
            {isExt && <span className="text-xs px-1.5 py-0.5 rounded bg-orange-100 text-orange-700 font-medium">Extension</span>}
            <span className="text-xs text-gray-400 italic hidden sm:inline">"{domain.anchor}"</span>
          </div>
          <p className="text-xs text-gray-500 leading-relaxed">{domain.definition}</p>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="text-xs text-gray-400 mr-1 hidden sm:inline">Not at all</span>
          {[1, 2, 3, 4, 5].map(v => (
            <ScoreButton key={v} value={v} selected={score === v} onClick={onChange} descriptor={domain.descriptors[v]} />
          ))}
          <span className="text-xs text-gray-400 ml-1 hidden sm:inline">Extremely</span>
        </div>
      </div>
    </div>
  );
}

function ProgressBar({ ratings, currentCase }) {
  const total = CHILDREN.length;
  const completed = CHILDREN.filter((_, i) => {
    const r = ratings[i];
    if (!r) return false;
    return DOMAINS.every(d => r.scores[d.id] != null) && r.acceptability != null && r.comparison != null;
  }).length;
  return (
    <div className="mb-2">
      <div className="flex justify-between text-xs text-gray-500 mb-1">
        <span>{completed} of {total} cases completed</span>
        <span>{Math.round(completed / total * 100)}%</span>
      </div>
      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
        <div className="h-full bg-amber-600 rounded-full transition-all duration-500" style={{ width: `${completed / total * 100}%` }} />
      </div>
    </div>
  );
}

function CaseNav({ currentCase, setCurrentCase, ratings }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {CHILDREN.map((child, i) => {
        const r = ratings[i];
        const allScored = r && DOMAINS.every(d => r.scores[d.id] != null) && r.acceptability != null && r.comparison != null;
        const partial = r && (Object.values(r.scores).some(v => v != null) || r.acceptability != null);
        const isCurrent = i === currentCase;
        let cls = "px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ";
        if (isCurrent) cls += "bg-amber-700 text-white border-amber-700 shadow-md";
        else if (allScored) cls += "bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100";
        else if (partial) cls += "bg-amber-50 text-amber-700 border-amber-300 hover:bg-amber-100";
        else cls += "bg-white text-gray-600 border-gray-300 hover:bg-gray-50";
        return <button key={i} onClick={() => setCurrentCase(i)} className={cls}>{child}</button>;
      })}
    </div>
  );
}

function ExportPanel({ ratings, raterName }) {
  const allComplete = CHILDREN.every((_, i) => {
    const r = ratings[i];
    return r && DOMAINS.every(d => r.scores[d.id] != null) && r.acceptability != null && r.comparison != null;
  });

  const exportData = () => {
    const headers = ["Case", ...DOMAINS.map(d => d.name), "PDQI-9 Total", "Extension Total", "Combined Total", "Acceptability", "Comparison to Hospital", "Missing Info", "Unnecessary Info", "Clinical Concerns"];
    const rows = CHILDREN.map((child, i) => {
      const r = ratings[i] || { scores: {}, acceptability: "", comparison: null, missing: "", unnecessary: "", concerns: "" };
      const pdqi9 = DOMAINS.filter(d => d.type === "pdqi9").reduce((s, d) => s + (r.scores[d.id] || 0), 0);
      const ext = DOMAINS.filter(d => d.type === "extension").reduce((s, d) => s + (r.scores[d.id] || 0), 0);
      return [child, ...DOMAINS.map(d => r.scores[d.id] || ""), pdqi9, ext, pdqi9 + ext, r.acceptability || "", r.comparison || "", `"${(r.missing || "").replace(/"/g, '""')}"`, `"${(r.unnecessary || "").replace(/"/g, '""')}"`, `"${(r.concerns || "").replace(/"/g, '""')}"`];
    });
    const csv = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `AutumnAI_Ratings_${(raterName || "GP").replace(/\s+/g, "_")}_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="mt-6 p-4 rounded-lg border border-gray-200 bg-gray-50">
      <h3 className="font-semibold text-gray-900 mb-2">Export Ratings</h3>
      {!allComplete && <p className="text-xs text-amber-600 mb-3">Some cases are incomplete. You can still export partial data.</p>}
      <button onClick={exportData} className="px-5 py-2.5 bg-amber-700 text-white rounded-lg text-sm font-medium hover:bg-amber-800 transition-colors shadow-sm">
        Download Ratings
      </button>
    </div>
  );
}

export default function App() {
  const [raterName, setRaterName] = useState("");
  const [currentCase, setCurrentCase] = useState(0);
  const [ratings, setRatings] = useState(() => CHILDREN.map(() => ({ scores: {}, acceptability: null, comparison: null, missing: "", unnecessary: "", concerns: "" })));
  const [showRubric, setShowRubric] = useState(true);

  const current = ratings[currentCase];

  const updateScore = useCallback((domainId, value) => {
    setRatings(prev => {
      const next = [...prev];
      next[currentCase] = { ...next[currentCase], scores: { ...next[currentCase].scores, [domainId]: value } };
      return next;
    });
  }, [currentCase]);

  const updateField = useCallback((field, value) => {
    setRatings(prev => {
      const next = [...prev];
      next[currentCase] = { ...next[currentCase], [field]: value };
      return next;
    });
  }, [currentCase]);

  const pdqi9Score = useMemo(() => {
    const scored = DOMAINS.filter(d => d.type === "pdqi9" && current.scores[d.id] != null);
    if (scored.length === 0) return null;
    return scored.reduce((s, d) => s + current.scores[d.id], 0);
  }, [current]);

  const caseComplete = DOMAINS.every(d => current.scores[d.id] != null) && current.acceptability != null;

  return (
    <div className="min-h-screen bg-orange-50" style={{backgroundImage: `url(${HARBOUR_BG})`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundAttachment: 'fixed'}}>
      <div className="max-w-4xl mx-auto px-4 py-6" style={{backgroundColor: 'rgba(255,249,235,0.85)', minHeight: '100vh'}}>
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-8 h-8 rounded-lg bg-amber-700 flex items-center justify-center">
              <span className="text-white font-bold text-sm">A</span>
            </div>
            <h1 className="text-xl font-bold text-gray-900">AutumnAI Letter for GP Evaluation</h1>
          </div>
          <p className="text-sm text-amber-700 ml-11">Modified PDQI-9 Rating Instrument</p>
        </div>

        {/* Rater name */}
        <div className="mb-4 flex items-center gap-3">
          <label className="text-sm font-medium text-gray-700">Rater:</label>
          <input
            type="text" value={raterName} onChange={e => setRaterName(e.target.value)}
            placeholder="Enter your name"
            className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none w-64"
          />
        </div>

        {/* Rubric panel */}
        <div className="mb-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <h3 className="font-semibold text-amber-900 text-sm mb-2">PDQI-9 Scale</h3>
          <p className="text-xs text-amber-800 mb-2">Rate each item from <strong>1 (Not at all)</strong> to <strong>5 (Extremely)</strong>. Hover over each score button for the anchored descriptor.</p>
          <p className="text-xs text-amber-700">Items 1–9 are the core PDQI-9 (Stetson et al. 2012). Items 10–11 (orange) are study-specific extensions for ASD correspondence.</p>
        </div>

        <ProgressBar ratings={ratings} currentCase={currentCase} />
        <CaseNav currentCase={currentCase} setCurrentCase={setCurrentCase} ratings={ratings} />

        <DocumentViewer child={CHILDREN[currentCase]} />

        {/* Current case */}
        <div className="mt-4 mb-2 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900">{CHILDREN[currentCase]}</h2>
          <div className="flex items-center gap-3">
            {pdqi9Score != null && (
              <span className="text-xs text-gray-500">PDQI-9: <strong className="text-amber-700">{pdqi9Score}/45</strong></span>
            )}
            {caseComplete && <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-medium">Complete</span>}
          </div>
        </div>

        {/* Domain ratings */}
        <div className="space-y-2">
          {DOMAINS.map(domain => (
            <DomainRow
              key={domain.id}
              domain={domain}
              score={current.scores[domain.id]}
              onChange={val => updateScore(domain.id, val)}
            />
          ))}
        </div>

        {/* Acceptability */}
        <div className="mt-4 p-4 rounded-lg border border-gray-200 bg-white">
          <h3 className="font-semibold text-gray-900 text-sm mb-2">Would you be satisfied receiving this letter about a patient?</h3>
          <div className="flex gap-2">
            {ACCEPTABILITY_OPTIONS.map(opt => (
              <button
                key={opt.value}
                onClick={() => updateField("acceptability", opt.value)}
                className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all ${
                  current.acceptability === opt.value
                    ? opt.color + " ring-2 ring-offset-1 shadow-sm"
                    : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Comparison to usual hospital letters */}
        <div className="mt-4 p-4 rounded-lg border border-orange-200 bg-orange-50/50">
          <h3 className="font-semibold text-gray-900 text-sm mb-1">How does this letter compare to what you typically receive from hospital-based ASD assessments?</h3>
          <p className="text-xs text-gray-500 mb-3">Think about the ASD assessment letters you usually receive from hospital or public health services.</p>
          <div className="flex flex-wrap gap-2">
            {COMPARISON_OPTIONS.map(opt => (
              <button
                key={opt.value}
                onClick={() => updateField("comparison", opt.value)}
                className={`px-3 py-2 rounded-lg text-sm font-medium border transition-all ${
                  current.comparison === opt.value
                    ? opt.color + " ring-2 ring-offset-1 shadow-sm"
                    : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"
                }`}
              >
                {opt.value}. {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Free text */}
        <div className="mt-4 grid grid-cols-1 gap-3">
          {[
            { field: "missing", label: "What information is missing?", placeholder: "Describe any gaps..." },
            { field: "unnecessary", label: "What information is unnecessary?", placeholder: "Describe any redundant or irrelevant content..." },
            { field: "concerns", label: "Any clinical concerns or safety issues?", placeholder: "Note any clinical accuracy or safety concerns..." },
          ].map(({ field, label, placeholder }) => (
            <div key={field} className="p-3 rounded-lg border border-gray-200 bg-white">
              <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
              <textarea
                value={current[field] || ""}
                onChange={e => updateField(field, e.target.value)}
                placeholder={placeholder}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none resize-y"
              />
            </div>
          ))}
        </div>

        {/* Navigation */}
        <div className="mt-4 flex justify-between">
          <button
            onClick={() => setCurrentCase(Math.max(0, currentCase - 1))}
            disabled={currentCase === 0}
            className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Previous Case
          </button>
          <button
            onClick={() => setCurrentCase(Math.min(CHILDREN.length - 1, currentCase + 1))}
            disabled={currentCase === CHILDREN.length - 1}
            className="px-4 py-2 bg-amber-700 text-white rounded-lg text-sm font-medium hover:bg-amber-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-sm"
          >
            Next Case
          </button>
        </div>

        <ExportPanel ratings={ratings} raterName={raterName} />

        {/* Footer */}
        <div className="mt-6 text-center text-xs text-gray-400">
          AutumnAI Letter for GP Evaluation Tool — Modified PDQI-9 (Stetson et al. 2012) with ASD-specific extensions
        </div>
      </div>
    </div>
  );
}
