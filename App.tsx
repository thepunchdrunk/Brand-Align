import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { UploadSection } from './components/UploadSection';
import { ScoreDashboard } from './components/ScoreDashboard';
import { ActivityHistory } from './components/ActivityHistory';
import { BrandRules } from './components/BrandRules';
import { KnowledgeBase } from './components/KnowledgeBase';
import { UserManagement } from './components/UserManagement';
import { AdminDashboard } from './components/AdminDashboard';
import { AppView, Purpose, Region, UploadState, AnalysisResult, BrandSettings, AssetType, UserRole } from './types';
import { analyzeContent } from './services/gemini';

export default function App() {
  const [userRole, setUserRole] = useState<UserRole>(UserRole.GENERAL_USER);
  const [currentView, setCurrentView] = useState<AppView>(AppView.UPLOAD);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  
  // Reset view when role changes
  useEffect(() => {
      if (userRole === UserRole.ADMIN) {
          setCurrentView(AppView.ANALYTICS);
      } else {
          setCurrentView(AppView.UPLOAD);
      }
  }, [userRole]);

  const [uploadState, setUploadState] = useState<UploadState>({
    file: null,
    textInput: '',
    purpose: Purpose.MARKETING,
    region: "Global",
    assetType: AssetType.DOCUMENT,
    additionalContext: ''
  });

  const [brandSettings, setBrandSettings] = useState<BrandSettings>({
      brandName: 'AERION',
      mission: `1. BRAND PHILOSOPHY
AERION is conceived as a clarity engine in a world saturated with noise. The brand’s purpose is not merely to look modern, but to systematically reduce cognitive friction wherever complex systems meet human decision-making. The philosophy below anchors all visual, verbal, and experiential choices.

1.1 Purpose and Role
AERION exists to transform complexity into clarity. Its role is to make technical systems, data, and processes understandable, so that individuals and organizations can act with confidence. This purpose must be evident in every artifact: from interface layout, to a technical whitepaper, to the way a support specialist explains a feature.

1.2 Brand as System, Not Decoration
AERION’s identity is treated as a functional system. Every element—logo, color, line, motion curve, or phrase—serves a defined task. Visuals do not decorate information; they structure it. Typography does not style copy; it organizes it into a navigable hierarchy. This systems-first mindset is mandatory for all designers, writers, and vendors working with the brand.

1.3 Behavioral Pillars
The brand is expressed behaviorally through five pillars: Precision, Calm, Honesty, Preparedness, and Empathy. Precision means we avoid ambiguity; Calm means we do not shout visually or verbally; Honesty means we do not exaggerate; Preparedness means we anticipate what the audience needs; Empathy means we design for varied abilities, contexts, and cultures.

1.5 Semiotic Consistency
Semiotics—the study of meaning in signs—guides the brand’s visual vocabulary. The 30-degree angle used in key elements consistently signals direction and progress. Blue and white signal trust and openness. Large areas of unoccupied space signal confidence and control. Once assigned, a visual meaning is preserved across channels; the same angle, color, or shape cannot be used to mean conflicting things in different media.`,
      
      audience: `1.4 COGNITIVE LOAD CONSIDERATIONS
AERION design teams are expected to use cognitive load theory as a practical lens. 

1. Extraneous Load: Must be minimized by removing ornamental content.
2. Intrinsic Load: Must be clarified by structuring complex concepts into progressive disclosure.
3. Germane Load: Must be supported with signposting, summaries, and patterns that make learning and comprehension easier over time.`,

      toneVoice: `2.1 VISUAL PERSONALITY
The visual personality is calm, structured, and quietly confident. Layouts breathe. Color is controlled. Typography is clear and unadorned. There are no decorative flourishes, and no trendy visual effects that would date the brand prematurely. Instead, the system is designed to age slowly, like industrial engineering diagrams or scientific journals.

2.3 VISUAL RESTRAINT AS STRATEGY
AERION deliberately adopts visual restraint as a strategic tool. While many brands compete on volume—more gradients, more shapes, more movement—AERION competes on clarity. This means most layouts will consciously use fewer elements than the designer might be tempted to add. The question ‘what can we remove?’ is as important as ‘what must we add?’

10. PHOTOGRAPHY & ILLUSTRATION
Imagery in the AERION system grounds abstract technology in real human and environmental contexts. It should feel honest and unforced.

10.1 Photography Style
Photos favor natural lighting, real working environments, and candid expressions. Overly staged or glossy stock imagery is avoided. Mild desaturation and consistent white balance optionally unify disparate images. People depicted should represent diverse ages, genders, and backgrounds.

10.2 Illustration Style
Illustrations use geometric shapes, 2px strokes, and the core palette. They explain systems, workflows, or concepts rather than serving as decoration. Depth is indicated via layering and overlap, not gradients or perspective tricks that might distract from meaning.

11. ENVIRONMENTAL & SPATIAL BRANDING
When AERION appears in physical space—offices, events, signage—the same clarity and restraint must guide the experience.

11.1 Signage and Wayfinding
Signage uses high-contrast color pairings and simple typography. Pictograms follow international standards where possible, with subtle AERION-specific adjustments for stroke and corner radius. Arrows and direction lines follow the 30-degree motif in key feature areas.

11.2 Office and Workplace
Branded environments emphasize neutral surfaces with calibrated injections of AERION Blue and Ion Cyan. Feature walls may carry large-scale trajectory lines or abstract diagrams. Information displays in lobbies or shared areas must use the standard UI and typography system, not one-off visual experiments.`,

      styleGuide: `2. VISUAL IDENTITY SYSTEM
The visual system of AERION is built to be rigorous, repeatable, and scalable across print, digital, environmental, and motion applications. It is intentionally minimal but not empty: every line and block exists to frame information with precision.

2.2 Core Elements
The system is built from a small set of primitives: the wordmark, a trajectory line at 30 degrees, an 8px-radius rectangle system, a 12-column grid, and a restrained palette of blues, white, and controlled accents. Combining these primitives in structured ways creates a wide variety of applications without sacrificing coherence.

2.4 Application Across Mediums
The same visual logic must work on a presentation slide, a control dashboard, a printed manual, a building lobby screen, or a diagnostic report. To achieve this, designers start from the grid and hierarchy rather than from images or effects. Once information structure is clear, color and imagery are layered on.

3. LOGO ENGINEERING & GEOMETRY
The AERION wordmark is a precision instrument. Its geometry is fixed, mathematically defined, and must never be altered by hand.

3.1 Construction Grid
The wordmark is built on a 10×10 proportional grid. Cap height occupies 8 units, with 0.5 units of overshoot for curved forms. Stroke width is set at 1 unit and remains consistent across all letterforms. Inter-letter spacing is defined as 1.2× the stroke width.

3.2 Letterform Notes
The apex of the ‘A’ is cut at precisely 30 degrees, establishing the brand’s directional motif. The ‘O’ is a perfect geometric circle, reinforcing precision. The leg of the ‘R’ mirrors the ‘A’ angle, creating rhythm.

3.3 Exclusion Zone Rules
The exclusion zone around the logo is equal to 0.75 of the logo’s total height on all sides. No typography, image texture, or UI component may enter this zone.

3.4 Minimum Size and Legibility
In print, the logo may not be reproduced below 20mm in width. On screen, the minimum width is 120px.

4. COLOR ARCHITECTURE
Color in the AERION system is treated as data, not decoration.

4.1 Primary Palette Definition
The primary palette consists of AERION Blue (#003C86), Midnight Navy (#0D1117), and Atmos White (#FFFFFF).

4.2 Accent Palette and Constraints
The accent palette includes Ion Cyan (#00D1FF), Vector Green (#00C48C), Solar Orange (#FF6B35), and Lumin Yellow (#F3C703). No accent color may exceed approximately 10% of any given layout’s surface area.

4.3 Neutrals and Backgrounds
A structured neutral scale (Neutral 900 to Neutral 100) supports the primary and accent colors.

5. TYPOGRAPHY SYSTEM
Typography is the backbone of AERION’s communication.

5.1 Typefaces Selected
Primary: Neue Haas Grotesk Display Pro. Secondary: Inter.

5.2 Hierarchy Levels
The system defines clear text levels: Hero (L1), Headline (L2), Subhead (L3), Body, Caption, and Meta.

5.3 Alignment, Rhythm, and Grids
All running text is left-aligned for maximum readability. Center alignment is reserved for rare ceremonial uses.

5.4 Numerals and Data
For numerical content in tables and dashboards, tabular numerals are preferred to ensure alignment.

6. ICONOGRAPHY
Icons in the AERION system are functional micro-diagrams that guide users and label actions.

6.1 Grid and Stroke Rules
Icons are constructed on a 24×24 pixel grid with a 2px stroke. Corners use a 2px radius where appropriate.

6.2 Semantic Discipline
Ambiguous pictograms are forbidden; if an icon might be interpreted in more than one way, it must be redesigned or removed.

7. GRID & SPATIAL MATHEMATICS
7.1 Digital Grids
The primary digital grid is 12 columns with 24px gutters.
7.2 Print Grids
For A4 and US Letter formats, an 8-column grid is recommended.
7.3 Spacing Scale
The spacing system follows an 8-based modular scale: 4, 8, 16, 24, 32, 48, 64, 96.

8. MOTION ARCHITECTURE
Motion is used to guide attention, indicate state changes, and reinforce hierarchy.

8.1 Easing and Timing
The primary easing function is cubic-bezier(0.22, 0.61, 0.36, 1). UI transitions generally occur within 150–250ms.
8.2 Direction and Geometry
Movement favors 0°, 30°, and 90° directions to mirror the static visual system.

9. UX/UI SYSTEM
9.1 Buttons and Controls
Primary buttons use AERION Blue backgrounds with white text, 6px corner radius.
9.2 Forms and Inputs
Form fields span the full width of their container where possible, with 1px Neutral 300 borders.

12. TEMPLATES & COMMUNICATIONS SYSTEM
12.1 Document Templates
Standardized templates exist for letters, reports, proposals, and internal memos.
12.2 Presentation Templates
Slide decks use a consistent title placement, grid, and color usage.`,

      bannedTerms: `3.5 MISUSE EXAMPLES
Misuses include: stretching or condensing the logo, changing its color outside the approved palette, placing it on low-contrast backgrounds, adding shadows or outlines, using gradient fills in static applications, rotating it, or using it as a pattern or texture.

13. GOVERNANCE & LEGAL FRAMEWORK
AERION’s brand is a strategic asset. Governance ensures that it remains coherent, protected, and valuable across markets and years.

13.1 Brand Office
A central Brand Office oversees all major identity applications, approves exceptions, and maintains the asset library. Regional teams must consult the Brand Office when creating new product lines, sub-brands, or major campaigns.

13.2 Trademark and Legal Use
The AERION name and wordmark must always be reproduced from official files. Appropriate ™ or ® symbols must be used depending on jurisdiction. Partners may not create derivative logos or lockups without explicit written approval.

14. ASSET LIBRARY & VERSION CONTROL
14.1 Asset Distribution
Official assets—logos, templates, icon sets, motion primitives, UI kits—are distributed from a central portal.
14.2 Versioning Policy
Brand system updates follow a semantic versioning pattern (Major.Minor.Patch). Teams must always check they are using the latest approved version before launching new materials.`,
      inclusiveLanguage: true
  });

  const handleAnalyze = async () => {
    // Determine content to analyze
    let contentToAnalyze = uploadState.textInput;
    
    // Allow empty text if file is present (PDF, Image, etc)
    if (!contentToAnalyze && !uploadState.fileBase64) {
         // If file is selected but no base64 (e.g. unsupported docx that wasn't converted), return
         if (uploadState.file) {
             alert("Please convert this file to PDF or paste the text content to proceed.");
             return;
         }
         return;
    }

    setIsAnalyzing(true);
    try {
        const result = await analyzeContent(
            contentToAnalyze, 
            uploadState.purpose, 
            uploadState.region, 
            uploadState.assetType,
            brandSettings,
            uploadState.fileBase64,
            uploadState.mimeType,
            uploadState.additionalContext
        );
        setAnalysisResult(result);
        setCurrentView(AppView.RESULTS);
    } catch (error) {
        console.error("Analysis failed", error);
        alert("Analysis failed. Please check your API Key and try again.");
    } finally {
        setIsAnalyzing(false);
    }
  };

  const handleReset = () => {
    setAnalysisResult(null);
    setUploadState({
        file: null,
        textInput: '',
        purpose: Purpose.MARKETING,
        region: "Global",
        assetType: AssetType.DOCUMENT,
        additionalContext: ''
    });
    setCurrentView(AppView.UPLOAD);
  };

  return (
    <Layout 
        currentView={currentView} 
        setView={setCurrentView}
        userRole={userRole}
        setUserRole={setUserRole}
    >
      {/* GENERAL USER VIEWS */}
      {userRole === UserRole.GENERAL_USER && currentView === AppView.UPLOAD && (
        <UploadSection 
            uploadState={uploadState} 
            setUploadState={setUploadState}
            onAnalyze={handleAnalyze}
            isAnalyzing={isAnalyzing}
        />
      )}
      
      {userRole === UserRole.GENERAL_USER && currentView === AppView.RESULTS && analysisResult && (
        <ScoreDashboard 
            result={analysisResult} 
            onReset={handleReset}
            originalText={uploadState.textInput || `(Content from file: ${uploadState.file?.name})`}
            assetType={uploadState.assetType}
        />
      )}

      {currentView === AppView.HISTORY && (
          <ActivityHistory />
      )}

      {currentView === AppView.KNOWLEDGE_BASE && (
          <KnowledgeBase />
      )}

      {/* ADMIN VIEWS */}
      {userRole === UserRole.ADMIN && currentView === AppView.ANALYTICS && (
          <AdminDashboard />
      )}

      {userRole === UserRole.ADMIN && currentView === AppView.BRAND_GUIDELINES && (
          <BrandRules settings={brandSettings} onSave={setBrandSettings} />
      )}

      {userRole === UserRole.ADMIN && currentView === AppView.USER_MANAGEMENT && (
          <UserManagement />
      )}
    </Layout>
  );
}