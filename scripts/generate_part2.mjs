import fs from "fs";

const skills = [];

function defineSkill(slug, name, category, description, l1, l2, l3) {
  skills.push({
    slug,
    name,
    category,
    description,
    version: "1.0.0",
    stages: [
      {
        level: 1,
        title: "Level 1 — Foundation",
        description: `Fundamental principles, core syntax, and essential mental models for ${name}.`,
        passingScore: 80,
        cooldownMinutes: 30,
        maxAttemptsPerDay: 3,
        questions: [{ ...l1, id: `${slug}-l1-q1`, weight: 100, type: "MULTIPLE_CHOICE" }],
      },
      {
        level: 2,
        title: "Level 2 — Practitioner",
        description: `Applied engineering patterns, performance optimization, and practical debugging in ${name}.`,
        passingScore: 80,
        cooldownMinutes: 30,
        maxAttemptsPerDay: 3,
        questions: [{ ...l2, id: `${slug}-l2-q1`, weight: 100, type: "MULTIPLE_CHOICE" }],
      },
      {
        level: 3,
        title: "Level 3 — Advanced",
        description: `Advanced architecture, internal mechanics, concurrency safety, and edge-case resilience in ${name}.`,
        passingScore: 80,
        cooldownMinutes: 60,
        maxAttemptsPerDay: 3,
        questions: [{ ...l3, id: `${slug}-l3-q1`, weight: 100, type: "MULTIPLE_CHOICE" }],
      },
    ],
  });
}

// ==========================================
// 2. FRONTEND DEVELOPMENT (8 skills)
// ==========================================

// 2.1 HTML
defineSkill(
  "html",
  "HTML",
  "FRONTEND",
  "Semantic markup, accessibility (ARIA), SEO standards, and document structure.",
  {
    prompt: "Why should interactive actions (such as triggering a modal or submitting data) use `<button>` rather than `<div onClick=...>`?",
    options: [
      { id: "a", text: "`<button>` natively provides keyboard focus (Tab), Enter/Space activation, and communicates role semantics to assistive technology." },
      { id: "b", text: "`<div>` elements cannot receive mouse click events in modern browsers." },
      { id: "c", text: "`<button>` elements are automatically rendered by the GPU." },
      { id: "d", text: "`<div>` elements are blocked by Content Security Policies." },
    ],
    correctOptionId: "a",
    explanation: "Native `<button>` elements have built-in accessibility semantics, tab stop focusability, and keyboard activation.",
  },
  {
    prompt: "When notifying screen readers of dynamic content changes (like incoming chat messages or toast alerts), what is the difference between `aria-live=\"polite\"` and `aria-live=\"assertive\"`?",
    options: [
      { id: "a", text: "`polite` waits until the user is idle before announcing, whereas `assertive` interrupts current speech immediately." },
      { id: "b", text: "`polite` is for errors only, while `assertive` is for success alerts." },
      { id: "c", text: "`assertive` plays an audible sound effect automatically." },
      { id: "d", text: "`polite` renders content in high contrast mode." },
    ],
    correctOptionId: "a",
    explanation: "`aria-live=\"polite\"` waits for natural pauses in user interaction; `assertive` interrupts current speech immediately.",
  },
  {
    prompt: "Which Content Security Policy (CSP) directive effectively stops cross-site scripting (XSS) by preventing arbitrary inline script execution without cryptographic nonces?",
    options: [
      { id: "a", text: "`script-src 'self' 'nonce-...'` (without `'unsafe-inline'`)." },
      { id: "b", text: "`default-src *`" },
      { id: "c", text: "`frame-ancestors 'none'`" },
      { id: "d", text: "`upgrade-insecure-requests`" },
    ],
    correctOptionId: "a",
    explanation: "Disallowing `'unsafe-inline'` and enforcing cryptographically random nonces prevents injected inline script execution.",
  }
);

