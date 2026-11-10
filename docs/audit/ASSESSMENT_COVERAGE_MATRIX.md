# TRUSTTOPAY — COMPLETE DEMONSTRATION ASSESSMENT COVERAGE MATRIX

**Document Version:** 1.0.0  
**Status:** PHASE 2 COMPLETE & VERIFIED  
**Assessment Target:** Full demonstration coverage across 83 technical skills in the canonical taxonomy  
**Active Demonstration Questions:** 249 distinct questions (83 Foundation, 83 Practitioner, 83 Advanced)

---

## 1. Executive Summary

Phase 2 supersedes the earlier partial plan of 7 priority skills to deliver **complete demonstration assessment coverage across 83 technical skills** spanning all 12 domain categories of the TrustToPay canonical skill taxonomy.

| Metric | Target | Implemented | Verification Status |
|---|---|---|---|
| **Covered Skills** | 83 skills | **83 skills** | **VERIFIED** |
| **Foundation (L1) Questions** | 83 questions | **83 questions** | **VERIFIED (83 / 83)** |
| **Practitioner (L2) Questions** | 83 questions | **83 questions** | **VERIFIED (83 / 83)** |
| **Advanced (L3) Questions** | 83 questions | **83 questions** | **VERIFIED (83 / 83)** |
| **Total Active Questions** | 249 questions | **249 questions** | **VERIFIED (100% Unique IDs)** |
| **Prisma Schema Compliance** | No DB changes | **Preserved** | **VERIFIED (Prisma clean)** |
| **Sequential Progression** | L1 $\rightarrow$ L2 $\rightarrow$ L3 | **Enforced** | **VERIFIED (`skills.test.ts`)** |
| **Specialist Matching Enforcement** | Verified level only | **Enforced** | **VERIFIED (`matching.test.ts`)** |
| **Unsupported Skills in Backlog** | Explicitly tracked | **32 skills** | **Tracked (`isAssessed: false`)** |

---

## 2. Category Coverage Breakdown

All 12 domain categories now have active proctored assessment coverage:

| Category ID | Category Name | Total Taxonomy Skills | Active Assessed Skills | Backlog Skills | Active Questions |
|---|---|:---:|:---:|:---:|:---:|
| `programming` | Programming Languages | 18 | **13** | 5 | 39 |
| `frontend` | Frontend Development | 10 | **8** | 2 | 24 |
| `backend` | Backend Development | 11 | **9** | 2 | 27 |
| `ai` | Artificial Intelligence | 13 | **9** | 4 | 27 |
| `data-science` | Data Science & Engineering | 10 | **6** | 4 | 18 |
| `ml-frameworks` | Machine Learning Frameworks | 6 | **4** | 2 | 12 |
| `cloud-devops` | Cloud & DevOps | 11 | **8** | 3 | 24 |
| `databases` | Databases & Storage | 8 | **7** | 1 | 21 |
| `cybersecurity` | Cybersecurity | 8 | **7** | 1 | 21 |
| `mobile` | Mobile Development | 5 | **4** | 1 | 12 |
| `design-product` | Design & Product | 6 | **3** | 3 | 9 |
| `systems-embedded` | Other Technical Fields | 9 | **5** | 4 | 15 |
| **TOTAL** | **12 Categories** | **115** | **83** | **32** | **249** |

---

## 3. Master 83-Skill Demonstration Coverage Matrix

Each of the 83 skills below is provisioned with 3 assessment stages, strict passing thresholds (80%), server-side answer protection, and verified skill badge synchronization.

