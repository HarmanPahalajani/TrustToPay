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
// 10. MOBILE DEVELOPMENT (4 skills)
// ==========================================

// 10.1 Android Development
defineSkill(
  "android-dev",
  "Android Development",
  "MOBILE",
  "Jetpack Compose, Android lifecycle, Kotlin coroutines, and Room database.",
  {
    prompt: "In Android architecture, why should UI state and asynchronous operations be managed inside a `ViewModel` rather than an `Activity`?",
    options: [
      { id: "a", text: "The `ViewModel` survives configuration changes (such as device screen rotation) that destroy and recreate the Activity instance." },
      { id: "b", text: "Activities cannot execute network calls on background threads." },
      { id: "c", text: "ViewModels execute with root privileges." },
      { id: "d", text: "Jetpack Compose prohibits referencing Activities." },
    ],
    correctOptionId: "a",
    explanation: "`ViewModel` instances persist across configuration changes, preventing state loss and duplicated background requests.",
  },
  {
    prompt: "In Jetpack Compose, what is the role of `remember { mutableStateOf(initialValue) }`?",
    options: [
      { id: "a", text: "It creates a reactive state observable that survives recompositions and notifies Compose to re-render UI elements that read it upon mutation." },
      { id: "b", text: "It saves state to permanent disk storage in SQLite." },
      { id: "c", text: "It pauses rendering until the user touches the screen." },
      { id: "d", text: "It converts Android views into HTML." },
    ],
    correctOptionId: "a",
    explanation: "`remember` retains an object across recompositions; `mutableStateOf` provides observable state that triggers recomposition on change.",
  },
  {
    prompt: "When scheduling deferred, guaranteed background execution in Android that must survive process death or device reboot, which Jetpack API is recommended?",
    options: [
      { id: "a", text: "`WorkManager`, which handles system constraints (charging, unmetered network) and guarantees execution via JobScheduler." },
      { id: "b", text: "A raw background `Thread.sleep()` in the Activity." },
      { id: "c", text: "An `AsyncTask`." },
      { id: "d", text: "A foreground notification with no service." },
    ],
    correctOptionId: "a",
    explanation: "WorkManager is the recommended modern API for persistent, deferrable background tasks that adhere to OS power management.",
  }
);

// 10.2 iOS Development
defineSkill(
  "ios-dev",
  "iOS Development",
  "MOBILE",
  "SwiftUI, UIKit interoperability, Swift Concurrency, and Core Data.",
  {
    prompt: "In Swift, what is the fundamental memory distinction between a `struct` and a `class`?",
    options: [
      { id: "a", text: "Structs are value types (copied on assignment and pass-by-value); classes are reference types (multiple pointers reference the same heap instance)." },
      { id: "b", text: "Classes are allocated on the stack; structs are allocated on the heap." },
      { id: "c", text: "Structs support inheritance; classes do not." },
      { id: "d", text: "Structs cannot have methods." },
    ],
    correctOptionId: "a",
    explanation: "Swift structs are value types that copy semantics; classes are reference types tracked by ARC.",
  },
  {
    prompt: "In Swift Concurrency, what does annotating a class or function with `@MainActor` ensure?",
    options: [
      { id: "a", text: "It guarantees that execution occurs strictly on the main thread, preventing data races when updating UI components." },
      { id: "b", text: "It marks the function as the app's initial entrypoint." },
      { id: "c", text: "It prevents the function from throwing errors." },
      { id: "d", text: "It compiles the function to Objective-C." },
    ],
    correctOptionId: "a",
    explanation: "`@MainActor` binds execution to the main dispatch queue to enforce thread safety for UI rendering.",
  },
  {
    prompt: "Under Swift Automatic Reference Counting (ARC), how do you prevent retain cycles when capturing `self` inside an escaping asynchronous closure?",
    options: [
      { id: "a", text: "Use a capture list specifying `[weak self]` or `[unowned self]` to prevent creating a strong reference cycle." },
      { id: "b", text: "Call `deinit` manually before calling the closure." },
      { id: "c", text: "Declare all properties as `static`." },
      { id: "d", text: "Disable ARC in Xcode project build settings." },
    ],
    correctOptionId: "a",
    explanation: "`[weak self]` avoids strong reference cycles by breaking the mutual ownership bond between closure and instance.",
  }
);