// 2.2 CSS
defineSkill(
  "css",
  "CSS",
  "FRONTEND",
  "CSS Grid, Flexbox, container queries, animations, and custom properties.",
  {
    prompt: "Under `box-sizing: border-box`, what does setting `width: 300px; padding: 20px; border: 5px solid;` do to the element's rendered outer box width?",
    options: [
      { id: "a", text: "The total rendered width remains exactly 300px, with padding and border absorbed inside." },
      { id: "b", text: "The total rendered width expands to 350px (300 + 40 + 10)." },
      { id: "c", text: "The element overflows its parent container unconditionally." },
      { id: "d", text: "The border is ignored in width calculations." },
    ],
    correctOptionId: "a",
    explanation: "`box-sizing: border-box` includes padding and border within the specified element width.",
  },
  {
    prompt: "Which modern CSS Grid declaration creates an auto-wrapping responsive grid of cards with a minimum card width of 250px without using any media queries?",
    options: [
      { id: "a", text: "`grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));`" },
      { id: "b", text: "`grid-template-columns: repeat(3, 250px);`" },
      { id: "c", text: "`display: flex; flex-direction: column;`" },
      { id: "d", text: "`grid-auto-flow: dense;`" },
    ],
    correctOptionId: "a",
    explanation: "`repeat(auto-fit, minmax(250px, 1fr))` dynamically wraps and stretches columns responsively without breakpoints.",
  },
  {
    prompt: "How can developers eliminate Cumulative Layout Shift (CLS) caused by asynchronously loaded responsive images?",
    options: [
      { id: "a", text: "Set explicit `width` and `height` HTML attributes or declare `aspect-ratio` in CSS so the browser reserves layout space before download." },
      { id: "b", text: "Apply `filter: blur(10px)` to all images." },
      { id: "c", text: "Use PNG format instead of WebP or AVIF." },
      { id: "d", text: "Wrap images in `overflow: scroll`." },
    ],
    correctOptionId: "a",
    explanation: "Explicit dimensions or CSS `aspect-ratio` enable the layout engine to calculate aspect ratio and reserve layout space.",
  }
);

// 2.3 React
defineSkill(
  "react",
  "React",
  "FRONTEND",
  "Component lifecycle, hooks, state synchronization, and render optimization.",
  {
    prompt: "Why does the React Rules of Hooks require hooks (e.g. `useState`, `useEffect`) to be called only at the top level of a component?",
    options: [
      { id: "a", text: "React relies on the sequential call order of hooks across renders to associate internal state fibers with the correct hook index." },
      { id: "b", text: "Hooks run on a separate Web Worker thread." },
      { id: "c", text: "Conditional hooks cause memory leaks in the browser V8 engine." },
      { id: "d", text: "The JavaScript parser syntax prohibits calling functions inside `if` statements." },
    ],
    correctOptionId: "a",
    explanation: "Hooks depend on stable call order to match state cells between renders without explicit keys.",
  },
  {
    prompt: "When is wrapping a callback in `useCallback` actually effective in optimizing React rendering performance?",
    options: [
      { id: "a", text: "When passing the callback to an expensive child component that is wrapped in `React.memo` or when used in a dependency array." },
      { id: "b", text: "On every single inline function in every component indiscriminately." },
      { id: "c", text: "Only when fetching data from REST APIs." },
      { id: "d", text: "When you want to run the function synchronously on the GPU." },
    ],
    correctOptionId: "a",
    explanation: "`useCallback` preserves reference identity, preventing re-renders only when child components are memoized.",
  },
  {
    prompt: "In React 18+ concurrent rendering, how does `useTransition` improve user interface responsiveness during heavy state updates?",
    options: [
      { id: "a", text: "It marks the update as a non-urgent transition, keeping input typing responsive while deferring the expensive render." },
      { id: "b", text: "It disables virtual DOM diffing for the subtree." },
      { id: "c", text: "It compiles the React component to WebAssembly." },
      { id: "d", text: "It pauses all network requests until rendering completes." },
    ],
    correctOptionId: "a",
    explanation: "`useTransition` allows React to interrupt non-urgent renders to prioritize urgent user interactions.",
  }
);