| # | Skill Slug | Skill Name | Category | Foundation (L1) Question ID | Practitioner (L2) Question ID | Advanced (L3) Question ID | Status |
|:---:|---|---|---|---|---|---|:---:|
| 1 | `typescript` | TypeScript | `PROGRAMMING` | `ts-l1-q1` | `ts-l2-q1` | `ts-l3-q1` | **READY** |
| 2 | `python` | Python | `PROGRAMMING` | `py-l1-q1` | `py-l2-q1` | `py-l3-q1` | **READY** |
| 3 | `smart-contracts` | Smart Contracts | `CYBERSECURITY` | `sc-l1-q1` | `sc-l2-q1` | `sc-l3-q1` | **READY** |
| 4 | `distributed-systems` | Distributed Systems | `BACKEND` | `ds-l1-q1` | `ds-l2-q1` | `ds-l3-q1` | **READY** |
| 5 | `c` | C | `PROGRAMMING` | `c-l1-q1` | `c-l2-q1` | `c-l3-q1` | **READY** |
| 6 | `cpp` | C++ | `PROGRAMMING` | `cpp-l1-q1` | `cpp-l2-q1` | `cpp-l3-q1` | **READY** |
| 7 | `csharp` | C# | `PROGRAMMING` | `csharp-l1-q1` | `csharp-l2-q1` | `csharp-l3-q1` | **READY** |
| 8 | `java` | Java | `PROGRAMMING` | `java-l1-q1` | `java-l2-q1` | `java-l3-q1` | **READY** |
| 9 | `javascript` | JavaScript | `PROGRAMMING` | `javascript-l1-q1` | `javascript-l2-q1` | `javascript-l3-q1` | **READY** |
| 10 | `go` | Go | `PROGRAMMING` | `go-l1-q1` | `go-l2-q1` | `go-l3-q1` | **READY** |
| 11 | `rust` | Rust | `PROGRAMMING` | `rust-l1-q1` | `rust-l2-q1` | `rust-l3-q1` | **READY** |
| 12 | `php` | PHP | `PROGRAMMING` | `php-l1-q1` | `php-l2-q1` | `php-l3-q1` | **READY** |
| 13 | `ruby` | Ruby | `PROGRAMMING` | `ruby-l1-q1` | `ruby-l2-q1` | `ruby-l3-q1` | **READY** |
| 14 | `sql` | SQL | `PROGRAMMING` | `sql-l1-q1` | `sql-l2-q1` | `sql-l3-q1` | **READY** |
| 15 | `bash` | Bash | `PROGRAMMING` | `bash-l1-q1` | `bash-l2-q1` | `bash-l3-q1` | **READY** |
| 16 | `html` | HTML | `FRONTEND` | `html-l1-q1` | `html-l2-q1` | `html-l3-q1` | **READY** |
| 17 | `css` | CSS | `FRONTEND` | `css-l1-q1` | `css-l2-q1` | `css-l3-q1` | **READY** |
| 18 | `react` | React | `FRONTEND` | `react-l1-q1` | `react-l2-q1` | `react-l3-q1` | **READY** |
| 19 | `nextjs` | Next.js | `FRONTEND` | `nextjs-l1-q1` | `nextjs-l2-q1` | `nextjs-l3-q1` | **READY** |
| 20 | `vue` | Vue.js | `FRONTEND` | `vue-l1-q1` | `vue-l2-q1` | `vue-l3-q1` | **READY** |
| 21 | `angular` | Angular | `FRONTEND` | `angular-l1-q1` | `angular-l2-q1` | `angular-l3-q1` | **READY** |
| 22 | `svelte` | Svelte | `FRONTEND` | `svelte-l1-q1` | `svelte-l2-q1` | `svelte-l3-q1` | **READY** |
| 23 | `tailwind-css` | Tailwind CSS | `FRONTEND` | `tailwind-css-l1-q1` | `tailwind-css-l2-q1` | `tailwind-css-l3-q1` | **READY** |
| 24 | `nodejs` | Node.js | `BACKEND` | `nodejs-l1-q1` | `nodejs-l2-q1` | `nodejs-l3-q1` | **READY** |
| 25 | `expressjs` | Express.js | `BACKEND` | `expressjs-l1-q1` | `expressjs-l2-q1` | `expressjs-l3-q1` | **READY** |
| 26 | `fastapi` | FastAPI | `BACKEND` | `fastapi-l1-q1` | `fastapi-l2-q1` | `fastapi-l3-q1` | **READY** |
| 27 | `django` | Django | `BACKEND` | `django-l1-q1` | `django-l2-q1` | `django-l3-q1` | **READY** |
| 28 | `flask` | Flask | `BACKEND` | `flask-l1-q1` | `flask-l2-q1` | `flask-l3-q1` | **READY** |
| 29 | `spring-boot` | Spring Boot | `BACKEND` | `spring-boot-l1-q1` | `spring-boot-l2-q1` | `spring-boot-l3-q1` | **READY** |
| 30 | `rest-apis` | REST APIs | `BACKEND` | `rest-apis-l1-q1` | `rest-apis-l2-q1` | `rest-apis-l3-q1` | **READY** |
| 31 | `graphql` | GraphQL | `BACKEND` | `graphql-l1-q1` | `graphql-l2-q1` | `graphql-l3-q1` | **READY** |
| 32 | `artificial-intelligence` | Artificial Intelligence | `AI` | `artificial-intelligence-l1-q1` | `artificial-intelligence-l2-q1` | `artificial-intelligence-l3-q1` | **READY** |
| 33 | `machine-learning` | Machine Learning | `AI` | `machine-learning-l1-q1` | `machine-learning-l2-q1` | `machine-learning-l3-q1` | **READY** |
| 34 | `deep-learning` | Deep Learning | `AI` | `deep-learning-l1-q1` | `deep-learning-l2-q1` | `deep-learning-l3-q1` | **READY** |
| 35 | `generative-ai` | Generative AI | `AI` | `generative-ai-l1-q1` | `generative-ai-l2-q1` | `generative-ai-l3-q1` | **READY** |
| 36 | `llms` | Large Language Models (LLMs) | `AI` | `llms-l1-q1` | `llms-l2-q1` | `llms-l3-q1` | **READY** |
| 37 | `rag` | Retrieval-Augmented Generation (RAG) | `AI` | `rag-l1-q1` | `rag-l2-q1` | `rag-l3-q1` | **READY** |
| 38 | `ai-agents` | AI Agents | `AI` | `ai-agents-l1-q1` | `ai-agents-l2-q1` | `ai-agents-l3-q1` | **READY** |
| 39 | `agentic-workflows` | Agentic Workflows | `AI` | `agentic-workflows-l1-q1` | `agentic-workflows-l2-q1` | `agentic-workflows-l3-q1` | **READY** |
| 40 | `prompt-engineering` | Prompt Engineering | `AI` | `prompt-engineering-l1-q1` | `prompt-engineering-l2-q1` | `prompt-engineering-l3-q1` | **READY** |
| 41 | `data-analysis` | Data Analysis | `DATA_SCIENCE` | `data-analysis-l1-q1` | `data-analysis-l2-q1` | `data-analysis-l3-q1` | **READY** |
| 42 | `data-science` | Data Science | `DATA_SCIENCE` | `data-science-l1-q1` | `data-science-l2-q1` | `data-science-l3-q1` | **READY** |
| 43 | `data-engineering` | Data Engineering | `DATA_SCIENCE` | `data-engineering-l1-q1` | `data-engineering-l2-q1` | `data-engineering-l3-q1` | **READY** |
| 44 | `data-visualization` | Data Visualisation | `DATA_SCIENCE` | `data-visualization-l1-q1` | `data-visualization-l2-q1` | `data-visualization-l3-q1` | **READY** |
| 45 | `statistics` | Statistics | `DATA_SCIENCE` | `statistics-l1-q1` | `statistics-l2-q1` | `statistics-l3-q1` | **READY** |
| 46 | `pandas` | Pandas | `DATA_SCIENCE` | `pandas-l1-q1` | `pandas-l2-q1` | `pandas-l3-q1` | **READY** |
| 47 | `pytorch` | PyTorch | `ML_FRAMEWORKS` | `pytorch-l1-q1` | `pytorch-l2-q1` | `pytorch-l3-q1` | **READY** |
| 48 | `tensorflow` | TensorFlow | `ML_FRAMEWORKS` | `tensorflow-l1-q1` | `tensorflow-l2-q1` | `tensorflow-l3-q1` | **READY** |
| 49 | `scikit-learn` | Scikit-learn | `ML_FRAMEWORKS` | `scikit-learn-l1-q1` | `scikit-learn-l2-q1` | `scikit-learn-l3-q1` | **READY** |
| 50 | `hugging-face` | Hugging Face | `ML_FRAMEWORKS` | `hugging-face-l1-q1` | `hugging-face-l2-q1` | `hugging-face-l3-q1` | **READY** |
| 51 | `aws` | AWS | `CLOUD_DEVOPS` | `aws-l1-q1` | `aws-l2-q1` | `aws-l3-q1` | **READY** |
| 52 | `google-cloud` | Google Cloud | `CLOUD_DEVOPS` | `google-cloud-l1-q1` | `google-cloud-l2-q1` | `google-cloud-l3-q1` | **READY** |
| 53 | `azure` | Microsoft Azure | `CLOUD_DEVOPS` | `azure-l1-q1` | `azure-l2-q1` | `azure-l3-q1` | **READY** |
| 54 | `docker` | Docker | `CLOUD_DEVOPS` | `docker-l1-q1` | `docker-l2-q1` | `docker-l3-q1` | **READY** |
| 55 | `kubernetes` | Kubernetes | `CLOUD_DEVOPS` | `kubernetes-l1-q1` | `kubernetes-l2-q1` | `kubernetes-l3-q1` | **READY** |
| 56 | `ci-cd` | CI/CD | `CLOUD_DEVOPS` | `ci-cd-l1-q1` | `ci-cd-l2-q1` | `ci-cd-l3-q1` | **READY** |
| 57 | `terraform` | Terraform | `CLOUD_DEVOPS` | `terraform-l1-q1` | `terraform-l2-q1` | `terraform-l3-q1` | **READY** |
| 58 | `linux` | Linux | `CLOUD_DEVOPS` | `linux-l1-q1` | `linux-l2-q1` | `linux-l3-q1` | **READY** |
| 59 | `postgresql` | PostgreSQL | `DATABASES` | `postgresql-l1-q1` | `postgresql-l2-q1` | `postgresql-l3-q1` | **READY** |
| 60 | `mysql` | MySQL | `DATABASES` | `mysql-l1-q1` | `mysql-l2-q1` | `mysql-l3-q1` | **READY** |
| 61 | `mongodb` | MongoDB | `DATABASES` | `mongodb-l1-q1` | `mongodb-l2-q1` | `mongodb-l3-q1` | **READY** |
| 62 | `redis` | Redis | `DATABASES` | `redis-l1-q1` | `redis-l2-q1` | `redis-l3-q1` | **READY** |
| 63 | `sqlite` | SQLite | `DATABASES` | `sqlite-l1-q1` | `sqlite-l2-q1` | `sqlite-l3-q1` | **READY** |
| 64 | `elasticsearch` | Elasticsearch | `DATABASES` | `elasticsearch-l1-q1` | `elasticsearch-l2-q1` | `elasticsearch-l3-q1` | **READY** |
| 65 | `database-design` | Database Design | `DATABASES` | `database-design-l1-q1` | `database-design-l2-q1` | `database-design-l3-q1` | **READY** |
| 66 | `application-security` | Application Security | `CYBERSECURITY` | `application-security-l1-q1` | `application-security-l2-q1` | `application-security-l3-q1` | **READY** |
| 67 | `network-security` | Network Security | `CYBERSECURITY` | `network-security-l1-q1` | `network-security-l2-q1` | `network-security-l3-q1` | **READY** |
| 68 | `secure-coding` | Secure Coding | `CYBERSECURITY` | `secure-coding-l1-q1` | `secure-coding-l2-q1` | `secure-coding-l3-q1` | **READY** |
| 69 | `vulnerability-assessment` | Vulnerability Assessment | `CYBERSECURITY` | `vulnerability-assessment-l1-q1` | `vulnerability-assessment-l2-q1` | `vulnerability-assessment-l3-q1` | **READY** |
| 70 | `security-testing` | Security Testing | `CYBERSECURITY` | `security-testing-l1-q1` | `security-testing-l2-q1` | `security-testing-l3-q1` | **READY** |
| 71 | `api-security` | API Security | `CYBERSECURITY` | `api-security-l1-q1` | `api-security-l2-q1` | `api-security-l3-q1` | **READY** |
| 72 | `android-dev` | Android Development | `MOBILE` | `android-dev-l1-q1` | `android-dev-l2-q1` | `android-dev-l3-q1` | **READY** |
| 73 | `ios-dev` | iOS Development | `MOBILE` | `ios-dev-l1-q1` | `ios-dev-l2-q1` | `ios-dev-l3-q1` | **READY** |
| 74 | `flutter` | Flutter | `MOBILE` | `flutter-l1-q1` | `flutter-l2-q1` | `flutter-l3-q1` | **READY** |
| 75 | `react-native` | React Native | `MOBILE` | `react-native-l1-q1` | `react-native-l2-q1` | `react-native-l3-q1` | **READY** |
| 76 | `ui-ux-design` | UI/UX Design | `DESIGN_PRODUCT` | `ui-ux-design-l1-q1` | `ui-ux-design-l2-q1` | `ui-ux-design-l3-q1` | **READY** |
| 77 | `figma` | Figma | `DESIGN_PRODUCT` | `figma-l1-q1` | `figma-l2-q1` | `figma-l3-q1` | **READY** |
| 78 | `wireframing` | Wireframing | `DESIGN_PRODUCT` | `wireframing-l1-q1` | `wireframing-l2-q1` | `wireframing-l3-q1` | **READY** |
| 79 | `computer-networks` | Computer Networks | `SYSTEMS_EMBEDDED` | `computer-networks-l1-q1` | `computer-networks-l2-q1` | `computer-networks-l3-q1` | **READY** |
| 80 | `system-design` | System Design | `SYSTEMS_EMBEDDED` | `system-design-l1-q1` | `system-design-l2-q1` | `system-design-l3-q1` | **READY** |
| 81 | `software-testing` | Software Testing | `SYSTEMS_EMBEDDED` | `software-testing-l1-q1` | `software-testing-l2-q1` | `software-testing-l3-q1` | **READY** |
| 82 | `quality-assurance` | Quality Assurance | `SYSTEMS_EMBEDDED` | `quality-assurance-l1-q1` | `quality-assurance-l2-q1` | `quality-assurance-l3-q1` | **READY** |
| 83 | `automation` | Automation | `SYSTEMS_EMBEDDED` | `automation-l1-q1` | `automation-l2-q1` | `automation-l3-q1` | **READY** |