// 10.3 Flutter
defineSkill(
  "flutter",
  "Flutter",
  "MOBILE",
  "Widget tree architecture, platform channels, state management, and rendering pipelines.",
  {
    prompt: "In Flutter, what is the architectural difference between a `StatelessWidget` and a `StatefulWidget`?",
    options: [
      { id: "a", text: "`StatelessWidget` is immutable and depends solely on its configuration; `StatefulWidget` creates a mutable `State` object that persists across rebuilds." },
      { id: "b", text: "`StatelessWidget` can only display text." },
      { id: "c", text: "`StatefulWidget` does not support animations." },
      { id: "d", text: "`StatelessWidget` executes on Android only." },
    ],
    correctOptionId: "a",
    explanation: "`StatelessWidget` represents static configuration; `StatefulWidget` binds to a lifecycle-managed mutable `State` object.",
  },
  {
    prompt: "When managing complex state in a large Flutter application, why is using reactive solutions like Riverpod or Bloc preferred over passing `setState()` through deep widget trees?",
    options: [
      { id: "a", text: "They decouple business logic from UI, scope rebuilds to only widgets that observe modified state, and prevent unnecessary ancestor re-renders." },
      { id: "b", text: "They compile Flutter code into C++ binaries." },
      { id: "c", text: "They allow widgets to run without a `BuildContext`." },
      { id: "d", text: "They disable garbage collection in Dart." },
    ],
    correctOptionId: "a",
    explanation: "Dedicated state managers isolate state changes, updating only listening consumer widgets rather than rebuilding full subtrees.",
  },
  {
    prompt: "In Flutter's rendering pipeline, what three parallel trees does the Flutter engine maintain to render UI efficiently?",
    options: [
      { id: "a", text: "The Widget tree (configuration), the Element tree (lifecycle and structural identity), and the RenderObject tree (layout and painting)." },
      { id: "b", text: "The DOM tree, the CSS tree, and the JavaScript AST." },
      { id: "c", text: "The SQLite tree, the Cache tree, and the Network tree." },
      { id: "d", text: "The Activity tree, the Fragment tree, and the View tree." },
    ],
    correctOptionId: "a",
    explanation: "Widgets configure lightweight blueprints; Elements manage lifecycle reconciliation; RenderObjects perform layout and raster painting.",
  }
);