// 2.4 Next.js
defineSkill(
  "nextjs",
  "Next.js",
  "FRONTEND",
  "App router, React Server Components, streaming SSR, and edge rendering.",
  {
    prompt: "In Next.js App Router, what is the default behavior of components inside the `app/` directory if no directive is added?",
    options: [
      { id: "a", text: "They are React Server Components (RSC) that execute exclusively on the server and send zero JavaScript to the client bundle." },
      { id: "b", text: "They are Client Components that re-render on the browser only." },
      { id: "c", text: "They are static HTML files that cannot read database queries." },
      { id: "d", text: "They throw an error unless annotated with `\"use server\"`." },
    ],
    correctOptionId: "a",
    explanation: "By default, App Router components are Server Components, reducing client bundle size.",
  },
  {
    prompt: "How does Incremental Static Regeneration (ISR) with `export const revalidate = 60` operate in Next.js?",
    options: [
      { id: "a", text: "It serves cached static HTML to users instantly and regenerates the page in the background at most once every 60 seconds." },
      { id: "b", text: "It reloads the user's browser tab every 60 seconds." },
      { id: "c", text: "It deletes the database cache every minute." },
      { id: "d", text: "It forces client-side fetching via React Query." },
    ],
    correctOptionId: "a",
    explanation: "ISR provides static caching speed while asynchronously regenerating stale pages in the background.",
  },
  {
    prompt: "In Next.js middleware running on the Edge Runtime, why are Node.js native APIs like `fs` or `child_process` unavailable?",
    options: [
      { id: "a", text: "The Edge Runtime is built on lightweight V8 isolates with web-standard APIs rather than the full Node.js POSIX runtime." },
      { id: "b", text: "Next.js forbids file reading in all server code." },
      { id: "c", text: "Edge middleware only executes inside the user's browser." },
      { id: "d", text: "Node.js removed `fs` in version 20." },
    ],
    correctOptionId: "a",
    explanation: "Edge Runtime uses V8 isolates implementing Fetch/Web APIs for ultra-fast startup without full Node internals.",
  }
);

// 2.5 Vue.js
defineSkill(
  "vue",
  "Vue.js",
  "FRONTEND",
  "Composition API, reactivity system, Pinia state, and SFC architecture.",
  {
    prompt: "In Vue 3 Composition API, what is the key difference between `ref(0)` and `reactive({ count: 0 })`?",
    options: [
      { id: "a", text: "`ref` wraps primitives or objects in a `{ value: ... }` reactive container, whereas `reactive` takes an object and returns a Proxy directly." },
      { id: "b", text: "`ref` is immutable, while `reactive` can be mutated." },
      { id: "c", text: "`reactive` only works in Vue 2." },
      { id: "d", text: "`ref` can only store strings." },
    ],
    correctOptionId: "a",
    explanation: "`ref` accepts primitives and uses `.value` getters/setters, whereas `reactive` wraps objects in JavaScript Proxies.",
  },
  {
    prompt: "In a Vue 3 component, how is two-way data binding configured on a custom child component using `v-model=\"title\"`?",
    options: [
      { id: "a", text: "The child accepts a `modelValue` prop and emits an `update:modelValue` event when the value changes." },
      { id: "b", text: "The child directly mutates `this.$parent.title`." },
      { id: "c", text: "The child defines a global Vuex mutation." },
      { id: "d", text: "Two-way binding is unsupported on custom components in Vue 3." },
    ],
    correctOptionId: "a",
    explanation: "Vue 3 standardizes `v-model` around `modelValue` prop and `update:modelValue` emit.",
  },
  {
    prompt: "Under Vue 3 reactivity internals, how does the reactivity engine track dependencies when a reactive property is read inside `computed()`?",
    options: [
      { id: "a", text: "The Proxy `get` trap intercepts the property read and registers the currently active `effect` into a `Dep` set for that key." },
      { id: "b", text: "Vue runs an AST scanner on every mouse move." },
      { id: "c", text: "Object polling checks values on every requestAnimationFrame." },
      { id: "d", text: "Dirty flags are written to HTML data attributes." },
    ],
    correctOptionId: "a",
    explanation: "Vue 3 uses Proxy get/set traps (`track` and `trigger`) to record and notify subscribers automatically.",
  }
);

// 2.6 Angular
defineSkill(
  "angular",
  "Angular",
  "FRONTEND",
  "Signals, standalone components, dependency injection, and RxJS pipelines.",
  {
    prompt: "In modern Angular, what does registering a service with `@Injectable({ providedIn: 'root' })` achieve?",
    options: [
      { id: "a", text: "It creates an application-wide singleton that is automatically tree-shaken if unused." },
      { id: "b", text: "It creates a separate instance for every component that injects it." },
      { id: "c", text: "It restricts the service to server-side rendering only." },
      { id: "d", text: "It disables dependency injection." },
    ],
    correctOptionId: "a",
    explanation: "`providedIn: 'root'` provides a tree-shakeable application-level singleton service.",
  },
  {
    prompt: "Why is subscribing to RxJS Observables in component templates using the `async` pipe preferred over manual `.subscribe()` in `ngOnInit()`?",
    options: [
      { id: "a", text: "The `async` pipe automatically unsubscribes when the component is destroyed, preventing memory leaks." },
      { id: "b", text: "The `async` pipe bypasses Angular change detection." },
      { id: "c", text: "Manual `.subscribe()` is prohibited in Angular 17+." },
      { id: "d", text: "The `async` pipe converts the stream into a Promise." },
    ],
    correctOptionId: "a",
    explanation: "The `async` pipe manages observable lifecycles, subscribing on init and unsubscribing upon teardown.",
  },
  {
    prompt: "What fundamental change do Angular Signals introduce compared to Zone.js change detection?",
    options: [
      { id: "a", text: "Signals enable fine-grained reactive dependency tracking directly to the DOM nodes, eliminating top-down tree checking." },
      { id: "b", text: "Signals require compiling the application to WebAssembly." },
      { id: "c", text: "Signals convert Angular into a server-only framework." },
      { id: "d", text: "Signals replace TypeScript with pure JavaScript." },
    ],
    correctOptionId: "a",
    explanation: "Signals notify the framework precisely which expressions changed, allowing targeted local updates without monkey-patching browser APIs.",
  }
);

