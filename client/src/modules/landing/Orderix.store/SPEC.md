# LeuciPOS Landing Page - SPEC.md

## 1. Concepto & Visión

**LeuciPOS** es un sistema POS gastronómico que se siente como estar en el cockpit de un avión de combate, pero para tu cocina. La experiencia visual transmite velocidad, control absoluto y eficiencia en tiempo real. No es una web estática - es un sistema vivo que muestra el pulso del negocio gastronómico.

La landing page debe sentirse como una **terminal de control de cocina** - con logs que fluyen, pedidos que entran, alertas que parpadean. El usuario debe sentir que está operando el sistema antes de siquiera tocarlo.

---

## 2. Design Language

### Aesthetic Direction
**"Command Center meets Kitchen"** - Inspirado en dashboards de trading, interfaces de control aéreo y... la realidad de una cocina profesional. Dark mode profundo con acentos naranjas intensos que evocan fuego, cocina y urgencia.

### Color Palette
```
--bg-primary: #0a0a0b          // Negro profundo, como la noche
--bg-secondary: #111113         // Oscuro elevado para cards
--bg-tertiary: #1a1a1d         // Superficies elevadas
--border: #2a2a2e              // Bordes sutiles
--border-active: #3a3a3f       // Bordes activos

--accent-primary: #f97316      // Naranja principal (el fuego)
--accent-glow: #fb923c         // Naranja brillante para glows
--accent-dim: #c2410c          // Naranja oscuro para sombras

--text-primary: #fafafa        // Blanco puro para títulos
--text-secondary: #a1a1aa      // Gris para texto secundario
--text-muted: #52525b          // Gris para labels

--success: #22c55e             // Verde para estados positivos
--warning: #eab308             // Amarillo para warnings
--error: #ef4444               // Rojo para errores
--info: #3b82f6                // Azul para info
```

### Typography
- **Headlines**: `Space Grotesk` (700, 800) - Geométrica, moderna, técnica
- **Body**: `Inter` (400, 500, 600) - Legible, profesional
- **Monospace**: `JetBrains Mono` - Para logs, timestamps, datos técnicos

### Spatial System
- Base unit: 4px
- Spacing scale: 4, 8, 12, 16, 24, 32, 48, 64, 96, 128
- Border radius: 4px (sharp), 8px (subtle), 12px (cards)
- Section padding: 96px vertical (desktop), 64px (mobile)

### Motion Philosophy
- **Transiciones**: 150-200ms, ease-out para interacciones inmediatas
- **Entradas**: 400-600ms con stagger de 50-100ms para elementos que entran
- **Logs/Pedidos**: Animaciones continuas suaves para simular actividad en vivo
- **Hover states**: Scale 1.02 + border glow sutil
- **Parpadeos**: Para alertas críticas, 1s interval con opacity

### Visual Assets
- **Iconos**: Lucide Icons (stroke-width: 1.5) - Limpios, técnicos
- **Decorativos**: Líneas de grid sutiles, gradientes radiales para depth
- **Sin imágenes genéricas**: Todo es UI real simulada

---

## 3. Layout & Structure

### Arquitectura de Página (No Tradicional)