// 10.4 React Native
defineSkill(
  "react-native",
  "React Native",
  "MOBILE",
  "Fabric renderer, TurboModules, native bridge, and Expo application workflows.",
  {
    prompt: "In React Native, how do core components like `<View>` and `<Text>` render on mobile devices?",
    options: [
      { id: "a", text: "They map directly to platform-native UI widgets (`UIView`/`UILabel` on iOS, `ViewGroup`/`TextView` on Android)." },
      { id: "b", text: "They render inside an embedded hidden WebView iframe." },
      { id: "c", text: "They render as static raster PNG images." },
      { id: "d", text: "They compile directly to OpenGL draw calls on every frame." },
    ],
    correctOptionId: "a",
    explanation: "React Native components instantiate real host platform native views rather than simulating HTML inside WebViews.",
  },
  {
    prompt: "When rendering long dynamic lists in React Native, why is `<FlatList>` preferred over a standard `<ScrollView>` with mapped children?",
    options: [
      { id: "a", text: "`<FlatList>` lazily renders and recycles off-screen items, maintaining a stable memory footprint regardless of list length." },
      { id: "b", text: "`<ScrollView>` does not support touch scrolling." },
      { id: "c", text: "`<FlatList>` automatically saves items to an offline database." },
      { id: "d", text: "`<ScrollView>` is deprecated in React Native 0.70+." },
    ],
    correctOptionId: "a",
    explanation: "`FlatList` uses virtualization to render only visible items plus a small buffer, preventing OOM crashes on large lists.",
  },
  {
    prompt: "What major performance advantage does the React Native New Architecture (Fabric + TurboModules via JSI) deliver over the legacy asynchronous JSON bridge?",
    options: [
      { id: "a", text: "The JavaScript Interface (JSI) enables direct, synchronous, zero-copy C++ interop between JavaScript and native code without serializing JSON over a bridge." },
      { id: "b", text: "It converts JavaScript into Swift at compile time." },
      { id: "c", text: "It eliminates the need for Xcode and Android Studio." },
      { id: "d", text: "It removes the mobile operating system kernel." },
    ],
    correctOptionId: "a",
    explanation: "JSI exposes native C++ objects directly to JavaScript via HostObjects, eliminating serialized JSON bridge serialization bottlenecks.",
  }
);

// ==========================================
// 11. DESIGN & PRODUCT (3 skills)
// ==========================================

// 11.1 UI/UX Design
defineSkill(
  "ui-ux-design",
  "UI/UX Design",
  "DESIGN_PRODUCT",
  "Visual hierarchy, design system tokens, cognitive load reduction, and usability.",
  {
    prompt: "In user interface design, what is the primary role of establishing a consistent visual hierarchy?",
    options: [
      { id: "a", text: "To guide user attention and scan paths logically through scale, contrast, weight, and spacing so key content is understood effortlessly." },
      { id: "b", text: "To ensure every element on screen uses the identical font size and color." },
      { id: "c", text: "To fill all available whitespace with decorative graphics." },
      { id: "d", text: "To maximize the number of clickable advertisements." },
    ],
    correctOptionId: "a",
    explanation: "Visual hierarchy structures interface elements in order of importance, reducing cognitive load and accelerating comprehension.",
  },
  {
    prompt: "How does Fitts's Law apply to button sizing and placement in modern mobile touch interfaces?",
    options: [
      { id: "a", text: "Touch targets must have sufficient physical size (minimum 48x48dp) and be positioned within easy thumb reach to minimize acquisition time and tapping errors." },
      { id: "b", text: "Buttons must be placed exclusively in the top-right corner of the viewport." },
      { id: "c", text: "Buttons should shrink when tapped." },
      { id: "d", text: "Touch targets should never exceed 10x10 pixels." },
    ],
    correctOptionId: "a",
    explanation: "Fitts's Law models movement time as a function of target distance and size; larger, reachable targets decrease tap error rates.",
  },
  {
    prompt: "To achieve WCAG 2.1 AA digital accessibility conformance, what is the minimum contrast ratio required between regular body text and its background?",
    options: [
      { id: "a", text: "4.5:1 (or 3:1 for large text $\\ge$ 18pt or bold 14pt)." },
      { id: "b", text: "1.5:1." },
      { id: "c", text: "10:1." },
      { id: "d", text: "Contrast ratio is not regulated by WCAG." },
    ],
    correctOptionId: "a",
    explanation: "WCAG 2.1 AA mandates a minimum contrast ratio of 4.5:1 for standard text to ensure readability for visually impaired users.",
  }
);