---

## 4. Preserved Historical Questions & Evaluation Notes

The initial 4 pilot skills (`typescript`, `python`, `smart-contracts`, `distributed-systems`) previously contained secondary CODE_TASK candidate questions (`ts-l1-q2`, `py-l1-q2`, etc.).

### Demonstration Architecture:
- In this demonstration version, each level contains **exactly 1 active candidate question** per skill-level combination (249 total questions).
- The question-selection abstraction in `startAssessmentAttempt` retains full compatibility with cryptographic random selection (`crypto.randomInt`) when question banks are expanded in future phases.
- The primary questions for the 4 initial skills (`ts-l1-q1`, `py-l1-q1`, `sc-l1-q1`, `ds-l1-q1`, etc.) are preserved with 100% ID stability, ensuring existing regression suites pass without modification.
- **Limitation Disclosure:** A single question per level demonstrates the end-to-end proctored workflow, timer, webcam verification, and sequential badge progression, but does not offer the entropy or assessment robustness of a multi-question randomized examination.

---

## 5. Unsupported Catalogue Skills (Long-Term Backlog)

The remaining 32 skills in the 115-skill taxonomy remain explicitly marked with `isAssessed: false` in `backend/src/services/skills/taxonomy.ts`. Reviewers cannot earn verified badges for these skills, and the specialist matching engine strictly excludes them from verified ranking until full question banks are authored.

