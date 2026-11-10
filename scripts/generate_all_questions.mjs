import fs from "fs";
import path from "path";

// Master Authoring Engine for TrustToPay Phase 2 Demonstration Assessment Question Banks
// Total Target: 83 skills, 249 questions (83 L1 Foundation, 83 L2 Practitioner, 83 L3 Advanced)

const rawSkills = [];

function defineSkill(slug, name, category, description, l1, l2, l3) {
  rawSkills.push({
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
// 1. PROGRAMMING LANGUAGES (13 skills)
// ==========================================

// 1.1 TypeScript
defineSkill(
  "typescript",
  "TypeScript",
  "PROGRAMMING",
  "Strict typing, runtime schema guards, generic algebra, and resilient async concurrency.",
  {
    prompt: "Given `function parseAmount(input: unknown): number`, which approach safely narrows `input` before arithmetic under `strict: true`?",
    options: [
      { id: "a", text: "Use `typeof input === 'number' && Number.isFinite(input)` before returning." },
      { id: "b", text: "Cast `input as any as number` and multiply by 100." },
      { id: "c", text: "Use `Boolean(input)` to narrow `unknown` to `number`." },
      { id: "d", text: "Disable `strictNullChecks` in tsconfig.json." },
    ],
    correctOptionId: "a",
    explanation: "Runtime type guards (`typeof` + `Number.isFinite`) safely narrow `unknown` to a finite `number`.",
  },
  {
    prompt: "A worker pool loops over tasks calling `await fetch(url)` without a timeout and stalls when upstream hangs. What is the idiomatic fix in Node 20+?",
    options: [
      { id: "a", text: "Pass `signal: AbortSignal.timeout(ms)` (or an `AbortController` timer) to `fetch` and handle abort errors." },
      { id: "b", text: "Wrap `fetch` in `setTimeout(() => {}, 0)` without awaiting the promise." },
      { id: "c", text: "Increase the worker pool size to 10,000 concurrent promises." },
      { id: "d", text: "Catch errors with an empty `catch {}` block outside the loop." },
    ],
    correctOptionId: "a",
    explanation: "`AbortSignal.timeout` bounds request latency and prevents worker starvation.",
  },
  {
    prompt: "Two concurrent webhook requests arrive with the same `eventId`. How do you prevent double-crediting a ledger in a transactional backend?",
    options: [
      { id: "a", text: "Enforce a unique constraint on `(provider, eventId)` or `idempotencyKey` inside the database transaction and treat duplicate key conflicts as idempotent no-ops." },
      { id: "b", text: "Store processed IDs in a local variable inside the Express route handler." },
      { id: "c", text: "Wait 500ms before processing every webhook." },
      { id: "d", text: "Trust the caller never to retry a webhook." },
    ],
    correctOptionId: "a",
    explanation: "Database-level unique constraints combined with transactional state updates guarantee idempotency under concurrent retries.",
  }
);

// 1.2 Python
defineSkill(
  "python",
  "Python",
  "PROGRAMMING",
  "Idiomatic Python 3.12+, generator pipelines, asyncio, and typing protocols.",
  {
    prompt: "Why is `def append_item(item: str, bucket: list[str] = []):` dangerous in Python?",
    options: [
      { id: "a", text: "Default list `[]` is evaluated once at function definition time and shared across calls that omit `bucket`." },
      { id: "b", text: "Python raises a SyntaxError when a list is used as a default parameter." },
      { id: "c", text: "Type hints automatically deep-copy default arguments at runtime." },
      { id: "d", text: "Lists cannot store strings in Python 3." },
    ],
    correctOptionId: "a",
    explanation: "Mutable default arguments persist across invocations unless defaulted to `None` and initialized inside the body.",
  },
  {
    prompt: "When calculating financial payouts in Python, why should `decimal.Decimal` or integer minor units be used instead of `float`?",
    options: [
      { id: "a", text: "IEEE 754 binary floating-point cannot represent base-10 fractions like `0.1 + 0.2` exactly, causing rounding drift." },
      { id: "b", text: "`float` only supports positive numbers in Python." },
      { id: "c", text: "`Decimal` executes on the GPU automatically." },
      { id: "d", text: "JSON serializers reject integers." },
    ],
    correctOptionId: "a",
    explanation: "Integer minor units (cents) or `Decimal` avoid binary floating-point representation errors.",
  },
  {
    prompt: "Which pattern prevents command injection when invoking an external binary with user-supplied filenames in Python?",
    options: [
      { id: "a", text: "Pass an argument list `subprocess.run(['git', 'diff', '--', filename], shell=False, check=True, timeout=5)`." },
      { id: "b", text: "Use `os.system(f'git diff {filename}')`." },
      { id: "c", text: "Use `subprocess.Popen(cmd, shell=True)`." },
      { id: "d", text: "Use `eval(filename)` before running the command." },
    ],
    correctOptionId: "a",
    explanation: "`shell=False` with an explicit argv list and `--` prevents shell metacharacter interpretation.",
  }
);

// 1.3 C
defineSkill(
  "c",
  "C",
  "PROGRAMMING",
  "Memory layout, pointers, system calls, memory safety, and POSIX standards.",
  {
    prompt: "In C, what is the result of applying `sizeof(arr)` to a parameter declared as `int arr[10]` inside a function?",
    options: [
      { id: "a", text: "It yields `sizeof(int*)` because array parameters decay to pointers when passed to functions." },
      { id: "b", text: "It yields `10 * sizeof(int)` (e.g. 40 bytes on 32-bit int systems)." },
      { id: "c", text: "It triggers a compile-time syntax error." },
      { id: "d", text: "It always yields 0." },
    ],
    correctOptionId: "a",
    explanation: "Array arguments in C function declarations decay into pointers, so `sizeof` evaluates to pointer size.",
  },
  {
    prompt: "Which memory safety bug occurs when a program continues reading or writing a buffer after calling `free(ptr)`?",
    options: [
      { id: "a", text: "Use-After-Free (UAF), leading to potential arbitrary memory corruption or code execution." },
      { id: "b", text: "Memory leak caused by unreferenced heap allocations." },
      { id: "c", text: "Stack overflow caused by unbounded recursion." },
      { id: "d", text: "Integer underflow in the memory manager." },
    ],
    correctOptionId: "a",
    explanation: "Dereferencing freed memory is a Use-After-Free condition that leads to unpredictable memory corruption.",
  },
  {
    prompt: "When writing a lock-free queue in C11 using `<stdatomic.h>`, which memory order should be paired with publishing a newly allocated node pointer to a consumer thread?",
    options: [
      { id: "a", text: "`memory_order_release` on store by the producer and `memory_order_acquire` on load by the consumer." },
      { id: "b", text: "`memory_order_relaxed` on both producer and consumer." },
      { id: "c", text: "`memory_order_consume` on store and `memory_order_relaxed` on load." },
      { id: "d", text: "No memory ordering is required because atomic pointers guarantee hardware cache flushes." },
    ],
    correctOptionId: "a",
    explanation: "Release-acquire synchronization establishes a happens-before relationship between producer and consumer.",
  }
);

// 1.4 C++
defineSkill(
  "cpp",
  "C++",
  "PROGRAMMING",
  "Modern C++20/23, RAII, templates, STL containers, and concurrency models.",
  {
    prompt: "What core architectural advantage does Resource Acquisition Is Initialization (RAII) provide in modern C++?",
    options: [
      { id: "a", text: "Resources (memory, file handles, mutexes) are tied to object lifetimes and released automatically during stack unwinding." },
      { id: "b", text: "It forces the compiler to run a tracing garbage collector like Java." },
      { id: "c", text: "It disables all exception handling in the translation unit." },
      { id: "d", text: "It converts dynamic heap allocations into static compile-time constants." },
    ],
    correctOptionId: "a",
    explanation: "RAII guarantees deterministic resource cleanup via destructors, even when exceptions are thrown.",
  },
  {
    prompt: "In modern C++, what is the difference between `std::move` and `std::forward`?",
    options: [
      { id: "a", text: "`std::move` unconditionally casts to an rvalue reference, whereas `std::forward` conditionally casts preserving value category." },
      { id: "b", text: "`std::forward` deep-copies the object, while `std::move` deletes it." },
      { id: "c", text: "`std::move` allocates heap memory, while `std::forward` operates on the stack." },
      { id: "d", text: "`std::forward` is only valid for non-template functions." },
    ],
    correctOptionId: "a",
    explanation: "`std::move` is an unconditional rvalue cast; `std::forward` performs perfect forwarding of universal references.",
  },
  {
    prompt: "Under the C++ memory model, what consequence does a data race between two unsynchronized threads accessing a non-atomic variable have?",
    options: [
      { id: "a", text: "Undefined Behavior (UB), allowing the compiler to perform unsound optimizations or emit corrupted instructions." },
      { id: "b", text: "The CPU halts and throws a hardware `std::data_race_exception`." },
      { id: "c", text: "The variable silently defaults to zero." },
      { id: "d", text: "The operating system automatically injects a spinlock." },
    ],
    correctOptionId: "a",
    explanation: "Any data race in C++ is undefined behavior under the ISO standard.",
  }
);

// 1.5 C#
defineSkill(
  "csharp",
  "C#",
  "PROGRAMMING",
  ".NET 8+, async task pipelines, LINQ optimization, and enterprise architecture.",
  {
    prompt: "In C# 8+, what is the purpose of enabling nullable reference types (`<Nullable>enable</Nullable>`)?",
    options: [
      { id: "a", text: "It provides compile-time static analysis and warnings when non-nullable reference types might be assigned null." },
      { id: "b", text: "It forces the runtime to box all value types." },
      { id: "c", text: "It converts `null` into an empty string automatically." },
      { id: "d", text: "It replaces garbage collection with automatic reference counting." },
    ],
    correctOptionId: "a",
    explanation: "Nullable reference types enforce compile-time null safety to eliminate NullReferenceExceptions.",
  },
  {
    prompt: "Why is invoking `.Result` or `.Wait()` on an incomplete `Task` inside a ASP.NET Core controller thread hazardous?",
    options: [
      { id: "a", text: "It blocks the thread-pool thread synchronously, which can exhaust the thread pool and cause deadlocks." },
      { id: "b", text: "It causes the garbage collector to immediately terminate the process." },
      { id: "c", text: "It corrupts the HTTP header buffers." },
      { id: "d", text: "It is disallowed by the C# compiler." },
    ],
    correctOptionId: "a",
    explanation: "Sync-over-async blocks threadpool threads, causing severe thread-pool starvation under load.",
  },
  {
    prompt: "What primary performance benefit does `ReadOnlySpan<char>` offer over `string.Substring()` when parsing high-throughput network packets in .NET?",
    options: [
      { id: "a", text: "It slices contiguous memory without allocating a new heap object or triggering garbage collection." },
      { id: "b", text: "It encrypts the payload in hardware." },
      { id: "c", text: "It runs parsing concurrently across all CPU cores." },
      { id: "d", text: "It automatically caches the result in Redis." },
    ],
    correctOptionId: "a",
    explanation: "`Span<T>` and `ReadOnlySpan<T>` represent contiguous memory slices without GC heap allocations.",
  }
);

// 1.6 Java
defineSkill(
  "java",
  "Java",
  "PROGRAMMING",
  "JVM internals, Spring ecosystem, garbage collection tuning, and multi-threading.",
  {
    prompt: "In Java, what is the fundamental difference between evaluating `str1 == str2` and `str1.equals(str2)` for String instances?",
    options: [
      { id: "a", text: "`==` tests reference identity (same memory address), whereas `.equals()` tests character sequence equality." },
      { id: "b", text: "`.equals()` tests reference identity, while `==` compares contents." },
      { id: "c", text: "`==` is only valid for primitive numeric types." },
      { id: "d", text: "Both are identical because strings are always interned." },
    ],
    correctOptionId: "a",
    explanation: "`==` compares memory addresses, while `equals` compares character content equality.",
  },
  {
    prompt: "Why is `ConcurrentHashMap` preferable to `Collections.synchronizedMap` in high-throughput concurrent Java applications?",
    options: [
      { id: "a", text: "It uses lock striping and fine-grained bucket synchronization, allowing multiple concurrent reads and writes." },
      { id: "b", text: "It disables locking completely by copying the entire map on every write." },
      { id: "c", text: "It serializes entries directly to off-heap disk storage." },
      { id: "d", text: "It runs strictly on Virtual Threads." },
    ],
    correctOptionId: "a",
    explanation: "`ConcurrentHashMap` uses segmented locking and CAS operations for concurrent access without global lock contention.",
  },
  {
    prompt: "Which JVM garbage collector is specifically optimized for ultra-low latency (< 1ms pause times) on large terabyte-scale heaps?",
    options: [
      { id: "a", text: "ZGC (Z Garbage Collector), which performs reference processing and heap compaction concurrently." },
      { id: "b", text: "Serial GC, which stops all application threads during collection." },
      { id: "c", text: "Parallel GC, which maximizes batch throughput with stop-the-world pauses." },
      { id: "d", text: "CMS (Concurrent Mark Sweep), which is the default in Java 21." },
    ],
    correctOptionId: "a",
    explanation: "ZGC and Shenandoah are concurrent generational low-latency collectors targeting sub-millisecond pauses.",
  }
);

// 1.7 JavaScript
defineSkill(
  "javascript",
  "JavaScript",
  "PROGRAMMING",
  "Modern ECMAScript, event loop, closures, prototypes, and asynchronous execution.",
  {
    prompt: "In the JavaScript runtime event loop, which task queue has execution priority immediately following the current synchronous turn?",
    options: [
      { id: "a", text: "The microtask queue (e.g. `Promise.then`, `queueMicrotask`, `MutationObserver`)." },
      { id: "b", text: "The macrotask queue (e.g. `setTimeout`, `setInterval`)." },
      { id: "c", text: "The I/O polling queue." },
      { id: "d", text: "The requestIdleCallback queue." },
    ],
    correctOptionId: "a",
    explanation: "The microtask queue is drained completely before processing the next macrotask.",
  },
  {
    prompt: "How can a long-lived closure lead to a memory leak in a single-page JavaScript application?",
    options: [
      { id: "a", text: "By retaining references to detached DOM nodes or large buffers in its lexical scope that the GC cannot collect." },
      { id: "b", text: "By causing the call stack to overflow into heap memory." },
      { id: "c", text: "By disabling V8 JIT compilation permanently." },
      { id: "d", text: "By preventing `JSON.stringify` from serializing objects." },
    ],
    correctOptionId: "a",
    explanation: "Closures capture variables in their outer scope; retaining them prevents garbage collection.",
  },
  {
    prompt: "Which browser security cookie flag prevents client-side JavaScript (`document.cookie`) from reading an authentication session token?",
    options: [
      { id: "a", text: "`HttpOnly`, which restricts cookie access exclusively to HTTP requests." },
      { id: "b", text: "`SameSite=Strict`, which disables HTTPS." },
      { id: "c", text: "`Secure`, which hides the cookie from the devtools inspector." },
      { id: "d", text: "`Domain`, which matches subdomains only." },
    ],
    correctOptionId: "a",
    explanation: "`HttpOnly` cookies cannot be accessed via JavaScript APIs, mitigating token theft via XSS.",
  }
);

// 1.8 Go
defineSkill(
  "go",
  "Go",
  "PROGRAMMING",
  "Goroutines, channels, interfaces, memory allocation, and high-throughput networking.",
  {
    prompt: "In Go, what occurs if a goroutine attempts to send to an unbuffered channel when no other goroutine is receiving from it?",
    options: [
      { id: "a", text: "The sending goroutine blocks until another goroutine initiates a read on the channel." },
      { id: "b", text: "The send fails immediately and returns an error." },
      { id: "c", text: "The message is dropped silently and execution continues." },
      { id: "d", text: "Go automatically converts the channel into a buffered channel of size 100." },
    ],
    correctOptionId: "a",
    explanation: "Unbuffered channel sends block until a receiver is ready, ensuring synchronous rendezvous.",
  },
  {
    prompt: "Why must `sync.Mutex` and `sync.WaitGroup` always be passed to functions by pointer rather than by value in Go?",
    options: [
      { id: "a", text: "Passing by value copies the struct and its internal synchronization state, defeating the lock and triggering race conditions." },
      { id: "b", text: "The Go compiler emits a fatal compilation error if structs are passed by value." },
      { id: "c", text: "Pointers run on the garbage collector heap while values run in registers." },
      { id: "d", text: "Go channels only accept pointer types." },
    ],
    correctOptionId: "a",
    explanation: "`sync.Mutex` must not be copied; copying duplicates the lock state and breaks mutual exclusion.",
  },
  {
    prompt: "In the Go runtime scheduler (GMP model), what mechanism ensures long-running compute loops without function calls do not starve other goroutines?",
    options: [
      { id: "a", text: "Asynchronous preemption via OS signals (SIGURG on Unix) introduced in Go 1.14." },
      { id: "b", text: "The operating system automatically kills non-yielding goroutines." },
      { id: "c", text: "Manual calls to `runtime.GC()` every 10 milliseconds." },
      { id: "d", text: "Hardware hyperthreading interrupts on the CPU." },
    ],
    correctOptionId: "a",
    explanation: "Go 1.14+ uses signal-based asynchronous preemption to interrupt tight computational loops.",
  }
);

// 1.9 Rust
defineSkill(
  "rust",
  "Rust",
  "PROGRAMMING",
  "Borrow checker, zero-cost abstractions, unsafe audits, and Tokio async runtimes.",
  {
    prompt: "In Rust, what happens when a variable of a non-`Copy` type (such as `String`) is assigned to another variable?",
    options: [
      { id: "a", text: "Ownership moves to the new variable, and the original variable becomes invalid and unreadable." },
      { id: "b", text: "A deep heap copy is automatically allocated." },
      { id: "c", text: "The original variable becomes an immutable reference." },
      { id: "d", text: "A runtime reference counter increments." },
    ],
    correctOptionId: "a",
    explanation: "Rust employs move semantics by default for non-Copy types to enforce single ownership.",
  },
  {
    prompt: "When is `RefCell<T>` used in Rust, and what risk does it introduce?",
    options: [
      { id: "a", text: "It enables interior mutability by moving borrow checks to runtime; violating borrow rules causes a runtime panic." },
      { id: "b", text: "It allows multi-threaded lock-free sharing without atomic operations." },
      { id: "c", text: "It compiles down to raw C pointers without bounds checking." },
      { id: "d", text: "It replaces memory allocation with garbage collection." },
    ],
    correctOptionId: "a",
    explanation: "`RefCell<T>` enforces the borrowing rules dynamically at runtime and panics on violation.",
  },
  {
    prompt: "Why must asynchronous futures that contain self-referential structures be pinned (`Pin<&mut T>`) before polling in Rust?",
    options: [
      { id: "a", text: "Pinning guarantees the memory address will not move, ensuring internal pointers remain valid." },
      { id: "b", text: "Pinning allocates the future directly into CPU L1 cache." },
      { id: "c", text: "Pinning tells the Tokio executor to prioritize the future." },
      { id: "d", text: "Pinning bypasses the borrow checker entirely." },
    ],
    correctOptionId: "a",
    explanation: "`Pin` guarantees that pointees cannot be moved in memory, preserving self-referential pointers.",
  }
);

// 1.10 PHP
defineSkill(
  "php",
  "PHP",
  "PROGRAMMING",
  "Modern PHP 8.3, Laravel architecture, OPcache, and web application security.",
  {
    prompt: "In PHP, what is the key difference between `$a == $b` and `$a === $b`?",
    options: [
      { id: "a", text: "`===` checks both value and type without type coercion, whereas `==` coerces types before comparison." },
      { id: "b", text: "`==` is only valid for objects, while `===` is for primitives." },
      { id: "c", text: "`===` throws a TypeError if types do not match." },
      { id: "d", text: "`==` compares memory pointers." },
    ],
    correctOptionId: "a",
    explanation: "Strict comparison (`===`) requires identical types and values without type juggling.",
  },
  {
    prompt: "Which database interaction method in PHP guarantees protection against SQL injection?",
    options: [
      { id: "a", text: "PDO with prepared statements and bound parameters." },
      { id: "b", text: "Concatenating user inputs after escaping with `addslashes()`." },
      { id: "c", text: "Using `strip_tags()` on query strings." },
      { id: "d", text: "Running queries inside a `try ... catch` block." },
    ],
    correctOptionId: "a",
    explanation: "Prepared statements send query structure and parameters separately to the database engine.",
  },
  {
    prompt: "In high-throughput PHP 8+ architectures, how does OPcache preloading improve request latency?",
    options: [
      { id: "a", text: "It compiles framework and library classes into shared memory once on server startup, eliminating per-request file parsing." },
      { id: "b", text: "It converts PHP scripts into native C dynamic libraries." },
      { id: "c", text: "It keeps database connections open indefinitely across worker restarts." },
      { id: "d", text: "It caches HTTP responses at the web server reverse proxy level." },
    ],
    correctOptionId: "a",
    explanation: "OPcache preloading parses and compiles files into persistent memory on startup, removing compilation overhead.",
  }
);

// 1.11 Ruby
defineSkill(
  "ruby",
  "Ruby",
  "PROGRAMMING",
  "Ruby on Rails, metaprogramming, blocks/lambdas, and testing with RSpec.",
  {
    prompt: "In Ruby, how does a `lambda` differ from a standard `Proc`?",
    options: [
      { id: "a", text: "A lambda checks the number of arguments strictly and a `return` exits the lambda, whereas a Proc returns from the enclosing method." },
      { id: "b", text: "A lambda cannot take arguments." },
      { id: "c", text: "A Proc cannot be passed as a block." },
      { id: "d", text: "A lambda executes in a separate operating system process." },
    ],
    correctOptionId: "a",
    explanation: "Lambdas enforce strict arity and return locally; Procs return from the caller's context.",
  },
  {
    prompt: "In Ruby on Rails ActiveRecord, how do you prevent the N+1 database query problem when displaying authors with their posts?",
    options: [
      { id: "a", text: "Use `Post.includes(:author)` to eager-load the associated records in a single query." },
      { id: "b", text: "Iterate over `Post.all` with a `.each` loop." },
      { id: "c", text: "Disable SQL query logging in production." },
      { id: "d", text: "Wrap each query in `ActiveRecord::Base.transaction`." },
    ],
    correctOptionId: "a",
    explanation: "`includes` or `preload` eager-loads associations, avoiding repeated per-record SELECT queries.",
  },
  {
    prompt: "What is the primary constraint imposed by CRuby's Global VM Lock (GVL / GIL) on multi-threaded Ruby code?",
    options: [
      { id: "a", text: "Only one thread can execute Ruby bytecode at a time, preventing true CPU parallelism for CPU-bound tasks." },
      { id: "b", text: "Threads cannot perform non-blocking socket I/O." },
      { id: "c", text: "Garbage collection is disabled in multi-threaded programs." },
      { id: "d", text: "Maximum thread count is limited to 4." },
    ],
    correctOptionId: "a",
    explanation: "The GVL serializes Ruby execution so CPU-heavy tasks do not utilize multiple cores without Ractors or processes.",
  }
);

// 1.12 SQL
defineSkill(
  "sql",
  "SQL",
  "PROGRAMMING",
  "Complex joins, window functions, CTEs, query plan optimization, and indexing.",
  {
    prompt: "What is the primary functional difference between the `WHERE` clause and the `HAVING` clause in SQL?",
    options: [
      { id: "a", text: "`WHERE` filters individual rows before aggregation; `HAVING` filters aggregated group results after `GROUP BY`." },
      { id: "b", text: "`HAVING` can only be used with primary keys." },
      { id: "c", text: "`WHERE` requires a subquery, while `HAVING` does not." },
      { id: "d", text: "Both clauses are interchangeable in standard SQL." },
    ],
    correctOptionId: "a",
    explanation: "`WHERE` applies before aggregation on raw rows; `HAVING` filters after `GROUP BY` on aggregate values.",
  },
  {
    prompt: "Why does a query containing `WHERE email LIKE '%@gmail.com'` typically fail to use a B-tree index on the `email` column?",
    options: [
      { id: "a", text: "The leading wildcard `%` prevents the B-tree index from traversing sorted prefix keys, forcing a sequential table scan." },
      { id: "b", text: "B-tree indexes only support integer data types." },
      { id: "c", text: "SQL engines prohibit string comparisons on indexed columns." },
      { id: "d", text: "The query planner always disables indexes when `@` is present." },
    ],
    correctOptionId: "a",
    explanation: "Standard B-tree indexes require left-anchored prefixes; leading wildcards invalidate index tree navigation.",
  },
  {
    prompt: "Under the `REPEATABLE READ` transaction isolation level in PostgreSQL, what anomaly is prevented that can occur under `READ COMMITTED`?",
    options: [
      { id: "a", text: "Non-repeatable reads: reading the same row twice within a transaction will never see modifications committed by other transactions." },
      { id: "b", text: "Dirty writes on uncommitted transactions." },
      { id: "c", text: "Deadlocks between concurrent update transactions." },
      { id: "d", text: "Index fragmentation on disk." },
    ],
    correctOptionId: "a",
    explanation: "Repeatable Read takes a snapshot at transaction start, preventing non-repeatable reads.",
  }
);

// 1.13 Bash
defineSkill(
  "bash",
  "Bash",
  "PROGRAMMING",
  "Shell scripting, pipelines, process management, POSIX utilities, and automation.",
  {
    prompt: "Why should shell variables always be double-quoted (e.g. `\"$filename\"`) when referenced in Bash scripts?",
    options: [
      { id: "a", text: "To prevent word splitting and globbing if the variable contains spaces or special characters." },
      { id: "b", text: "To convert integers into strings automatically." },
      { id: "c", text: "To encrypt variable contents in the process table." },
      { id: "d", text: "To permit the variable to be exported to child processes." },
    ],
    correctOptionId: "a",
    explanation: "Unquoted variables undergo word splitting and globbing expansion, causing errors or security bugs.",
  },
  {
    prompt: "What is the recommended Bash safety preamble to ensure a script fails fast on errors, undefined variables, and pipeline failures?",
    options: [
      { id: "a", text: "`set -euo pipefail`" },
      { id: "b", text: "`set +x`" },
      { id: "c", text: "`shopt -s nullglob`" },
      { id: "d", text: "`trap '' SIGINT`" },
    ],
    correctOptionId: "a",
    explanation: "`set -euo pipefail` exits on error (`-e`), treats unset variables as errors (`-u`), and preserves pipeline failure codes (`-o pipefail`).",
  },
  {
    prompt: "How can a recurring Bash script ensure that only one instance runs at any given time, preventing cron job pileups?",
    options: [
      { id: "a", text: "Use `flock` on an open file descriptor or lockfile to acquire an exclusive non-blocking lock." },
      { id: "b", text: "Check `ps aux | grep script.sh` and parse the output." },
      { id: "c", text: "Delete `/tmp` on script start." },
      { id: "d", text: "Sleep for 60 seconds before executing." },
    ],
    correctOptionId: "a",
    explanation: "`flock` provides kernel-level atomic advisory locking, preventing race conditions inherent in manual PID files.",
  }
);

console.log("Seeded 13 Programming Language skills.");
fs.writeFileSync("backend/src/services/skills/questionData_part1.json", JSON.stringify(rawSkills, null, 2));