// 11.2 Figma
defineSkill(
  "figma",
  "Figma",
  "DESIGN_PRODUCT",
  "Auto layout, component variants, interactive prototyping, and design tokens.",
  {
    prompt: "In Figma, how does setting an Auto Layout child frame to `Fill container` behave when the parent frame is resized?",
    options: [
      { id: "a", text: "The child automatically stretches to occupy all available width/height along the specified axis within the parent frame." },
      { id: "b", text: "The child retains a fixed pixel dimension regardless of parent size." },
      { id: "c", text: "The child frame shrinks to fit its own internal text exactly." },
      { id: "d", text: "The child is converted into a vector curve." },
    ],
    correctOptionId: "a",
    explanation: "`Fill container` adapts dynamically to parent frame dimensions, mimicking responsive flexbox expansion.",
  },
  {
    prompt: "What is the primary architectural purpose of using Component Variants and Component Properties in Figma design systems?",
    options: [
      { id: "a", text: "To consolidate multiple states (hover, disabled, active) and configurations (sizes, icons) into a single cohesive component with tidy property controls." },
      { id: "b", text: "To export components directly to production SQL databases." },
      { id: "c", text: "To prevent other designers from viewing the file." },
      { id: "d", text: "To convert vector drawings into 3D models." },
    ],
    correctOptionId: "a",
    explanation: "Variants and component properties organize component variations into a clean, unified design system API inside Figma.",
  },
  {
    prompt: "How do Figma Variables and Modes facilitate building scalable multi-theme (e.g. Light/Dark mode) or multi-brand design systems?",
    options: [
      { id: "a", text: "They bind design tokens (colors, radii, spacing) to variable collections where switching a Mode instantly re-themes the entire frame without duplicating components." },
      { id: "b", text: "They automatically generate Python backend code." },
      { id: "c", text: "They compress Figma files into MP3 format." },
      { id: "d", text: "They replace vectors with bitmap screenshots." },
    ],
    correctOptionId: "a",
    explanation: "Variables and Modes enable token-driven design systems, allowing seamless switching across dark/light and brand themes.",
  }
);

// 11.3 Wireframing
defineSkill(
  "wireframing",
  "Wireframing",
  "DESIGN_PRODUCT",
  "Low-fidelity user flows, layout exploration, and information architecture.",
  {
    prompt: "What is the primary rationale for keeping initial wireframes deliberately low-fidelity (grayscale, basic boxes, placeholder copy)?",
    options: [
      { id: "a", text: "To focus stakeholder attention on structure, content hierarchy, and user flows without getting distracted by visual styling, typography, or branding." },
      { id: "b", text: "Because low-fidelity wireframes are required by law before writing code." },
      { id: "c", text: "Low-fidelity wireframes cannot be shown to clients." },
      { id: "d", text: "To save ink when printing on monochrome printers." },
    ],
    correctOptionId: "a",
    explanation: "Low-fidelity wireframing prioritizes information architecture and navigation mechanics without aesthetic debates.",
  },
  {
    prompt: "When translating user journey maps into wireframe page structures, what guiding principle should govern screen layout?",
    options: [
      { id: "a", text: "Aligning layout elements with user task objectives and key mental models, ensuring critical calls to action are visible and obvious." },
      { id: "b", text: "Placing as many links and forms as possible on the screen." },
      { id: "c", text: "Hiding all navigation options behind hidden hamburger menus." },
      { id: "d", text: "Randomizing form input locations." },
    ],
    correctOptionId: "a",
    explanation: "Layouts must streamline user goal completion, placing core actions prominently to support natural cognitive flow.",
  },
  {
    prompt: "How does conducting early usability evaluations on clickable low-fidelity wireframes de-risk product engineering?",
    options: [
      { id: "a", text: "It identifies architectural navigation flaws, confusing terminology, and broken user journeys before expensive engineering resources are committed to code." },
      { id: "b", text: "It replaces automated unit testing in CI/CD." },
      { id: "c", text: "It guarantees that backend servers will never experience downtime." },
      { id: "d", text: "It eliminates the need for database indexing." },
    ],
    correctOptionId: "a",
    explanation: "Early concept validation with clickable wireframes uncovers usability friction when course-correction is fast and inexpensive.",
  }
);

// ==========================================
// 12. OTHER TECHNICAL FIELDS (5 skills)
// ==========================================