// 2.7 Svelte
defineSkill(
  "svelte",
  "Svelte",
  "FRONTEND",
  "Runes reactivity, compiler-driven UI, SvelteKit, and zero-runtime overhead.",
  {
    prompt: "How does Svelte's compilation model differ fundamentally from virtual-DOM-based frameworks like React or Vue?",
    options: [
      { id: "a", text: "Svelte compiles components into surgical imperative code that updates the DOM directly, eliminating virtual DOM overhead at runtime." },
      { id: "b", text: "Svelte runs a virtual DOM inside WebAssembly." },
      { id: "c", text: "Svelte components cannot be re-rendered after initial mount." },
      { id: "d", text: "Svelte requires a heavy 150KB runtime library." },
    ],
    correctOptionId: "a",
    explanation: "Svelte is a build-time compiler that generates targeted DOM updates rather than diffing virtual trees at runtime.",
  },
  {
    prompt: "In Svelte 5, what do Runes like `$state(initialValue)` and `$derived(expression)` represent?",
    options: [
      { id: "a", text: "Compiler-recognized signals that provide fine-grained, universal reactivity inside and outside `.svelte` files." },
      { id: "b", text: "Database connection strings for SvelteKit." },
      { id: "c", text: "Legacy syntax deprecated in favor of React hooks." },
      { id: "d", text: "CSS animation keyframes." },
    ],
    correctOptionId: "a",
    explanation: "Svelte 5 Runes provide explicit, signal-based reactivity that works across `.svelte` components and TypeScript files.",
  },
  {
    prompt: "In SvelteKit, what is the role of a `+page.server.ts` file alongside `+page.svelte`?",
    options: [
      { id: "a", text: "It defines a server-only `load` function and form actions that execute on the server and have secure access to secrets and databases." },
      { id: "b", text: "It compiles the client CSS bundle." },
      { id: "c", text: "It serves static assets like favicon and images." },
      { id: "d", text: "It is an automated end-to-end test runner." },
    ],
    correctOptionId: "a",
    explanation: "`+page.server.ts` runs exclusively on the server, guaranteeing that private keys and database calls are never exposed to clients.",
  }
);

// 2.8 Tailwind CSS
defineSkill(
  "tailwind-css",
  "Tailwind CSS",
  "FRONTEND",
  "Utility-first design tokens, responsive breakpoints, and dark mode variants.",
  {
    prompt: "In Tailwind CSS, how do responsive prefixes like `md:grid-cols-2` work under the mobile-first paradigm?",
    options: [
      { id: "a", text: "They apply CSS rules via `@media (min-width: 768px)` queries, styling mobile by default and upgrading on larger screens." },
      { id: "b", text: "They apply only to mobile screens and are removed on desktops." },
      { id: "c", text: "They inject JavaScript viewport event listeners." },
      { id: "d", text: "They require a separate CSS file for every breakpoint." },
    ],
    correctOptionId: "a",
    explanation: "Tailwind uses mobile-first `min-width` queries; unprefixed utilities target mobile and prefixes apply at wider viewports.",
  },
  {
    prompt: "Why is constructing class names using dynamic string interpolation (e.g. `class={`text-${color}-500`}`) problematic in Tailwind JIT / compiler?",
    options: [
      { id: "a", text: "Tailwind's scanner uses static regex to find complete uninterrupted class names in source code; interpolated partial strings are not generated." },
      { id: "b", text: "The browser will throw a JavaScript syntax error." },
      { id: "c", text: "It causes the CSS file to exceed 50MB." },
      { id: "d", text: "Tailwind only permits 5 colors in total." },
    ],
    correctOptionId: "a",
    explanation: "Tailwind parses files statically; classes not written in full are purged from the generated stylesheet.",
  },
  {
    prompt: "In Tailwind CSS, what is the recommended way to resolve conflicting utility classes on the same element (e.g. `p-4` and `p-2`) when composing reusable components in React?",
    options: [
      { id: "a", text: "Use `tailwind-merge` (`twMerge`) which understands Tailwind class precedence and discards overridden utilities." },
      { id: "b", text: "Use `!important` on all classes." },
      { id: "c", text: "Write raw inline styles." },
      { id: "d", text: "Append classes with semicolons." },
    ],
    correctOptionId: "a",
    explanation: "`tailwind-merge` safely merges conflicting utility classes based on CSS specificity and property equivalence.",
  }
);

