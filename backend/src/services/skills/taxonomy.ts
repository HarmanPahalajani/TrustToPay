export type SkillCategoryDefinition = {
  id: string;
  name: string;
  description: string;
};

export type SkillTaxonomyItem = {
  slug: string;
  name: string;
  categoryId: string;
  categoryName: string;
  description: string;
  isAssessed: boolean;
};

export const SKILL_CATEGORIES: SkillCategoryDefinition[] = [
  { id: "programming", name: "Programming Languages", description: "Core languages for systems, applications, and scripting." },
  { id: "frontend", name: "Frontend Development", description: "Browser interfaces, UI components, styling, and client-side performance." },
  { id: "backend", name: "Backend Development", description: "Server runtimes, REST/GraphQL APIs, microservices, and auth systems." },
  { id: "ai", name: "Artificial Intelligence", description: "LLMs, RAG architectures, agentic workflows, and generative models." },
  { id: "data-science", name: "Data Science & Engineering", description: "Pipelines, ETL, analytics, statistics, and business intelligence." },
  { id: "ml-frameworks", name: "Machine Learning Frameworks", description: "Deep learning libraries, training frameworks, and computer vision." },
  { id: "cloud-devops", name: "Cloud & DevOps", description: "Cloud providers, container orchestration, IaC, and CI/CD pipelines." },
  { id: "databases", name: "Databases & Storage", description: "Relational, document, and key-value datastores and database design." },
  { id: "cybersecurity", name: "Cybersecurity", description: "AppSec, network security, penetration testing, and IAM architecture." },
  { id: "mobile", name: "Mobile Development", description: "Native and cross-platform mobile frameworks for iOS and Android." },
  { id: "design-product", name: "Design & Product", description: "UI/UX design, wireframing, design systems, and product architecture." },
  { id: "systems-embedded", name: "Other Technical Fields", description: "Embedded systems, IoT, robotics, hardware, and QA automation." },
];