// 12.1 Computer Networks
defineSkill(
  "computer-networks",
  "Computer Networks",
  "SYSTEMS_EMBEDDED",
  "TCP/IP stack, BGP routing, DNS resolution, and socket programming.",
  {
    prompt: "What is the fundamental operational difference between Transmission Control Protocol (TCP) and User Datagram Protocol (UDP)?",
    options: [
      { id: "a", text: "TCP is connection-oriented, providing reliable, in-order packet delivery with flow control; UDP is connectionless and prioritizes low latency without delivery guarantees." },
      { id: "b", text: "UDP only works on local fiber optic cables." },
      { id: "c", text: "TCP does not support encryption; UDP always enforces TLS." },
      { id: "d", text: "TCP packet headers are smaller than UDP headers." },
    ],
    correctOptionId: "a",
    explanation: "TCP guarantees reliable, ordered stream delivery via acknowledgments and retransmissions; UDP provides minimal framing for speed.",
  },
  {
    prompt: "In the TCP 3-way handshake, what packet flags are exchanged between client and server to establish a connection?",
    options: [
      { id: "a", text: "SYN $\\rightarrow$ SYN-ACK $\\rightarrow$ ACK." },
      { id: "b", text: "FIN $\\rightarrow$ ACK $\\rightarrow$ RST." },
      { id: "c", text: "PING $\\rightarrow$ PONG $\\rightarrow$ OK." },
      { id: "d", text: "HELLO $\\rightarrow$ CHALLENGE $\\rightarrow$ CONNECT." },
    ],
    correctOptionId: "a",
    explanation: "The TCP handshake synchronizes initial sequence numbers using SYN, responds with SYN-ACK, and completes with client ACK.",
  },
  {
    prompt: "In global internet routing, how does Border Gateway Protocol (BGP) route traffic between Autonomous Systems (AS)?",
    options: [
      { id: "a", text: "It is a path-vector protocol that exchanges reachability information and AS-path attributes, applying peering policies to select routes." },
      { id: "b", text: "It calculates shortest physical distances using GPS coordinates." },
      { id: "c", text: "It broadcasts all packets to every computer connected to the internet." },
      { id: "d", text: "It uses distance-vector Bellman-Ford on a single central server." },
    ],
    correctOptionId: "a",
    explanation: "BGP is the internet's path-vector protocol, advertising CIDR prefixes with AS-PATH vectors to make policy-based routing decisions.",
  }
);

// 12.2 System Design
defineSkill(
  "system-design",
  "System Design",
  "SYSTEMS_EMBEDDED",
  "High availability, load balancing, caching layers, and database sharding.",
  {
    prompt: "Under the CAP Theorem, why can a distributed network system never simultaneously guarantee Consistency, Availability, and Partition Tolerance during a network split?",
    options: [
      { id: "a", text: "When a network partition ($P$) isolates nodes, the system must either accept writes and risk inconsistency ($AP$), or reject writes to preserve consistency ($CP$)." },
      { id: "b", text: "Distributed systems are physically capped at 3 nodes." },
      { id: "c", text: "Network switches cannot transmit encrypted data during partitions." },
      { id: "d", text: "The theorem only applies to single-core CPUs." },
    ],
    correctOptionId: "a",
    explanation: "Network partitions are unavoidable; during a partition, a system must choose between returning potentially stale reads (Availability) or failing requests (Consistency).",
  },
  {
    prompt: "What is the primary performance benefit of implementing a Content Delivery Network (CDN) in front of a web service?",
    options: [
      { id: "a", text: "It caches static and dynamic assets at edge points of presence (PoPs) close to users geographically, slashing round-trip latency and offloading origin servers." },
      { id: "b", text: "It converts relational databases into microservices." },
      { id: "c", text: "It allows web applications to run without servers." },
      { id: "d", text: "It automatically optimizes database indexing." },
    ],
    correctOptionId: "a",
    explanation: "CDNs terminate TCP/TLS connections close to end-users and serve cached assets from edge nodes, reducing origin load.",
  },
  {
    prompt: "When designing a high-throughput, globally distributed rate limiter, why is a Sliding Window Counter algorithm preferred over a Fixed Window Counter?",
    options: [
      { id: "a", text: "Fixed window algorithms allow traffic bursts of up to 2x the rate limit at window boundaries; sliding windows smooth traffic over rolling time intervals." },
      { id: "b", text: "Fixed windows require quantum computers." },
      { id: "c", text: "Sliding window algorithms use zero memory in Redis." },
      { id: "d", text: "Fixed window counters only work on weekends." },
    ],
    correctOptionId: "a",
    explanation: "Fixed windows suffer from boundary spikes (bursts at the end of window 1 and start of window 2); sliding windows enforce smooth limits.",
  }
);