// ==========================================
// 3. BACKEND DEVELOPMENT (8 skills)
// ==========================================

// 3.1 Node.js
defineSkill(
  "nodejs",
  "Node.js",
  "BACKEND",
  "Event loop, streams, worker threads, async I/O, and native ESM modules.",
  {
    prompt: "Why can executing a CPU-intensive synchronous task (such as calculating hashes in a tight loop) freeze an entire Node.js HTTP server?",
    options: [
      { id: "a", text: "Node.js runs user JavaScript on a single thread; blocking that thread prevents the event loop from processing I/O events and incoming sockets." },
      { id: "b", text: "Operating systems terminate processes that run loops longer than 100ms." },
      { id: "c", text: "Synchronous loops disable the V8 garbage collector permanently." },
      { id: "d", text: "CPU tasks corrupt TCP connection buffers." },
    ],
    correctOptionId: "a",
    explanation: "The single-threaded event loop handles all incoming network I/O; blocking it prevents handling any other concurrent requests.",
  },
  {
    prompt: "When piping data between a fast readable stream and a slow writable stream in Node.js, what does `pipeline` from `node:stream/promises` guarantee?",
    options: [
      { id: "a", text: "It handles backpressure automatically and properly cleans up and destroys all streams if an error occurs." },
      { id: "b", text: "It forces data to buffer into RAM until the file is fully read." },
      { id: "c", text: "It compresses all data using Brotli." },
      { id: "d", text: "It opens multiple parallel TCP sockets." },
    ],
    correctOptionId: "a",
    explanation: "`stream.pipeline` enforces backpressure and guarantees proper stream destruction on error or completion.",
  },
  {
    prompt: "How can Node.js applications execute CPU-heavy computations in parallel without spawning external OS processes?",
    options: [
      { id: "a", text: "Use the `worker_threads` module, which runs isolated V8 instances sharing process memory via `SharedArrayBuffer`." },
      { id: "b", text: "Call `process.nextTick()` in a `while (true)` loop." },
      { id: "c", text: "Increase the `UV_THREADPOOL_SIZE` environment variable." },
      { id: "d", text: "Use `async/await`." },
    ],
    correctOptionId: "a",
    explanation: "`worker_threads` provides true multi-threaded CPU execution within the same Node.js process.",
  }
);

// 3.2 Express.js
defineSkill(
  "expressjs",
  "Express.js",
  "BACKEND",
  "Middleware chaining, routing architecture, error propagation, and security headers.",
  {
    prompt: "In Express.js middleware, what happens if a middleware neither sends a response (e.g. `res.send()`) nor calls `next()`?",
    options: [
      { id: "a", text: "The HTTP request hangs indefinitely until the client or server socket times out." },
      { id: "b", text: "Express immediately responds with a 404 status." },
      { id: "c", text: "The next route handler executes automatically." },
      { id: "d", text: "A 500 Internal Server Error is sent to the client." },
    ],
    correctOptionId: "a",
    explanation: "Express request pipelines require explicit termination or forwarding via `next()`; omitting both causes client hangs.",
  },
  {
    prompt: "What is the mandatory function signature for an Express.js centralized error-handling middleware?",
    options: [
      { id: "a", text: "Four parameters: `(err, req, res, next)`." },
      { id: "b", text: "Two parameters: `(err, res)`." },
      { id: "c", text: "Three parameters: `(req, res, next)` with an `@error` decorator." },
      { id: "d", text: "One parameter: `(error)`." },
    ],
    correctOptionId: "a",
    explanation: "Express inspects function arity (`fn.length === 4`) to designate error-handling middleware.",
  },
  {
    prompt: "Which middleware package is the standard recommendation for securing Express apps by setting defensive HTTP headers (HSTS, X-Content-Type-Options, etc.)?",
    options: [
      { id: "a", text: "`helmet`" },
      { id: "b", text: "`cors`" },
      { id: "c", text: "`body-parser`" },
      { id: "d", text: "`morgan`" },
    ],
    correctOptionId: "a",
    explanation: "`helmet` sets sensible security headers to mitigate common web vulnerabilities.",
  }
);