export const SKILL_TAXONOMY: SkillTaxonomyItem[] = [
  // Programming Languages
  { slug: "typescript", name: "TypeScript", categoryId: "programming", categoryName: "Programming Languages", description: "Strict typing, runtime schema guards, generic algebra, and resilient async concurrency.", isAssessed: true },
  { slug: "python", name: "Python", categoryId: "programming", categoryName: "Programming Languages", description: "Idiomatic Python 3.12+, generator pipelines, asyncio, and typing protocols.", isAssessed: true },
  { slug: "c", name: "C", categoryId: "programming", categoryName: "Programming Languages", description: "Memory layout, pointers, system calls, memory safety, and POSIX standards.", isAssessed: true },
  { slug: "cpp", name: "C++", categoryId: "programming", categoryName: "Programming Languages", description: "Modern C++20/23, RAII, templates, STL containers, and concurrency models.", isAssessed: true },
  { slug: "csharp", name: "C#", categoryId: "programming", categoryName: "Programming Languages", description: ".NET 8+, async task pipelines, LINQ optimization, and enterprise architecture.", isAssessed: true },
  { slug: "java", name: "Java", categoryId: "programming", categoryName: "Programming Languages", description: "JVM internals, Spring ecosystem, garbage collection tuning, and multi-threading.", isAssessed: true },
  { slug: "javascript", name: "JavaScript", categoryId: "programming", categoryName: "Programming Languages", description: "Modern ECMAScript, event loop, closures, prototypes, and asynchronous execution.", isAssessed: true },
  { slug: "go", name: "Go", categoryId: "programming", categoryName: "Programming Languages", description: "Goroutines, channels, interfaces, memory allocation, and high-throughput networking.", isAssessed: true },
  { slug: "rust", name: "Rust", categoryId: "programming", categoryName: "Programming Languages", description: "Borrow checker, zero-cost abstractions, unsafe audits, and Tokio async runtimes.", isAssessed: true },
  { slug: "php", name: "PHP", categoryId: "programming", categoryName: "Programming Languages", description: "Modern PHP 8.3, Laravel architecture, OPcache, and web application security.", isAssessed: true },
  { slug: "ruby", name: "Ruby", categoryId: "programming", categoryName: "Programming Languages", description: "Ruby on Rails, metaprogramming, blocks/lambdas, and testing with RSpec.", isAssessed: true },
  { slug: "swift", name: "Swift", categoryId: "programming", categoryName: "Programming Languages", description: "Swift 6 concurrency, value types, protocols, ARC, and Apple platform SDKs.", isAssessed: false },
  { slug: "kotlin", name: "Kotlin", categoryId: "programming", categoryName: "Programming Languages", description: "Coroutines, null safety, extension functions, and multiplatform programming.", isAssessed: false },
  { slug: "dart", name: "Dart", categoryId: "programming", categoryName: "Programming Languages", description: "Strong typing, sound null safety, isolates, and asynchronous streams.", isAssessed: false },
  { slug: "r", name: "R", categoryId: "programming", categoryName: "Programming Languages", description: "Statistical modeling, dataframes, tidyverse, and data visualization.", isAssessed: false },
  { slug: "matlab", name: "MATLAB", categoryId: "programming", categoryName: "Programming Languages", description: "Matrix algorithms, signal processing, numerical optimization, and simulation.", isAssessed: false },
  { slug: "sql", name: "SQL", categoryId: "programming", categoryName: "Programming Languages", description: "Complex joins, window functions, CTEs, query plan optimization, and indexing.", isAssessed: true },
  { slug: "bash", name: "Bash", categoryId: "programming", categoryName: "Programming Languages", description: "Shell scripting, pipelines, process management, POSIX utilities, and automation.", isAssessed: true },

  // Frontend Development
  { slug: "html", name: "HTML", categoryId: "frontend", categoryName: "Frontend Development", description: "Semantic markup, accessibility (ARIA), SEO standards, and document structure.", isAssessed: true },
  { slug: "css", name: "CSS", categoryId: "frontend", categoryName: "Frontend Development", description: "CSS Grid, Flexbox, container queries, animations, and custom properties.", isAssessed: true },
  { slug: "react", name: "React", categoryId: "frontend", categoryName: "Frontend Development", description: "Component lifecycle, hooks, state synchronization, and render optimization.", isAssessed: true },
  { slug: "nextjs", name: "Next.js", categoryId: "frontend", categoryName: "Frontend Development", description: "App router, React Server Components, streaming SSR, and edge rendering.", isAssessed: true },
  { slug: "vue", name: "Vue.js", categoryId: "frontend", categoryName: "Frontend Development", description: "Composition API, reactivity system, Pinia state, and SFC architecture.", isAssessed: true },
  { slug: "angular", name: "Angular", categoryId: "frontend", categoryName: "Frontend Development", description: "Signals, standalone components, dependency injection, and RxJS pipelines.", isAssessed: true },
  { slug: "svelte", name: "Svelte", categoryId: "frontend", categoryName: "Frontend Development", description: "Runes reactivity, compiler-driven UI, SvelteKit, and zero-runtime overhead.", isAssessed: true },
  { slug: "tailwind-css", name: "Tailwind CSS", categoryId: "frontend", categoryName: "Frontend Development", description: "Utility-first design tokens, responsive breakpoints, and dark mode variants.", isAssessed: true },
  { slug: "responsive-design", name: "Responsive Web Design", categoryId: "frontend", categoryName: "Frontend Development", description: "Fluid typography, mobile-first breakpoints, touch targets, and viewport sizing.", isAssessed: false },
  { slug: "ui-implementation", name: "UI Implementation", categoryId: "frontend", categoryName: "Frontend Development", description: "Pixel-perfect component engineering, accessibility compliance, and interaction states.", isAssessed: false },

  // Backend Development
  { slug: "nodejs", name: "Node.js", categoryId: "backend", categoryName: "Backend Development", description: "Event loop, streams, worker threads, async I/O, and native ESM modules.", isAssessed: true },
  { slug: "expressjs", name: "Express.js", categoryId: "backend", categoryName: "Backend Development", description: "Middleware chaining, routing architecture, error propagation, and security headers.", isAssessed: true },
  { slug: "fastapi", name: "FastAPI", categoryId: "backend", categoryName: "Backend Development", description: "Pydantic validation, async route handlers, OpenAPI generation, and dependency injection.", isAssessed: true },
  { slug: "django", name: "Django", categoryId: "backend", categoryName: "Backend Development", description: "ORM transactions, middleware, Django REST framework, and migrations.", isAssessed: true },
  { slug: "flask", name: "Flask", categoryId: "backend", categoryName: "Backend Development", description: "Lightweight WSGI services, application factories, Blueprints, and extensions.", isAssessed: true },
  { slug: "spring-boot", name: "Spring Boot", categoryId: "backend", categoryName: "Backend Development", description: "Spring Security, WebFlux reactive streams, JPA repositories, and actuary metrics.", isAssessed: true },
  { slug: "rest-apis", name: "REST APIs", categoryId: "backend", categoryName: "Backend Development", description: "Idempotency keys, HTTP status semantics, pagination, and API versioning.", isAssessed: true },
  { slug: "graphql", name: "GraphQL", categoryId: "backend", categoryName: "Backend Development", description: "Schema definition, resolvers, DataLoader N+1 mitigation, and subscriptions.", isAssessed: true },
  { slug: "microservices", name: "Microservices", categoryId: "backend", categoryName: "Backend Development", description: "Service mesh, distributed tracing, circuit breakers, and event sourcing.", isAssessed: false },
  { slug: "auth-systems", name: "Authentication Systems", categoryId: "backend", categoryName: "Backend Development", description: "OAuth 2.1, OpenID Connect, JWT signing/rotation, and session cookies.", isAssessed: false },
  { slug: "distributed-systems", name: "Distributed Systems", categoryId: "backend", categoryName: "Backend Development", description: "Consensus (Raft/Paxos), partition tolerance, idempotency keys, and transactional outbox.", isAssessed: true },

  // Artificial Intelligence
  { slug: "artificial-intelligence", name: "Artificial Intelligence", categoryId: "ai", categoryName: "Artificial Intelligence", description: "Heuristic search, decision theory, automated reasoning, and AI foundations.", isAssessed: true },
  { slug: "machine-learning", name: "Machine Learning", categoryId: "ai", categoryName: "Artificial Intelligence", description: "Supervised and unsupervised learning, cross-validation, and bias-variance tradeoff.", isAssessed: true },
  { slug: "deep-learning", name: "Deep Learning", categoryId: "ai", categoryName: "Artificial Intelligence", description: "Backpropagation, neural architectures, loss landscapes, and regularization.", isAssessed: true },
  { slug: "generative-ai", name: "Generative AI", categoryId: "ai", categoryName: "Artificial Intelligence", description: "Diffusion models, transformer tokenization, temperature sampling, and multimodality.", isAssessed: true },
  { slug: "llms", name: "Large Language Models (LLMs)", categoryId: "ai", categoryName: "Artificial Intelligence", description: "Context window scaling, attention mechanisms, RLHF, and inference optimization.", isAssessed: true },
  { slug: "rag", name: "Retrieval-Augmented Generation (RAG)", categoryId: "ai", categoryName: "Artificial Intelligence", description: "Dense vector retrieval, hybrid BM25 search, re-ranking, and chunking strategies.", isAssessed: true },
  { slug: "ai-agents", name: "AI Agents", categoryId: "ai", categoryName: "Artificial Intelligence", description: "Autonomous planning, tool calling, memory management, and feedback loops.", isAssessed: true },
  { slug: "agentic-workflows", name: "Agentic Workflows", categoryId: "ai", categoryName: "Artificial Intelligence", description: "Multi-agent coordination, handoff protocols, reflection, and human-in-the-loop gates.", isAssessed: true },
  { slug: "prompt-engineering", name: "Prompt Engineering", categoryId: "ai", categoryName: "Artificial Intelligence", description: "Few-shot prompting, chain-of-thought, system prompt guardrails, and structured output.", isAssessed: true },
  { slug: "model-evaluation", name: "Model Evaluation", categoryId: "ai", categoryName: "Artificial Intelligence", description: "Benchmark datasets, hallucination metrics, perplexity, and automated red-teaming.", isAssessed: false },
  { slug: "fine-tuning", name: "Fine-Tuning", categoryId: "ai", categoryName: "Artificial Intelligence", description: "LoRA, QLoRA, instruction tuning, PEFT parameters, and dataset curation.", isAssessed: false },
  { slug: "embeddings", name: "Embeddings", categoryId: "ai", categoryName: "Artificial Intelligence", description: "Vector distance metrics (cosine, dot, L2), dimensionality reduction, and semantic search.", isAssessed: false },
  { slug: "vector-databases", name: "Vector Databases", categoryId: "ai", categoryName: "Artificial Intelligence", description: "HNSW graphs, IVF indexes, filtering metadata, and similarity search pipelines.", isAssessed: false },

  // Data Science and Engineering
  { slug: "data-analysis", name: "Data Analysis", categoryId: "data-science", categoryName: "Data Science & Engineering", description: "Exploratory data analysis, outlier detection, hypothesis testing, and reporting.", isAssessed: true },
  { slug: "data-science", name: "Data Science", categoryId: "data-science", categoryName: "Data Science & Engineering", description: "Feature engineering, predictive modeling, clustering, and model validation.", isAssessed: true },
  { slug: "data-engineering", name: "Data Engineering", categoryId: "data-science", categoryName: "Data Science & Engineering", description: "Data lakehouse architectures, schema evolution, partitioning, and streaming.", isAssessed: true },
  { slug: "data-visualization", name: "Data Visualisation", categoryId: "data-science", categoryName: "Data Science & Engineering", description: "Chart semantics, visual encoding, interactive dashboards, and design hygiene.", isAssessed: true },
  { slug: "statistics", name: "Statistics", categoryId: "data-science", categoryName: "Data Science & Engineering", description: "Probability distributions, p-values, confidence intervals, and Bayesian inference.", isAssessed: true },
  { slug: "pandas", name: "Pandas", categoryId: "data-science", categoryName: "Data Science & Engineering", description: "Vectorized operations, multi-indexes, groupby aggregations, and memory profiling.", isAssessed: true },
  { slug: "numpy", name: "NumPy", categoryId: "data-science", categoryName: "Data Science & Engineering", description: "Broadcasting, ndarray memory layout, linear algebra routines, and SIMD operations.", isAssessed: false },
  { slug: "apache-spark", name: "Apache Spark", categoryId: "data-science", categoryName: "Data Science & Engineering", description: "RDD transformations, Catalyst optimizer, structured streaming, and cluster sizing.", isAssessed: false },
  { slug: "etl-pipelines", name: "ETL Pipelines", categoryId: "data-science", categoryName: "Data Science & Engineering", description: "Idempotent batch jobs, data lineage, validation checks, and Airflow orchestration.", isAssessed: false },
  { slug: "business-intelligence", name: "Business Intelligence", categoryId: "data-science", categoryName: "Data Science & Engineering", description: "Dimensional modeling, star schemas, KPI tracking, and analytical reporting.", isAssessed: false },

  // Machine Learning Frameworks
  { slug: "pytorch", name: "PyTorch", categoryId: "ml-frameworks", categoryName: "Machine Learning Frameworks", description: "Autograd, custom nn.Modules, distributed data parallel, and CUDA memory management.", isAssessed: true },
  { slug: "tensorflow", name: "TensorFlow", categoryId: "ml-frameworks", categoryName: "Machine Learning Frameworks", description: "Keras functional API, computation graphs, TF.data pipelines, and SavedModel export.", isAssessed: true },
  { slug: "scikit-learn", name: "Scikit-learn", categoryId: "ml-frameworks", categoryName: "Machine Learning Frameworks", description: "Pipelines, ColumnTransformer, hyperparameter tuning, and ensemble regressors.", isAssessed: true },
  { slug: "keras", name: "Keras", categoryId: "ml-frameworks", categoryName: "Machine Learning Frameworks", description: "Sequential and functional models, custom layers, callbacks, and metric trackers.", isAssessed: false },
  { slug: "hugging-face", name: "Hugging Face", categoryId: "ml-frameworks", categoryName: "Machine Learning Frameworks", description: "Transformers pipeline, tokenizers, AutoModel architectures, and Hub datasets.", isAssessed: true },
  { slug: "opencv", name: "OpenCV", categoryId: "ml-frameworks", categoryName: "Machine Learning Frameworks", description: "Image filtering, morphological ops, edge detection, color spaces, and video streams.", isAssessed: false },

  // Cloud and DevOps
  { slug: "aws", name: "AWS", categoryId: "cloud-devops", categoryName: "Cloud & DevOps", description: "IAM policies, ECS/EKS, Lambda, S3 security, CloudFront, and VPC networking.", isAssessed: true },
  { slug: "google-cloud", name: "Google Cloud", categoryId: "cloud-devops", categoryName: "Cloud & DevOps", description: "Cloud Run, GKE, Cloud IAM, Pub/Sub, BigQuery, and Secret Manager.", isAssessed: true },
  { slug: "azure", name: "Microsoft Azure", categoryId: "cloud-devops", categoryName: "Cloud & DevOps", description: "Azure App Services, AKS, Azure Active Directory / Entra, and Blob Storage.", isAssessed: true },
  { slug: "docker", name: "Docker", categoryId: "cloud-devops", categoryName: "Cloud & DevOps", description: "Multi-stage builds, non-root containers, build caching, and volume mounting.", isAssessed: true },
  { slug: "kubernetes", name: "Kubernetes", categoryId: "cloud-devops", categoryName: "Cloud & DevOps", description: "Pods, Deployments, Services, Ingress, ConfigMaps, and resource limits.", isAssessed: true },
  { slug: "ci-cd", name: "CI/CD", categoryId: "cloud-devops", categoryName: "Cloud & DevOps", description: "Automated test stages, artifact publishing, zero-downtime rollouts, and rollback.", isAssessed: true },
  { slug: "terraform", name: "Terraform", categoryId: "cloud-devops", categoryName: "Cloud & DevOps", description: "HCL configuration, state locking, module composition, and drift detection.", isAssessed: true },
  { slug: "linux", name: "Linux", categoryId: "cloud-devops", categoryName: "Cloud & DevOps", description: "Systemd services, file permissions, memory management, and network utilities.", isAssessed: true },
  { slug: "git", name: "Git", categoryId: "cloud-devops", categoryName: "Cloud & DevOps", description: "Branching strategies, interactive rebase, cherry-picking, and merge conflict resolution.", isAssessed: false },
  { slug: "github", name: "GitHub", categoryId: "cloud-devops", categoryName: "Cloud & DevOps", description: "GitHub Actions workflows, security scanning, branch protections, and release automation.", isAssessed: false },
  { slug: "cloudflare", name: "Cloudflare", categoryId: "cloud-devops", categoryName: "Cloud & DevOps", description: "Workers runtime, KV, WAF rules, DNS routing, and DDoS mitigation.", isAssessed: false },

  // Databases
  { slug: "postgresql", name: "PostgreSQL", categoryId: "databases", categoryName: "Databases & Storage", description: "ACID transactions, MVCC vacuuming, EXPLAIN ANALYZE, and JSONB operations.", isAssessed: true },
  { slug: "mysql", name: "MySQL", categoryId: "databases", categoryName: "Databases & Storage", description: "InnoDB storage engine, replication topologies, query indexing, and locking modes.", isAssessed: true },
  { slug: "mongodb", name: "MongoDB", categoryId: "databases", categoryName: "Databases & Storage", description: "Document modeling, aggregation pipelines, replica sets, and sharding strategies.", isAssessed: true },
  { slug: "redis", name: "Redis", categoryId: "databases", categoryName: "Databases & Storage", description: "In-memory data structures, pub/sub, TTL eviction policies, and distributed locks.", isAssessed: true },
  { slug: "sqlite", name: "SQLite", categoryId: "databases", categoryName: "Databases & Storage", description: "Embedded serverless architecture, WAL mode, pragmas, and concurrency locks.", isAssessed: true },
  { slug: "elasticsearch", name: "Elasticsearch", categoryId: "databases", categoryName: "Databases & Storage", description: "Inverted index, BM25 scoring, mapping analyzers, and cluster shards.", isAssessed: true },
  { slug: "supabase", name: "Supabase", categoryId: "databases", categoryName: "Databases & Storage", description: "Postgres extensions, Row Level Security (RLS), Auth policies, and edge functions.", isAssessed: false },
  { slug: "database-design", name: "Database Design", categoryId: "databases", categoryName: "Databases & Storage", description: "Normalization, relational constraints, foreign keys, and indexing architectures.", isAssessed: true },

  // Cybersecurity
  { slug: "application-security", name: "Application Security", categoryId: "cybersecurity", categoryName: "Cybersecurity", description: "OWASP Top 10 mitigation, CSRF, XSS prevention, and secure header configuration.", isAssessed: true },
  { slug: "network-security", name: "Network Security", categoryId: "cybersecurity", categoryName: "Cybersecurity", description: "TLS handshake, packet inspection, firewalls, and zero-trust segmentation.", isAssessed: true },
  { slug: "secure-coding", name: "Secure Coding", categoryId: "cybersecurity", categoryName: "Cybersecurity", description: "Input sanitization, parameterization, timing safe comparisons, and secret handling.", isAssessed: true },
  { slug: "vulnerability-assessment", name: "Vulnerability Assessment", categoryId: "cybersecurity", categoryName: "Cybersecurity", description: "Static code analysis (SAST), dynamic analysis (DAST), and CVE impact scoring.", isAssessed: true },
  { slug: "security-testing", name: "Security Testing", categoryId: "cybersecurity", categoryName: "Cybersecurity", description: "Fuzzing endpoints, threat modeling, security regression tests, and red-team audits.", isAssessed: true },
  { slug: "api-security", name: "API Security", categoryId: "cybersecurity", categoryName: "Cybersecurity", description: "Rate limiting, payload size guards, scope enforcement, and replay attack prevention.", isAssessed: true },
  { slug: "identity-access-management", name: "Identity and Access Management", categoryId: "cybersecurity", categoryName: "Cybersecurity", description: "RBAC, ABAC policies, MFA enforcement, and privileged access management.", isAssessed: false },
  { slug: "smart-contracts", name: "Smart Contracts", categoryId: "cybersecurity", categoryName: "Cybersecurity", description: "Solidity reentrancy prevention, EVM gas optimization, and access control proofs.", isAssessed: true },

  // Mobile Development
  { slug: "android-dev", name: "Android Development", categoryId: "mobile", categoryName: "Mobile Development", description: "Jetpack Compose, Android lifecycle, Kotlin coroutines, and Room database.", isAssessed: true },
  { slug: "ios-dev", name: "iOS Development", categoryId: "mobile", categoryName: "Mobile Development", description: "SwiftUI, UIKit interoperability, Swift Concurrency, and Core Data.", isAssessed: true },
  { slug: "flutter", name: "Flutter", categoryId: "mobile", categoryName: "Mobile Development", description: "Widget tree architecture, platform channels, state management, and rendering pipelines.", isAssessed: true },
  { slug: "react-native", name: "React Native", categoryId: "mobile", categoryName: "Mobile Development", description: "Fabric renderer, TurboModules, native bridge, and Expo application workflows.", isAssessed: true },
  { slug: "kotlin-multiplatform", name: "Kotlin Multiplatform", categoryId: "mobile", categoryName: "Mobile Development", description: "Shared business logic, expect/actual declarations, and Ktor client integration.", isAssessed: false },

  // Design and Product
  { slug: "ui-ux-design", name: "UI/UX Design", categoryId: "design-product", categoryName: "Design & Product", description: "Visual hierarchy, design system tokens, cognitive load reduction, and usability.", isAssessed: true },
  { slug: "figma", name: "Figma", categoryId: "design-product", categoryName: "Design & Product", description: "Auto layout, component variants, interactive prototyping, and design tokens.", isAssessed: true },
  { slug: "wireframing", name: "Wireframing", categoryId: "design-product", categoryName: "Design & Product", description: "Low-fidelity user flows, layout exploration, and information architecture.", isAssessed: true },
  { slug: "prototyping", name: "Prototyping", categoryId: "design-product", categoryName: "Design & Product", description: "Interactive click-through models, state transitions, and usability validation.", isAssessed: false },
  { slug: "product-management", name: "Product Management", categoryId: "design-product", categoryName: "Design & Product", description: "Requirements gathering, user stories, acceptance criteria, and roadmap trade-offs.", isAssessed: false },
  { slug: "technical-documentation", name: "Technical Documentation", categoryId: "design-product", categoryName: "Design & Product", description: "OpenAPI specifications, architecture decision records (ADRs), and developer guides.", isAssessed: false },

  // Other Technical Fields
  { slug: "robotics", name: "Robotics", categoryId: "systems-embedded", categoryName: "Other Technical Fields", description: "ROS2, kinematics, sensor fusion (IMU/LiDAR), and motion planning algorithms.", isAssessed: false },
  { slug: "iot", name: "Internet of Things (IoT)", categoryId: "systems-embedded", categoryName: "Other Technical Fields", description: "MQTT protocols, low-power telemetry, CoAP, and edge device telemetry.", isAssessed: false },
  { slug: "embedded-systems", name: "Embedded Systems", categoryId: "systems-embedded", categoryName: "Other Technical Fields", description: "Bare-metal C/Rust, FreeRTOS, interrupt handlers, and hardware bus protocols (I2C/SPI).", isAssessed: false },
  { slug: "electronics", name: "Electronics", categoryId: "systems-embedded", categoryName: "Other Technical Fields", description: "Circuit design, PCB layout, signal integrity, and oscilloscope debugging.", isAssessed: false },
  { slug: "computer-networks", name: "Computer Networks", categoryId: "systems-embedded", categoryName: "Other Technical Fields", description: "TCP/IP stack, BGP routing, DNS resolution, and socket programming.", isAssessed: true },
  { slug: "system-design", name: "System Design", categoryId: "systems-embedded", categoryName: "Other Technical Fields", description: "High availability, load balancing, caching layers, and database sharding.", isAssessed: true },
  { slug: "software-testing", name: "Software Testing", categoryId: "systems-embedded", categoryName: "Other Technical Fields", description: "Unit, integration, contract testing, and test-driven development (TDD).", isAssessed: true },
  { slug: "quality-assurance", name: "Quality Assurance", categoryId: "systems-embedded", categoryName: "Other Technical Fields", description: "Automated regression testing, test planning, edge case analysis, and coverage gates.", isAssessed: true },
  { slug: "automation", name: "Automation", categoryId: "systems-embedded", categoryName: "Other Technical Fields", description: "Headless browser scripting, API test suites, synthetic monitoring, and task runners.", isAssessed: true },
];