| # | Skill Slug | Skill Name | Domain Category | Backlog Status |
|:---:|---|---|---|---|
| 1 | `swift` | Swift | Programming Languages (`programming`) | Planned Future Phase |
| 2 | `kotlin` | Kotlin | Programming Languages (`programming`) | Planned Future Phase |
| 3 | `dart` | Dart | Programming Languages (`programming`) | Planned Future Phase |
| 4 | `r` | R | Programming Languages (`programming`) | Planned Future Phase |
| 5 | `matlab` | MATLAB | Programming Languages (`programming`) | Planned Future Phase |
| 6 | `responsive-design` | Responsive Web Design | Frontend Development (`frontend`) | Planned Future Phase |
| 7 | `ui-implementation` | UI Implementation | Frontend Development (`frontend`) | Planned Future Phase |
| 8 | `microservices` | Microservices | Backend Development (`backend`) | Planned Future Phase |
| 9 | `auth-systems` | Authentication Systems | Backend Development (`backend`) | Planned Future Phase |
| 10 | `model-evaluation` | Model Evaluation | Artificial Intelligence (`ai`) | Planned Future Phase |
| 11 | `fine-tuning` | Fine-Tuning | Artificial Intelligence (`ai`) | Planned Future Phase |
| 12 | `embeddings` | Embeddings | Artificial Intelligence (`ai`) | Planned Future Phase |
| 13 | `vector-databases` | Vector Databases | Artificial Intelligence (`ai`) | Planned Future Phase |
| 14 | `numpy` | NumPy | Data Science & Engineering (`data-science`) | Planned Future Phase |
| 15 | `apache-spark` | Apache Spark | Data Science & Engineering (`data-science`) | Planned Future Phase |
| 16 | `etl-pipelines` | ETL Pipelines | Data Science & Engineering (`data-science`) | Planned Future Phase |
| 17 | `business-intelligence` | Business Intelligence | Data Science & Engineering (`data-science`) | Planned Future Phase |
| 18 | `keras` | Keras | Machine Learning Frameworks (`ml-frameworks`) | Planned Future Phase |
| 19 | `opencv` | OpenCV | Machine Learning Frameworks (`ml-frameworks`) | Planned Future Phase |
| 20 | `git` | Git | Cloud & DevOps (`cloud-devops`) | Planned Future Phase |
| 21 | `github` | GitHub | Cloud & DevOps (`cloud-devops`) | Planned Future Phase |
| 22 | `cloudflare` | Cloudflare | Cloud & DevOps (`cloud-devops`) | Planned Future Phase |
| 23 | `supabase` | Supabase | Databases & Storage (`databases`) | Planned Future Phase |
| 24 | `identity-access-management` | Identity and Access Management | Cybersecurity (`cybersecurity`) | Planned Future Phase |
| 25 | `kotlin-multiplatform` | Kotlin Multiplatform | Mobile Development (`mobile`) | Planned Future Phase |
| 26 | `prototyping` | Prototyping | Design & Product (`design-product`) | Planned Future Phase |
| 27 | `product-management` | Product Management | Design & Product (`design-product`) | Planned Future Phase |
| 28 | `technical-documentation` | Technical Documentation | Design & Product (`design-product`) | Planned Future Phase |
| 29 | `robotics` | Robotics | Other Technical Fields (`systems-embedded`) | Planned Future Phase |
| 30 | `iot` | Internet of Things (IoT) | Other Technical Fields (`systems-embedded`) | Planned Future Phase |
| 31 | `embedded-systems` | Embedded Systems | Other Technical Fields (`systems-embedded`) | Planned Future Phase |
| 32 | `electronics` | Electronics | Other Technical Fields (`systems-embedded`) | Planned Future Phase |


---

## 6. Architecture & Security Controls Verification

1. **Server-Side Answer Protection:** Correct answer options (`correctOptionId`), code snippets, and explanations are stripped via `stripQuestionSecrets()` before questions are delivered to the frontend client.
2. **Anti-Memorization Option Shuffling:** Multiple-choice options are shuffled using Fisher-Yates and cryptographic random numbers (`crypto.randomInt`) on every attempt.
3. **Sequential Unlocking:** Level 2 (Practitioner) cannot be started without passing Level 1; Level 3 (Advanced) cannot be started without passing Level 2. Premature attempts are blocked with HTTP 403 `SEQUENTIAL_LEVEL_LOCKED`.
4. **Attempt Ownership & Cooldown Enforcement:** Failed attempts activate stage cooldowns (30–60 minutes), preventing immediate brute-force retries with HTTP 429 `ASSESSMENT_COOLDOWN_ACTIVE`.
5. **Specialist Matching Verification:** Tasks requiring verified skill proficiency exclusively check `UserSkillLevel` and `ReviewerSkill` database records; self-reported or unassessed skills receive zero matching weight.