// 3.3 FastAPI
defineSkill(
  "fastapi",
  "FastAPI",
  "BACKEND",
  "Pydantic validation, async route handlers, OpenAPI generation, and dependency injection.",
  {
    prompt: "In FastAPI, how are request body validation and automatic OpenAPI schema documentation achieved?",
    options: [
      { id: "a", text: "By defining route parameters with type annotations using Pydantic `BaseModel` classes." },
      { id: "b", text: "By writing manual XML schemas in the docstrings." },
      { id: "c", text: "By configuring SQL tables in SQLAlchemy." },
      { id: "d", text: "By importing raw JSON schemas into a global dictionary." },
    ],
    correctOptionId: "a",
    explanation: "FastAPI inspects Python type hints and Pydantic models to validate inputs and generate OpenAPI specs.",
  },
  {
    prompt: "What is the primary role of FastAPI's `Depends()` dependency injection system?",
    options: [
      { id: "a", text: "Managing shared logic, database session lifecycles, and authentication guards across route handlers with automatic cleanup." },
      { id: "b", text: "Installing Python pip packages at runtime." },
      { id: "c", text: "Compiling Python functions to C extensions." },
      { id: "d", text: "Running background crons." },
    ],
    correctOptionId: "a",
    explanation: "`Depends()` provides hierarchical dependency injection with generator support for automatic resource teardown.",
  },
  {
    prompt: "In FastAPI, how does the runtime handle a route defined with standard `def` compared to `async def`?",
    options: [
      { id: "a", text: "Standard `def` endpoints are dispatched to an external thread pool to prevent blocking the event loop; `async def` runs directly on the main event loop." },
      { id: "b", text: "Standard `def` endpoints are rejected with a compile error." },
      { id: "c", text: "Both run identically on the main event loop." },
      { id: "d", text: "`async def` runs on a separate CPU core." },
    ],
    correctOptionId: "a",
    explanation: "FastAPI executes synchronous `def` routes in a thread pool (`anyio.to_thread.run_sync`) so blocking code does not freeze asyncio.",
  }
);

// 3.4 Django
defineSkill(
  "django",
  "Django",
  "BACKEND",
  "ORM transactions, middleware, Django REST framework, and migrations.",
  {
    prompt: "In Django's Model-View-Template (MVT) architecture, what is the role of `models.py`?",
    options: [
      { id: "a", text: "Defines database table structures, relationships, and validations via the Django Object-Relational Mapper (ORM)." },
      { id: "b", text: "Handles URL routing and HTTP dispatching." },
      { id: "c", text: "Renders HTML templates with template tags." },
      { id: "d", text: "Configures reverse-proxy caching in Nginx." },
    ],
    correctOptionId: "a",
    explanation: "Django models define the data schema, relationships, and business validation rules mapped to database tables.",
  },
  {
    prompt: "What is the difference between `select_related` and `prefetch_related` in Django ORM query optimization?",
    options: [
      { id: "a", text: "`select_related` performs an SQL JOIN for single-valued relationships (ForeignKey, OneToOne); `prefetch_related` executes a separate batch query for multi-valued relationships (ManyToMany, reverse ForeignKey)." },
      { id: "b", text: "`select_related` caches in Redis, while `prefetch_related` writes to disk." },
      { id: "c", text: "Both perform identical SQL inner joins." },
      { id: "d", text: "`prefetch_related` only works on SQLite databases." },
    ],
    correctOptionId: "a",
    explanation: "`select_related` uses SQL JOINs for 1:1 and N:1 relations; `prefetch_related` runs secondary queries for 1:N and M:N relations.",
  },
  {
    prompt: "How does `transaction.atomic` protect database integrity during multi-step mutations in Django?",
    options: [
      { id: "a", text: "It wraps the code block in an SQL transaction (with savepoints for nested blocks), rolling back all changes if an unhandled exception occurs." },
      { id: "b", text: "It locks the entire database server from all read queries." },
      { id: "c", text: "It creates an in-memory replica of the database." },
      { id: "d", text: "It converts foreign keys into UUIDs." },
    ],
    correctOptionId: "a",
    explanation: "`transaction.atomic` guarantees ACID transaction boundaries, rolling back modifications on errors.",
  }
);

