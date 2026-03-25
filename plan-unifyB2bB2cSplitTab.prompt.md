# Plan: Restructure GUI — Unify B2B/B2C & Split Tab.tsx

## Context
- B2B.tsx and B2C.tsx: ~1700 lines each, near-identical — only differ by use_case filter ('b2b'/'b2c'), products table name, and one template key. B2C also has extra dedup/sort in sendTocontentful().
- Tab.tsx: ~1778 lines, monolithic component with ~15 functions + large JSX.
- No dedicated hooks/ or types/ directories currently.
- State in Tab.tsx is managed via direct mutation of `tabs` prop (established pattern throughout).

## Target Structure
```
src/
  types/
    tab.types.ts       ← shared Tab, innerTab, innerOutput, Segment, etc. interfaces
  hooks/
    useEditingLogic.ts
    useRefineLogic.ts
    useTextSelection.ts
    useFeedbackRating.ts
  pages/
    workspace/
      Workspace.tsx    ← unified B2B+B2C, parameterized by useCase prop
      Workspace.css    ← merged CSS (if any page-specific CSS exists)
    B2B.tsx            ← thin wrapper: <Workspace useCase="b2b" />
    B2C.tsx            ← thin wrapper: <Workspace useCase="b2c" />
  components/
    tab/
      Tab.tsx          ← orchestrator ~500 lines, delegates to hooks + sub-components
      TabCard.tsx      ← EditingArea sub-component
      RefineBox.tsx    ← Refine textarea sub-component
      RatingStars.tsx  ← Star rating sub-component
      Tab.css
```

## Phase 1: Shared Types
1. Create src/types/tab.types.ts — move Tab, innerTab, innerOutput, Segment, Purposes, Products, Formats, UserAddModel, FeedbackBox interfaces here (currently duplicated in both B2B/B2C and Tab.tsx)

## Phase 2: Unify B2B/B2C → Workspace.tsx
2. Create src/pages/workspace/Workspace.tsx
   - Add prop: `useCase: 'b2b' | 'b2c'`
   - Replace all hardcoded 'b2b'/'b2c' strings, filter params, table names with `useCase`
   - Replace `template.B2B`/`template.B2C` with `template[useCase.toUpperCase()]`
   - Extract B2C-specific dedup/sort in sendTocontentful() behind `if (useCase === 'b2c')` guard
   - Import types from src/types/tab.types.ts
3. Replace B2B.tsx with thin wrapper: `export const B2B = () => <Workspace useCase="b2b" />`
4. Replace B2C.tsx with thin wrapper: `export const B2C = () => <Workspace useCase="b2c" />`
   - Routes in App.tsx remain unchanged (still /b2b → <B2B />, /b2c → <B2C />)

## Phase 3: Extract Hooks from Tab.tsx
5. Create src/hooks/useEditingLogic.ts
   - State: editVisibility, editorChangedText, isSaveChanges, inputVisibility
   - Functions: handleEditAnswer, saveAnswerChange, discardAnswerChange (API call to /chat/save or /chat/discard)
6. Create src/hooks/useRefineLogic.ts
   - State: isRefineBox, isRefineText, isRefineType, isRefineDetails, activeRefineOutput
   - Functions: selectCopyCopyVersionId, refineSelectedText, submitRefineQuestion
7. Create src/hooks/useTextSelection.ts
   - State: selectedText, clickedText, charMaps, highlightStartIndex
   - Functions: getExactIndexAndText, handleMouseUp, handleMouseClick, getSelectCaretPosition
8. Create src/hooks/useFeedbackRating.ts
   - State: hoveredRating, isModalOpen, selectedItem (FeedbackBox)
   - Functions: openFeedbackAlert, getFeedbackData, handleFeedbackSave

## Phase 4: Extract Sub-Components from Tab.tsx
9. Create src/components/tab/TabCard.tsx
   - Props: tabIndex, itemIndex, outputIndex, outputItem, isEditing, onEdit, onSave, onRefine, selectedText, ...editing hook returns
   - Contains: MDXEditor/ReactMarkdown switch, save/discard buttons, text selection handlers
10. Create src/components/tab/RefineBox.tsx
    - Props: isOpen, refineType, refineText, onSubmit, onClose
    - Contains: refine textarea + submit button + instructions
11. Create src/components/tab/RatingStars.tsx
    - Props: copyVersionId, currentRating, onRate, onFeedback
    - Contains: star icons, hover state, feedback modal trigger

## Phase 5: Slim Down Tab.tsx
12. Update Tab.tsx to import and use all 4 hooks + 3 sub-components
    - Main component becomes ~400-500 lines focused on: tab switching (changeTab), data orchestration, JSX skeleton
    - Remove all extracted state + function bodies — replace with hook destructuring

## Verification
1. After Phase 2: App still navigates to /b2b and /b2c, both load correct data (different filters confirmed in network tab)
2. After Phase 3+4: All editing, refine, rating, text-selection flows still work end-to-end
3. Run existing Cypress e2e tests: `cd cirrus-genai-optimus-gui-docker && npx cypress run`
4. Run vitest unit tests: `npx vitest run`
5. TSC type check: `npx tsc --noEmit`
6. Confirm no duplicate interface definitions remain (`grep -r "interface Tab {" src/`)

## Decisions / Exclusions
- Routes in App.tsx: NOT changed — B2B.tsx and B2C.tsx remain as thin wrappers to avoid touching routing
- Tab.tsx direct mutation pattern: NOT changed — pervasive established pattern
- CSS: check if B2B/B2C have separate .css files before merging
- Admin pages (Users, Formats, etc.): OUT OF SCOPE — not duplicated