// 12.3 Software Testing
defineSkill(
  "software-testing",
  "Software Testing",
  "SYSTEMS_EMBEDDED",
  "Unit, integration, contract testing, and test-driven development (TDD).",
  {
    prompt: "In the classic Software Testing Pyramid, what distribution of test types is recommended for high confidence and fast build times?",
    options: [
      { id: "a", text: "A broad base of fast, isolated Unit tests, a moderate layer of Integration tests, and a small, focused suite of end-to-end (E2E) tests." },
      { id: "b", text: "100% manual QA testing with zero automated tests." },
      { id: "c", text: "Exclusively end-to-end tests with no unit tests." },
      { id: "d", text: "An inverted ice-cream cone of slow UI tests only." },
    ],
    correctOptionId: "a",
    explanation: "Unit tests are fast and pinpoint root causes; integration tests verify boundaries; small E2E suites validate core business paths.",
  },
  {
    prompt: "What is the sequence of the Test-Driven Development (TDD) cycle?",
    options: [
      { id: "a", text: "Red (write a failing test) $\\rightarrow$ Green (write minimal code to make it pass) $\\rightarrow$ Refactor (clean and improve design while keeping tests green)." },
      { id: "b", text: "Deploy to production $\\rightarrow$ wait for customer bug reports $\\rightarrow$ patch code." },
      { id: "c", text: "Write all code first $\\rightarrow$ write tests if there is leftover time." },
      { id: "d", text: "Compile code $\\rightarrow$ run linter $\\rightarrow$ delete comments." },
    ],
    correctOptionId: "a",
    explanation: "TDD guides design and prevents regressions through the tight Red-Green-Refactor feedback cadence.",
  },
  {
    prompt: "What does Mutation Testing (e.g. using Stryker or Mutmut) measure that traditional line or branch code coverage cannot?",
    options: [
      { id: "a", text: "Test suite quality and fault-detection capability, by introducing synthetic bugs (mutants) into source code to verify that test suites actually catch and kill them." },
      { id: "b", text: "The CPU frequency of the test runner." },
      { id: "c", text: "How many lines of code were written per hour." },
      { id: "d", text: "The temperature of the server room." },
    ],
    correctOptionId: "a",
    explanation: "High code coverage can mask tests that lack assertions; mutation testing validates whether tests actually detect introduced defects.",
  }
);