// 3.5 Flask
defineSkill(
  "flask",
  "Flask",
  "BACKEND",
  "Lightweight WSGI services, application factories, Blueprints, and extensions.",
  {
    prompt: "In Flask, why are globals like `request` and `current_app` safe to use across concurrent requests in multi-threaded servers?",
    options: [
      { id: "a", text: "They are context locals (proxies backed by Werkzeug) that look up values specific to the current thread or async greenlet." },
      { id: "b", text: "Flask locks all requests to execute one at a time." },
      { id: "c", text: "Flask creates a completely new OS process for each HTTP request." },
      { id: "d", text: "Python variables are thread-isolated by default." },
    ],
    correctOptionId: "a",
    explanation: "Werkzeug context locals proxy requests to thread/task-local storage, allowing global access without cross-request leakage.",
  },
  {
    prompt: "What is the recommended architectural pattern for organizing routes and views into modular components in larger Flask applications?",
    options: [
      { id: "a", text: "Flask `Blueprint` instances grouped with an Application Factory function (`create_app()`)." },
      { id: "b", text: "Defining all routes in a single `app.py` file with global variables." },
      { id: "c", text: "Hardcoding URLs inside template HTML files." },
      { id: "d", text: "Importing route handlers inside database migration scripts." },
    ],
    correctOptionId: "a",
    explanation: "Blueprints and the application factory pattern enable modular structure, independent testing, and multiple app configurations.",
  },
  {
    prompt: "When running a production Flask service with Gunicorn, what worker model should be selected for high-concurrency I/O-bound web traffic?",
    options: [
      { id: "a", text: "Asynchronous workers (such as `gevent` or `eventlet`) or an ASGI server like Uvicorn." },
      { id: "b", text: "The built-in `flask run` development server." },
      { id: "c", text: "A single synchronous worker process with thread count set to 1." },
      { id: "d", text: "Disabling HTTP keep-alive." },
    ],
    correctOptionId: "a",
    explanation: "Async workers enable single processes to handle thousands of concurrent I/O connections efficiently without thread exhaustion.",
  }
);

// 3.6 Spring Boot
defineSkill(
  "spring-boot",
  "Spring Boot",
  "BACKEND",
  "Spring Security, WebFlux reactive streams, JPA repositories, and actuary metrics.",
  {
    prompt: "Why is constructor-based dependency injection preferred over field injection (`@Autowired` on private fields) in modern Spring applications?",
    options: [
      { id: "a", text: "It allows dependencies to be `final` (immutable), simplifies unit testing with mocks without Spring context, and prevents NPEs during initialization." },
      { id: "b", text: "Field injection is deprecated and removed in Java 17." },
      { id: "c", text: "Constructor injection compiles to faster machine code." },
      { id: "d", text: "Constructor injection bypasses Spring bean validation." },
    ],
    correctOptionId: "a",
    explanation: "Constructor injection guarantees complete object initialization, enables immutability, and avoids reflection in test suites.",
  },
  {
    prompt: "By default, under which condition does a method annotated with `@Transactional` in Spring roll back the active database transaction?",
    options: [
      { id: "a", text: "When an unchecked exception (`RuntimeException` or `Error`) is thrown from the method." },
      { id: "b", text: "When any checked `Exception` is thrown." },
      { id: "c", text: "Only when `System.exit()` is invoked." },
      { id: "d", text: "On every HTTP 400 response." },
    ],
    correctOptionId: "a",
    explanation: "Spring `@Transactional` rolls back only on unchecked exceptions by default, unless configured via `rollbackFor`.",
  },
  {
    prompt: "In Spring Boot 3+ running on Java 21, what major concurrency benefit does enabling `spring.threads.virtual.enabled=true` provide?",
    options: [
      { id: "a", text: "Standard blocking I/O (like JDBC queries) unmounts the lightweight virtual thread, enabling millions of concurrent requests without thread-pool starvation." },
      { id: "b", text: "It converts relational databases into in-memory caches." },
      { id: "c", text: "It disables the JVM garbage collector." },
      { id: "d", text: "It automatically rewrites SQL queries to GraphQL." },
    ],
    correctOptionId: "a",
    explanation: "Project Loom virtual threads unmount from carrier threads during blocking I/O, achieving high throughput with synchronous programming models.",
  }
);

