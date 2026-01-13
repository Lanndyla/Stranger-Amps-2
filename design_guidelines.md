# Design Guidelines: Djent Amp Simulator

## Design Approach

**Reference-Based Skeuomorphic Design** inspired by Otto Audio Eleven Eleven and professional guitar amplifier hardware. This audio production tool demands tactile, realistic controls that mirror physical amp interactions while maintaining digital precision.

## Layout & Structure

**Viewport Strategy:**
- Single-screen application (100vh) - no scrolling
- Fixed aspect ratio maintaining amp proportions
- Responsive scaling: maintains aspect ratio, scales to fit viewport

**Primary Layout:**
```
Header Bar (8% height)
- Logo/branding left
- Preset selector center  
- Utility controls right (Settings, Help, IR bypass toggle)

Main Canvas (92% height)
- Amp head (35% of canvas)
- Cabinet (65% of canvas)
- Controls overlay amp front panel
```

**Component Hierarchy:**
- Cabinet base: largest visual element, anchoring composition
- Amp head: sits naturally on cabinet
- Control panels: integrated into amp face
- Status indicators: subtle, non-intrusive

## Typography

**Font Stack:**
- Primary: 'Rajdhani' or 'Orbitron' (bold, mechanical aesthetic via Google Fonts)
- Secondary: 'Inter' for settings/menus
- Monospace: 'Roboto Mono' for parameter values

**Hierarchy:**
- Amp model name: text-2xl font-bold
- Section labels: text-xs uppercase tracking-widest
- Parameter labels: text-sm font-medium
- Values/readouts: text-base font-mono

## Spacing System

**Tailwind Units:** 2, 3, 4, 6, 8
- Knob spacing: gap-4
- Section padding: p-6
- Control grouping: space-y-3
- Panel margins: m-8

## Component Library

**Amp Controls:**
- Rotary knobs: Circular SVG-based with tick marks, value display below
- Toggle switches: Realistic flip switches for Punish, +10db, +LOW
- LED indicators: Small circular status lights
- Gain meter: Vertical bar with clipping indicator

**Sections (Left to Right on Amp Face):**
1. Input Gain + EQ (Bass/Mid/Treble/Presence)
2. Overdrive Section (Drive, Punish toggle, +10db, +LOW)
3. Master Volume + Output controls
4. IR Selection (dropdown, bypass toggle)

**Cabinet Display:**
- Grill texture representation
- Subtle branding/logo placement
- Speaker cone hint (visible through grill)

**Settings Panel (Slide-out from right):**
- IR file loader interface
- Audio routing options (Direct/FX Loop/Live)
- Latency/buffer settings
- MIDI mapping interface

**Interactions:**
- Knob rotation: Click-drag vertical motion
- Value scrubbing: Fine control with modifier key
- Double-click: Reset to default value
- Preset management: Dropdown with save/load

## Visual Treatment

**Materials & Textures:**
- Amp chassis: Metallic finish with subtle grain
- Control panel: Brushed texture
- Knobs: Metal caps with grip texture
- Cabinet: Textured vinyl/tolex material
- Grill cloth: Woven fabric pattern
- Hardware: Screws, corner protectors, handle details

**Depth & Dimension:**
- Subtle shadows beneath amp on cabinet
- Recessed control panel
- Raised knobs and switches
- Layered cabinet construction

**Lighting:**
- Directional light from top-left
- LED glow effects for indicators
- Subtle reflections on metal surfaces

## Audio-Specific UI

**Visual Feedback:**
- Real-time gain meter animation
- LED indicators for active features
- Clipping warning (red indicator flash)
- Signal flow visualization (subtle)

**Parameter Display:**
- Numeric values appear on hover/interaction
- Range indicators (min/max tick marks)
- Preset name always visible
- Current routing mode indicator

## Images

**No hero image** - This is an immersive, full-app interface mimicking hardware.

**Required visual assets:**
- Amp chassis mockup (front panel perspective)
- Cabinet with grill texture
- Metal/hardware detail textures
- Control surface materials

Place realistic amp/cabinet representations as the primary visual foundation, with controls and interfaces integrated directly into the equipment imagery.

## Performance Considerations

- Optimize texture assets for fast loading
- Use CSS transforms for knob rotation (GPU-accelerated)
- Minimize repaints during parameter changes
- Audio processing separate from UI thread

## Accessibility

- Keyboard controls for all knobs (arrow keys)
- Tab navigation through all controls
- Screen reader labels for all parameters
- High contrast mode option in settings
- Clear visual state indicators

This design prioritizes professional audio tool aesthetics with tactile, hardware-inspired controls while maintaining the precision and flexibility of digital audio processing.