// 12.4 Quality Assurance
defineSkill(
  "quality-assurance",
  "Quality Assurance",
  "SYSTEMS_EMBEDDED",
  "Automated regression testing, test planning, edge case analysis, and coverage gates.",
  {
    prompt: "In defect triage and bug tracking, what is the crucial difference between defect Severity and defect Priority?",
    options: [
      { id: "a", text: "Severity measures the technical and operational impact on the system (e.g. data loss vs typo); Priority measures the business urgency of when the bug must be resolved." },
      { id: "b", text: "Severity is determined by the developer; Priority is chosen randomly." },
      { id: "c", text: "Severity only applies to mobile apps." },
      { id: "d", text: "Both terms are exact synonyms." },
    ],
    correctOptionId: "a",
    explanation: "Severity reflects technical system impact (critical crash vs trivial); priority dictates scheduling urgency based on business risk.",
  },
  {
    prompt: "How does Boundary Value Analysis (BVA) guide test case selection for an input field accepting integers between 1 and 100?",
    options: [
      { id: "a", text: "Testing values directly at and immediately adjacent to the boundaries: 0, 1, 2, 99, 100, 101." },
      { id: "b", text: "Testing only number 50." },
      { id: "c", text: "Testing all prime numbers." },
      { id: "d", text: "Entering non-numeric emojis only." },
    ],
    correctOptionId: "a",
    explanation: "BVA focuses on edge conditions where off-by-one errors and boundary defects cluster mathematically.",
  },
  {
    prompt: "What is the primary role of an automated Regression Test Suite in continuous release environments?",
    options: [
      { id: "a", text: "Ensuring that new feature releases and code modifications do not unintentionally break or degrade existing operational functionality." },
      { id: "b", text: "Translating code comments into Spanish." },
      { id: "c", text: "Checking developer attendance." },
      { id: "d", text: "Formatting Markdown files." },
    ],
    correctOptionId: "a",
    explanation: "Regression suites verify that baseline system behavior remains intact following new code changes or dependency upgrades.",
  }
);

// 12.5 Automation
defineSkill(
  "automation",
  "Automation",
  "SYSTEMS_EMBEDDED",
  "Headless browser scripting, API test suites, synthetic monitoring, and task runners.",
  {
    prompt: "In modern end-to-end browser automation (e.g. Playwright / Puppeteer), why should hardcoded arbitrary sleeps (`await sleep(5000)`) be avoided?",
    options: [
      { id: "a", text: "They make test suites slow and cause flaky test failures under variable CI load; tests should wait explicitly for specific element states, network responses, or DOM events." },
      { id: "b", text: "The browser hangs permanently if sleep is called." },
      { id: "c", text: "Sleep requires root permissions." },
      { id: "d", text: "Modern browsers do not support timers." },
    ],
    correctOptionId: "a",
    explanation: "Explicit condition waits (auto-waiting for selector visibility, network idle) eliminate test flakiness and execute as fast as the system permits.",
  },
  {
    prompt: "When writing automated API regression tests in CI, what strategy ensures tests are deterministic and do not corrupt live production data?",
    options: [
      { id: "a", text: "Running tests against dedicated isolated test environments or ephemeral database containers seeded with known fixture state and tearing them down after runs." },
      { id: "b", text: "Executing test mutations directly against the live production customer database." },
      { id: "c", text: "Running tests with network cables unplugged." },
      { id: "d", text: "Skipping all assertions in test scripts." },
    ],
    correctOptionId: "a",
    explanation: "Isolated test databases with fresh fixtures prevent data contamination and ensure test repeatability across builds.",
  },
  {
    prompt: "How does synthetic monitoring (active canary automation) differ from passive real-user monitoring (RUM) in production reliability engineering?",
    options: [
      { id: "a", text: "Synthetic monitoring periodically runs scripted robotic transactions against production endpoints to proactively detect outages before real users are impacted." },
      { id: "b", text: "Synthetic monitoring only runs during power outages." },
      { id: "c", text: "RUM requires installing software on customer smartphones." },
      { id: "d", text: "Synthetic monitoring cannot measure HTTP response codes." },
    ],
    correctOptionId: "a",
    explanation: "Synthetic monitors execute active probes continuously, surfacing downtimes or latency regressions even during low-traffic periods.",
  }
);

console.log("Seeded Part 5 (Mobile, Design, Systems/Testing/Automation):", skills.length);
fs.writeFileSync("backend/src/services/skills/questionData_part5.json", JSON.stringify(skills, null, 2));