// 3.7 REST APIs
defineSkill(
  "rest-apis",
  "REST APIs",
  "BACKEND",
  "Idempotency keys, HTTP status semantics, pagination, and API versioning.",
  {
    prompt: "In standard HTTP/1.1 semantics, what is the crucial difference between status codes 401 Unauthorized and 403 Forbidden?",
    options: [
      { id: "a", text: "401 indicates missing or invalid authentication credentials; 403 indicates authentication succeeded but the caller lacks required permissions." },
      { id: "b", text: "401 is a server error; 403 is a client error." },
      { id: "c", text: "403 means the URL does not exist." },
      { id: "d", text: "Both are identical and can be used interchangeably." },
    ],
    correctOptionId: "a",
    explanation: "401 requires authentication credentials to be presented; 403 confirms identity but rejects authorization.",
  },
  {
    prompt: "How does an `Idempotency-Key` header protect payment or financial transfer REST endpoints from double-charging during network drops?",
    options: [
      { id: "a", text: "The server stores the key with the completed result; repeated requests with the same key return the cached response without re-executing the charge." },
      { id: "b", text: "It encrypts the payload using the client's private key." },
      { id: "c", text: "It prevents clients from making more than one request per minute." },
      { id: "d", text: "It converts HTTP POST requests into GET requests." },
    ],
    correctOptionId: "a",
    explanation: "Idempotency keys deduplicate state-mutating requests, guaranteeing exactly-once side-effect execution under network retries.",
  },
  {
    prompt: "When designing high-volume paginated REST endpoints, why is cursor-based pagination (`?after_cursor=...`) preferred over offset pagination (`?page=1000&limit=50`)?",
    options: [
      { id: "a", text: "Cursor pagination uses indexed range queries (`WHERE id > :cursor`), avoiding database full-index scans and phantom row drift caused by insertions." },
      { id: "b", text: "Offset pagination is prohibited by the HTTP/2 specification." },
      { id: "c", text: "Cursor pagination returns all records in a single batch." },
      { id: "d", text: "Offset pagination cannot be parsed by frontend frameworks." },
    ],
    correctOptionId: "a",
    explanation: "Offset pagination scans and discards $N$ rows, causing quadratic latency at high offsets; cursor pagination scans directly from an indexed position.",
  }
);

// 3.8 GraphQL
defineSkill(
  "graphql",
  "GraphQL",
  "BACKEND",
  "Schema definition, resolvers, DataLoader N+1 mitigation, and subscriptions.",
  {
    prompt: "What primary client advantage does GraphQL offer over traditional fixed-payload REST endpoints?",
    options: [
      { id: "a", text: "Clients query exactly the fields they need in a single round-trip, eliminating over-fetching and under-fetching." },
      { id: "b", text: "GraphQL completely eliminates the need for database indexes." },
      { id: "c", text: "GraphQL endpoints cannot be cached by CDNs." },
      { id: "d", text: "GraphQL encrypts all payloads with quantum cryptography." },
    ],
    correctOptionId: "a",
    explanation: "GraphQL allows clients to specify precise data requirements, reducing payload size and network roundtrips.",
  },
  {
    prompt: "How does the `DataLoader` pattern solve the N+1 query problem in GraphQL query resolvers?",
    options: [
      { id: "a", text: "It batches individual key requests made during a tick of the event loop into a single bulk lookup query and memoizes results." },
      { id: "b", text: "It converts all database tables into GraphQL types." },
      { id: "c", text: "It disables relational joins in the SQL engine." },
      { id: "d", text: "It caches the entire database in browser localStorage." },
    ],
    correctOptionId: "a",
    explanation: "DataLoader coalesces individual fetch calls within a single tick into a single batched array query.",
  },
  {
    prompt: "What defense should be implemented on public GraphQL APIs to prevent Denial of Service (DoS) attacks via deeply nested malicious queries?",
    options: [
      { id: "a", text: "Query depth limiting and complexity analysis (assigning cost scores to fields and rejecting queries above a threshold)." },
      { id: "b", text: "Restricting GraphQL to GET requests only." },
      { id: "c", text: "Disabling SSL/TLS on the GraphQL route." },
      { id: "d", text: "Allowing only single-character field names." },
    ],
    correctOptionId: "a",
    explanation: "Query depth and complexity analysis stops attackers from generating recursive queries that overload servers.",
  }
);

console.log("Seeded Part 2 (Frontend & Backend skills):", skills.length);
fs.writeFileSync("backend/src/services/skills/questionData_part2.json", JSON.stringify(skills, null, 2));