```
┌─────────────────────────────────────────────────────────────┐
│ NAVBAR (minimalista, fijo, blur backdrop)                   │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  HERO SECTION (pantalla dividida 60/40)                    │
│  ┌─────────────────────────┬──────────────────────┐         │
│  │                         │                      │         │
│  │  "Tu cocina,           │  [LIVE DASHBOARD]    │         │
│  │   pero sin caos."      │  [Pedidos fluyendo]  │         │
│  │                         │                      │         │
│  │  [CTA]                  │  [Stats en vivo]     │         │
│  └─────────────────────────┴──────────────────────┘         │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  SYSTEM LOGS (problemas como terminal)                      │
│  ┌─────────────────────────────────────────────────┐        │
│  │ [ERROR]   14:32  Pedido #452 - Sin stock       │        │
│  │ [WARN]    14:31  Mesa 5 - Tiempo > 15min       │        │
│  │ [CRITICAL] 14:30  Cocina saturada              │        │
│  └─────────────────────────────────────────────────┘        │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  TRANSFORMATION (antes → después animado)                   │
│  [CHAOS INTERFACE] ────────► [LEUCIPOS INTERFACE]          │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  SYSTEM MODULES (features como apps de SO)                 │
│  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐              │
│  │ MODULE │ │ MODULE │ │ MODULE │ │ MODULE │              │
│  │ [icon] │ │ [icon] │ │ [icon] │ │ [icon] │              │
│  │  name  │ │  name  │ │  name  │ │  name  │              │
│  │ status │ │ status │ │ status │ │ status │              │
│  └────────┘ └────────┘ └────────┘ └────────┘              │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  INTERACTIVE DEMO (dashboard simulable)                     │
│  ┌─────────────────────────────────────────────────┐        │
│  │ TABS: [Pedidos] [Stock] [Menú] [Reportes]     │        │
│  ├─────────────────────────────────────────────────┤        │
│  │                                                 │        │
│  │   [Contenido dinámico según tab]               │        │
│  │                                                 │        │
│  └─────────────────────────────────────────────────┘        │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  FOOTER CTA (dark solid, mensaje fuerte)                    │
│  "Dejá de perder plata. Empezá a controlar tu negocio."   │
│  [SOLICITAR DEMO]                                          │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Responsive Strategy
- **Desktop (1200px+)**: Layout completo, dashboard en vivo
- **Tablet (768-1199px)**: Stack vertical, módulos 2x2
- **Mobile (< 768px)**: Todo stackeado, demo scroll horizontal

---

## 4. Features & Interactions

### Navbar
- Fijo en top, blur backdrop cuando scrollea
- Logo + 3 links + CTA button
- Mobile: hamburger menu con drawer

### Hero Section
- **Izquierda**: Headline agresivo, subtext corto, CTA
- **Derecha**: Dashboard en vivo con:
  - Pedidos entrando con timestamps (animados cada 3-5s)
  - Progress bars de preparación
  - Contadores de ventas del día
  - Mini estado de stock
- Efecto de "terminal activa"

### System Logs (Problemas)
- Terminal-style con monospace font
- Logs aparecen con typing animation
- Diferentes severidades con colores:
  - `[ERROR]` - rojo
  - `[WARN]` - amarillo
  - `[CRITICAL]` - rojo con parpadeo
- Scroll infinito simulado

### Transformation Section
- Split screen: izquierda = UI caótica (rojo, desordenado), derecha = LeuciPOS (ordenado, verde)
- Botón "Transformar" que activa animación de transición
- Barras de progreso animadas mostrando mejoras

### System Modules (Features)
- Cards como módulos de sistema operativo
- Cada una tiene:
  - Ícono de estado (dot verde/amarillo)
  - Nombre del módulo
  - Breve descripción
  - "Versión" o status
- Hover: glow naranja, scale sutil
- Click: expand para más info (opcional)

### Interactive Demo
- Tabs para navegar secciones
- Contenido dinámico con datos simulados
- Tablas de pedidos con estados (nuevo, preparando, listo)
- Gráficos simples animados
- Interacción: click en pedido = cambia estado

### Final CTA
- Fondo negro sólido (#0a0a0b)
- Mensaje large, centrado, bold
- CTA button minimalista
- Sin decorations, máximo contraste

---

## 5. Component Inventory

### Button Primary
- Default: bg accent-primary, text white, border-radius 8px
- Hover: brightness +10%, subtle glow
- Active: scale 0.98
- Disabled: opacity 50%

### Button Secondary
- Default: bg transparent, border accent, text accent
- Hover: bg accent/10%
- Active: scale 0.98

### Card/Module
- Default: bg bg-secondary, border border, rounded-12
- Hover: border-active, subtle glow
- Contains: icon, title, description, status dot

### Log Entry
- Monospace font
- Timestamp prefix
- Type badge [ERROR/WARN/INFO]
- Text message
- Entrance animation: fade + slide from left

### Tab Component
- Underline style active
- Smooth transition between states
- Active: accent underline + text primary

### Dashboard Widget
- Mini cards dentro del dashboard
- Animated progress bars
- Live counters with counting animation

### Status Badge
- Dot indicator + text
- Colors: success, warning, error
- Pulse animation para "live" indicators

---

## 6. Technical Approach

### Stack
- **HTML5** semántico
- **Tailwind CSS** (CDN) para utilidades
- **Vanilla JS** para interactividad
- Google Fonts: Space Grotesk, Inter, JetBrains Mono
- Lucide Icons (CDN)

### Architecture
- Single HTML file
- CSS custom properties para theming
- JS modular con funciones claras
- Intersection Observer para scroll animations

### Performance
- Lazy loading para secciones below fold
- CSS animations sobre JS donde sea posible
- Minimal DOM manipulation

### Accessibility
- Focus states claros
- Semantic HTML
- Color contrast ratios WCAG AA
- Keyboard navigation para tabs

---

## 7. Content Strategy

### Headlines
- Hero: "Tu cocina, pero sin caos."
- Transformation: "Del caos al control en 3 clicks."
- Features: "Módulos activos. Gestión total."
- CTA: "Dejá de perder plata. Empezá a controlar tu negocio."

### Microcopy
- Tono directo, sin corporate speak
- Datos técnicos realistas (timestamps, números de pedido)
- Urgencia sin ser agresivos

### Log Messages (Realismo)
```
[ERROR] 14:32  Pedido #847 - Mozzarella sin stock
[WARN] 14:31  Mesa 3 - Tiempo de espera > 12 min
[CRITICAL] 14:30  8 pedidos en cola - Cocina saturada
[ERROR] 14:28  Pedido #845 - Modificación no registrada
[WARN] 14:25  Stock bajo: Pan hamburguesa (12 unidades)
[INFO] 14:23  Turno noche iniciado - 3 empleados activos
```

---

## 8. Animations Timeline

### Page Load
1. 0ms: Navbar fade in
2. 100ms: Hero text slide up
3. 200ms: Dashboard fade in with stagger
4. 400ms: First log entry appears
5. 600ms: Modules fade in with stagger

### Scroll Animations
- Sections fade + slide on intersection
- Staggered children animations
- Parallax sutil en backgrounds

### Micro-interactions
- Hover: 150ms ease-out
- Module expand: 200ms
- Tab switch: 150ms crossfade
- Log entry: typing effect 50ms per char

### Continuous Animations
- Dashboard live feed: 3-5s interval
- Status dots: subtle pulse 2s
- Error logs: blink 1s for critical
