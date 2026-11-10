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
// 4. ARTIFICIAL INTELLIGENCE (9 skills)
// ==========================================

// 4.1 Artificial Intelligence
defineSkill(
  "artificial-intelligence",
  "Artificial Intelligence",
  "AI",
  "Heuristic search, decision theory, automated reasoning, and AI foundations.",
  {
    prompt: "What fundamentally distinguishes an artificial intelligence system from a conventional deterministic procedural algorithm?",
    options: [
      { id: "a", text: "AI systems reason under uncertainty, learn from empirical patterns, and adapt behaviors based on goal objectives rather than strictly static step-by-step rules." },
      { id: "b", text: "AI systems do not require electricity or CPU instructions." },
      { id: "c", text: "Conventional algorithms are always faster than AI models in every task." },
      { id: "d", text: "AI algorithms cannot produce numerical outputs." },
    ],
    correctOptionId: "a",
    explanation: "AI encompasses systems capable of learning, heuristic optimization, and probabilistic decision-making under uncertainty.",
  },
  {
    prompt: "In graph search and pathfinding algorithms, what condition must an A* heuristic function $h(n)$ satisfy to guarantee finding the mathematically optimal shortest path?",
    options: [
      { id: "a", text: "It must be admissible (never overestimate the true cost to reach the goal)." },
      { id: "b", text: "It must return a constant value of 0 for all nodes." },
      { id: "c", text: "It must be exponential in relation to graph depth." },
      { id: "d", text: "It must only evaluate nodes with negative edge weights." },
    ],
    correctOptionId: "a",
    explanation: "An admissible heuristic never overestimates the actual remaining cost, ensuring A* terminates on the true optimal path.",
  },
  {
    prompt: "In Markov Decision Processes (MDP), what fundamental recursive relationship does the Bellman Optimality Equation express for the state-value function $V^*(s)$?",
    options: [
      { id: "a", text: "The value of a state under the optimal policy equals the expected immediate reward plus the discounted value of the subsequent optimal state." },
      { id: "b", text: "Future rewards are multiplied by infinity." },
      { id: "c", text: "States cannot transition to more than one successor." },
      { id: "d", text: "Action probabilities must sum to 0." },
    ],
    correctOptionId: "a",
    explanation: "The Bellman equation decomposes optimal value into immediate expected reward plus discounted continuation value.",
  }
);

// 4.2 Machine Learning
defineSkill(
  "machine-learning",
  "Machine Learning",
  "AI",
  "Supervised and unsupervised learning, cross-validation, and bias-variance tradeoff.",
  {
    prompt: "What is the primary difference between supervised learning and unsupervised learning?",
    options: [
      { id: "a", text: "Supervised learning trains on labeled input-output pairs to predict targets; unsupervised learning discovers hidden patterns in unlabeled data." },
      { id: "b", text: "Supervised learning requires human code review on every model inference." },
      { id: "c", text: "Unsupervised learning cannot process numerical numbers." },
      { id: "d", text: "Supervised learning only works on decision trees." },
    ],
    correctOptionId: "a",
    explanation: "Supervised learning maps features to known target labels; unsupervised learning identifies intrinsic data structure without ground-truth labels.",
  },
  {
    prompt: "During model training, when training loss continues decreasing while validation loss begins increasing, what phenomenon is occurring and how should it be addressed?",
    options: [
      { id: "a", text: "Overfitting; address it via L1/L2 regularization, early stopping, dropout, or increasing training data diversity." },
      { id: "b", text: "Underfitting; address it by removing all regularization and shrinking model size." },
      { id: "c", text: "Data corruption; delete the training set immediately." },
      { id: "d", text: "Gradient explosion; increase the learning rate 10x." },
    ],
    correctOptionId: "a",
    explanation: "Divergence between training and validation loss indicates the model is memorizing training noise (overfitting).",
  },
  {
    prompt: "Why is the Area Under the Precision-Recall Curve (PR-AUC) preferred over ROC-AUC when evaluating machine learning models on severe class imbalances (e.g. 0.01% fraud detection)?",
    options: [
      { id: "a", text: "ROC-AUC uses the False Positive Rate, which is diluted by a massive majority negative class, presenting an overly optimistic score; PR-AUC focuses on minority positive class precision." },
      { id: "b", text: "PR-AUC can only evaluate multiclass neural networks." },
      { id: "c", text: "ROC-AUC cannot be plotted graphically." },
      { id: "d", text: "Precision-Recall curves ignore true positive counts." },
    ],
    correctOptionId: "a",
    explanation: "In heavy class imbalance, huge True Negative counts falsely inflate ROC-AUC; PR-AUC directly tracks minority class precision against recall.",
  }
);

// 4.3 Deep Learning
defineSkill(
  "deep-learning",
  "Deep Learning",
  "AI",
  "Backpropagation, neural architectures, loss landscapes, and regularization.",
  {
    prompt: "Why are non-linear activation functions (such as ReLU or GELU) essential between layers in deep neural networks?",
    options: [
      { id: "a", text: "Without non-linear activations, composing multiple linear layers collapses mathematically into a single linear transformation, preventing the network from learning complex functions." },
      { id: "b", text: "Non-linear activations prevent the GPU from overheating." },
      { id: "c", text: "They convert floating-point weights into 8-bit integers." },
      { id: "d", text: "They eliminate the need for backpropagation." },
    ],
    correctOptionId: "a",
    explanation: "Linear layers composed together remain linear ($W_2(W_1 x) = W_3 x$); non-linearities allow neural networks to approximate arbitrary functions.",
  },
  {
    prompt: "How does Layer Normalization differ from Batch Normalization, and why is Layer Normalization favored in Transformer models?",
    options: [
      { id: "a", text: "LayerNorm normalizes across feature dimensions for each individual token independent of batch size, whereas BatchNorm normalizes across the batch dimension and suffers with dynamic sequence lengths." },
      { id: "b", text: "LayerNorm requires double the GPU memory of BatchNorm." },
      { id: "c", text: "BatchNorm cannot compute gradients." },
      { id: "d", text: "LayerNorm is applied only to convolutional layers." },
    ],
    correctOptionId: "a",
    explanation: "LayerNorm computes mean and variance per token across hidden dimensions, making it robust to variable batch sizes and sequence lengths in NLP.",
  },
  {
    prompt: "In the Transformer Scaled Dot-Product Attention formula $\\text{Attention}(Q, K, V) = \\text{softmax}\\left(\\frac{QK^T}{\\sqrt{d_k}}\\right)V$, what critical purpose does scaling by $\\frac{1}{\\sqrt{d_k}}$ serve?",
    options: [
      { id: "a", text: "It prevents dot products from growing excessively large in high dimensions, which would push softmax into regions with vanishingly small gradients." },
      { id: "b", text: "It normalizes word vectors to unit length on disk." },
      { id: "c", text: "It converts matrix multiplication into vector addition." },
      { id: "d", text: "It forces attention weights to be strictly binary." },
    ],
    correctOptionId: "a",
    explanation: "Without $\\sqrt{d_k}$ scaling, large vector dimensions cause dot products to grow large in magnitude, driving softmax gradients to zero.",
  }
);

// 4.4 Generative AI
defineSkill(
  "generative-ai",
  "Generative AI",
  "AI",
  "Diffusion models, transformer tokenization, temperature sampling, and multimodality.",
  {
    prompt: "When sampling text from a generative language model, what impact does setting a low `temperature` (e.g. `0.1`) have on the output?",
    options: [
      { id: "a", text: "It sharpens the probability distribution, making outputs more deterministic, focused, and predictable by favoring top tokens." },
      { id: "b", text: "It introduces maximum randomness and hallucinated variety." },
      { id: "c", text: "It reduces API response latency by 90%." },
      { id: "d", text: "It disables token generation entirely." },
    ],
    correctOptionId: "a",
    explanation: "Lower temperatures scale down logits, exaggerating differences so the most likely tokens dominate generation.",
  },
  {
    prompt: "How do latent diffusion models (e.g. Stable Diffusion) generate high-resolution images efficiently compared to pixel-space diffusion?",
    options: [
      { id: "a", text: "They run the iterative forward/reverse denoising process in a compressed, lower-dimensional latent space encoded by a VAE, reducing compute requirements." },
      { id: "b", text: "They stitch pre-existing stock photographs together using Alpha blending." },
      { id: "c", text: "They generate SVG vector paths instead of raster pixels." },
      { id: "d", text: "They bypass neural networks and use deterministic Fourier transforms." },
    ],
    correctOptionId: "a",
    explanation: "Operating in an autoencoder's latent space reduces spatial dimensions, enabling high-quality image diffusion at reasonable compute costs.",
  },
  {
    prompt: "How does Direct Preference Optimization (DPO) simplify aligning generative language models compared to traditional PPO-based RLHF?",
    options: [
      { id: "a", text: "DPO mathematically reparameterizes the reward function, training directly on preference pairs via cross-entropy loss without training a separate reward model or running reinforcement learning." },
      { id: "b", text: "DPO requires human annotators to write raw model weights by hand." },
      { id: "c", text: "DPO disables the base model's context window." },
      { id: "d", text: "DPO only works on models with fewer than 1 million parameters." },
    ],
    correctOptionId: "a",
    explanation: "DPO bypasses the complex, unstable PPO reinforcement learning loop by directly optimizing policy probabilities on preferred vs dispreferred pairs.",
  }
);

// 4.5 Large Language Models (LLMs)
defineSkill(
  "llms",
  "Large Language Models (LLMs)",
  "AI",
  "Context window scaling, attention mechanisms, RLHF, and inference optimization.",
  {
    prompt: "Why can large language models struggle with basic arithmetic tasks like counting letters in a word or multiplying 8-digit numbers?",
    options: [
      { id: "a", text: "Tokenizers chunk text into multi-character subwords, obscuring individual characters, and transformers generate tokens autoregressively without a dedicated internal scratchpad or arithmetic register." },
      { id: "b", text: "LLMs are programmed to reject all mathematical queries." },
      { id: "c", text: "GPUs cannot compute addition." },
      { id: "d", text: "Transformer layers can only process English vocabulary." },
    ],
    correctOptionId: "a",
    explanation: "BPE tokenizers group letters into tokens, so the model rarely sees raw characters; it predicts probable tokens rather than executing algorithmic computation.",
  },
  {
    prompt: "During autoregressive text generation with an LLM, what performance problem does the Key-Value (KV) cache resolve?",
    options: [
      { id: "a", text: "It stores previously computed key and value attention vectors for past tokens, avoiding redundant $O(N^2)$ recalculation on every generated token." },
      { id: "b", text: "It caches the final answer in an external Redis database." },
      { id: "c", text: "It compresses model weights from 16-bit float to 4-bit float." },
      { id: "d", text: "It clears GPU VRAM between each word." },
    ],
    correctOptionId: "a",
    explanation: "KV cache retains attention projections for preceding tokens so each decoding step only computes projections for the newest token.",
  },
  {
    prompt: "How does the FlashAttention algorithm accelerate Transformer attention computation while significantly reducing GPU memory footprint?",
    options: [
      { id: "a", text: "It tiles the attention computation into blocks that fit in fast GPU SRAM, computing softmax online and never writing the $N \\times N$ intermediate attention matrix to slow HBM." },
      { id: "b", text: "It approximates attention using random Fourier features." },
      { id: "c", text: "It drops 50% of tokens at random." },
      { id: "d", text: "It replaces matrix multiplication with bitwise operations." },
    ],
    correctOptionId: "a",
    explanation: "FlashAttention is an exact, IO-aware algorithm that leverages GPU SRAM tiling and online softmax to avoid slow HBM roundtrips.",
  }
);

// 4.6 Retrieval-Augmented Generation (RAG)
defineSkill(
  "rag",
  "Retrieval-Augmented Generation (RAG)",
  "AI",
  "Dense vector retrieval, hybrid BM25 search, re-ranking, and chunking strategies.",
  {
    prompt: "What is the primary architecture flow of a production Retrieval-Augmented Generation (RAG) query?",
    options: [
      { id: "a", text: "Embed user query $\\rightarrow$ search vector/text index for relevant context chunks $\\rightarrow$ inject retrieved passages into prompt $\\rightarrow$ synthesize answer via LLM." },
      { id: "b", text: "Fine-tune the foundational weights of the model on the query string." },
      { id: "c", text: "Download the entire database to the client browser." },
      { id: "d", text: "Generate synthetic training data and retrain the LLM overnight." },
    ],
    correctOptionId: "a",
    explanation: "RAG retrieves relevant external ground-truth documents at query time and conditions the LLM generation on those retrieved facts.",
  },
  {
    prompt: "Why can fixed-size naive chunking (e.g. strict 500 characters) degrade RAG answer quality?",
    options: [
      { id: "a", text: "It often splits sentences or paragraphs mid-thought, severing semantic context and separating key entities from their explanatory text." },
      { id: "b", text: "Vector databases refuse to index chunks smaller than 10,000 characters." },
      { id: "c", text: "Embedding models only accept single words." },
      { id: "d", text: "It causes database storage drives to fragment." },
    ],
    correctOptionId: "a",
    explanation: "Arbitrary chunk boundaries fragment continuous semantic ideas, resulting in incomplete context retrieval.",
  },
  {
    prompt: "In advanced RAG architectures, why is hybrid search (combining sparse BM25 and dense vector search via Reciprocal Rank Fusion) superior to dense vector search alone?",
    options: [
      { id: "a", text: "Dense embeddings excel at conceptual semantic meaning but struggle with exact keywords, serial numbers, and acronyms, where sparse BM25 is highly precise." },
      { id: "b", text: "BM25 uses neural networks to re-embed all documents on the fly." },
      { id: "c", text: "Dense vector search is prohibited by GDPR regulations." },
      { id: "d", text: "Hybrid search eliminates the need for an LLM." },
    ],
    correctOptionId: "a",
    explanation: "Hybrid search merges the strengths of exact lexical matching (BM25) with semantic conceptual similarity (vector embeddings).",
  }
);

// 4.7 AI Agents
defineSkill(
  "ai-agents",
  "AI Agents",
  "AI",
  "Autonomous planning, tool calling, memory management, and feedback loops.",
  {
    prompt: "What is the core premise of the ReAct (Reason + Act) prompting framework in autonomous AI agents?",
    options: [
      { id: "a", text: "The agent explicitly alternates between generating reasoning thoughts and executing tool actions with observation feedback." },
      { id: "b", text: "The agent compiles its instructions into a React.js user interface." },
      { id: "c", text: "The agent only accepts user messages after a 60-second delay." },
      { id: "d", text: "The agent executes tool actions without any internal reasoning." },
    ],
    correctOptionId: "a",
    explanation: "ReAct combines verbal reasoning traces with concrete external tool invocations and environment feedback loops.",
  },
  {
    prompt: "When an AI agent executes a tool that returns an error (e.g. `404 Not Found` or `SyntaxError`), how should a resilient agentic loop handle it?",
    options: [
      { id: "a", text: "Inject the error output back into the conversation context so the agent can reflect on the failure, inspect arguments, and self-correct." },
      { id: "b", text: "Terminate the entire application process immediately." },
      { id: "c", text: "Hide the error and return an empty string to the user." },
      { id: "d", text: "Continuously retry the identical invalid command in an infinite loop." },
    ],
    correctOptionId: "a",
    explanation: "Feeding tool execution errors back into the agent context allows the model to diagnose errors and formulate alternative plans.",
  },
  {
    prompt: "In multi-agent collaborative workflows, what mechanism prevents two interacting agents from falling into an infinite ping-pong conversational loop?",
    options: [
      { id: "a", text: "Enforcing hard maximum step/iteration limits and requiring a centralized supervisor or deterministic completion termination condition." },
      { id: "b", text: "Limiting messages to 5 words each." },
      { id: "c", text: "Running only one agent per month." },
      { id: "d", text: "Disabling JSON responses." },
    ],
    correctOptionId: "a",
    explanation: "Step counters, cycle detection, and explicit termination criteria guarantee bounded execution in multi-agent systems.",
  }
);

// 4.8 Agentic Workflows
defineSkill(
  "agentic-workflows",
  "Agentic Workflows",
  "AI",
  "Multi-agent coordination, handoff protocols, reflection, and human-in-the-loop gates.",
  {
    prompt: "How do iterative agentic workflows differ from standard single-prompt LLM interactions?",
    options: [
      { id: "a", text: "Agentic workflows use iterative decomposition, execution, self-evaluation, and refinement steps rather than generating the entire final output in one shot." },
      { id: "b", text: "Agentic workflows do not use neural network models." },
      { id: "c", text: "Single-prompt interactions always produce higher quality code." },
      { id: "d", text: "Agentic workflows can only run on quantum computers." },
    ],
    correctOptionId: "a",
    explanation: "Agentic workflows decompose complex tasks into multiple autonomous cycles of drafting, critiquing, and revising.",
  },
  {
    prompt: "Why are Human-in-the-Loop (HITL) pause gates critical when designing agentic workflows for financial or infrastructure automation?",
    options: [
      { id: "a", text: "They require explicit authorized human approval before the agent executes irreversible side-effects (e.g. executing funds transfers or dropping database tables)." },
      { id: "b", text: "They eliminate the need for server backups." },
      { id: "c", text: "They speed up network latency." },
      { id: "d", text: "They convert agent plans into PDF documents." },
    ],
    correctOptionId: "a",
    explanation: "HITL gates prevent autonomous models from executing catastrophic or irreversible actions without verified human oversight.",
  },
  {
    prompt: "When building stateful agent workflows using state graph frameworks (like LangGraph), what does state checkpointing enable?",
    options: [
      { id: "a", text: "Persisting the agent state at each step, allowing time-travel debugging, resuming interrupted sessions, and branching alternative execution paths." },
      { id: "b", text: "Compiling Python functions to C++ binaries." },
      { id: "c", text: "Compressing memory into an MP4 video file." },
      { id: "d", text: "Deleting all prior conversation history." },
    ],
    correctOptionId: "a",
    explanation: "State checkpointing persists graph state at every super-step, supporting fault recovery, auditing, and interactive user revisions.",
  }
);

// 4.9 Prompt Engineering
defineSkill(
  "prompt-engineering",
  "Prompt Engineering",
  "AI",
  "Few-shot prompting, chain-of-thought, system prompt guardrails, and structured output.",
  {
    prompt: "What is the primary advantage of few-shot prompting over zero-shot prompting when instructing an LLM?",
    options: [
      { id: "a", text: "Providing input-output exemplar demonstrations establishes exact syntax, format constraints, and reasoning style for the model to follow." },
      { id: "b", text: "It updates the internal weights of the model permanently." },
      { id: "c", text: "It reduces the prompt token count to zero." },
      { id: "d", text: "It completely eliminates hallucination in all circumstances." },
    ],
    correctOptionId: "a",
    explanation: "Few-shot examples guide the model's in-context learning to mirror the desired format, nuance, and structural expectations.",
  },
  {
    prompt: "How does Chain-of-Thought (CoT) prompting (e.g. 'Think step-by-step') improve multi-step logical reasoning in LLMs?",
    options: [
      { id: "a", text: "It allocates additional intermediate reasoning tokens where the model can break down complex deductions before arriving at the final conclusion." },
      { id: "b", text: "It causes the model to query Wikipedia automatically." },
      { id: "c", text: "It converts token generation into a binary search tree." },
      { id: "d", text: "It bypasses the model's context window limits." },
    ],
    correctOptionId: "a",
    explanation: "Autoregressive models cannot look ahead; generating intermediate reasoning tokens allows the model to compute intermediate state.",
  },
  {
    prompt: "Which prompt engineering technique defends against direct prompt injection attacks where user input attempts to override system instructions?",
    options: [
      { id: "a", text: "Enclosing untrusted user input within distinct XML tags (e.g. `<user_input>...</user_input>`) and instructing the model never to treat tagged content as commands." },
      { id: "b", text: "Appending 'Please do not hack me' to the prompt." },
      { id: "c", text: "Translating all inputs to Latin." },
      { id: "d", text: "Removing all punctuation from system prompts." },
    ],
    correctOptionId: "a",
    explanation: "Structural boundary encapsulation with unambiguous system instructions helps models distinguish trusted instructions from untrusted data.",
  }
);

// ==========================================
// 5. DATA SCIENCE & ENGINEERING (6 skills)
// ==========================================

// 5.1 Data Analysis
defineSkill(
  "data-analysis",
  "Data Analysis",
  "DATA_SCIENCE",
  "Exploratory data analysis, outlier detection, hypothesis testing, and reporting.",
  {
    prompt: "What is the key difference between data Missing Completely at Random (MCAR) and Missing Not at Random (MNAR)?",
    options: [
      { id: "a", text: "Under MCAR, the missingness has no relationship with any observed or unobserved variable; under MNAR, missingness is related to the unobserved value itself." },
      { id: "b", text: "MCAR only occurs in SQL databases; MNAR only occurs in Excel." },
      { id: "c", text: "MNAR can always be fixed by dropping all missing rows." },
      { id: "d", text: "Both terms are mathematically identical." },
    ],
    correctOptionId: "a",
    explanation: "MNAR means the propensity for a value to be missing depends on the missing value itself (e.g. high-income earners refusing to disclose income).",
  },
  {
    prompt: "Why can relying solely on the Pearson correlation coefficient ($r$) be misleading when analyzing bivariate datasets?",
    options: [
      { id: "a", text: "Pearson only measures linear relationships and is highly sensitive to extreme outliers; non-linear dependencies can have $r \\approx 0$." },
      { id: "b", text: "Pearson correlation only accepts categorical variables." },
      { id: "c", text: "Pearson $r$ cannot range between -1 and +1." },
      { id: "d", text: "It is only valid for sample sizes under 30." },
    ],
    correctOptionId: "a",
    explanation: "Anscombe's quartet demonstrates that disparate non-linear distributions and outliers can produce identical Pearson correlation coefficients.",
  },
  {
    prompt: "What is Simpson's Paradox in statistical data analysis?",
    options: [
      { id: "a", text: "A statistical trend that appears in several different groups reverses or disappears when the groups are aggregated together due to confounding variables." },
      { id: "b", text: "The mean and median of any normal distribution are unequal." },
      { id: "c", text: "P-values shrink as sample size decreases." },
      { id: "d", text: "Machine learning models always overfit on time-series data." },
    ],
    correctOptionId: "a",
    explanation: "Simpson's Paradox occurs when an underlying confounding variable distorts aggregate data, reversing observed subgroup trends.",
  }
);

// 5.2 Data Science
defineSkill(
  "data-science",
  "Data Science",
  "DATA_SCIENCE",
  "Feature engineering, predictive modeling, clustering, and model validation.",
  {
    prompt: "Why must data transformations (such as scaling or mean imputation) be fit strictly on the training set and only transformed on the test set?",
    options: [
      { id: "a", text: "To prevent data leakage, ensuring test evaluation accurately reflects performance on completely unseen future data." },
      { id: "b", text: "To reduce test set disk space." },
      { id: "c", text: "Because Python raises an exception if scalers fit on test data." },
      { id: "d", text: "To force the test set to have zero variance." },
    ],
    correctOptionId: "a",
    explanation: "Fitting transformations on the entire dataset leaks distribution parameters from test to train, resulting in optimistic, invalid metrics.",
  },
  {
    prompt: "When performing Target Encoding on high-cardinality categorical features, what severe risk arises and how is it mitigated?",
    options: [
      { id: "a", text: "Target leakage and severe overfitting; mitigated by out-of-fold target encoding and additive smoothing/regularization." },
      { id: "b", text: "Underfitting; mitigated by multiplying targets by 100." },
      { id: "c", text: "Memory allocation errors in Python dictionaries." },
      { id: "d", text: "Target values becoming complex imaginary numbers." },
    ],
    correctOptionId: "a",
    explanation: "Naive target encoding directly embeds target information into features; out-of-fold computation and Bayesian smoothing prevent target leakage.",
  },
  {
    prompt: "How do SHAP (SHapley Additive exPlanations) values evaluate feature importance in complex machine learning models?",
    options: [
      { id: "a", text: "Based on cooperative game theory, calculating the average marginal contribution of a feature across all possible feature subsets." },
      { id: "b", text: "By counting the number of times a feature appears in the source code." },
      { id: "c", text: "By measuring the execution time of CPU operations." },
      { id: "d", text: "By randomly permuting targets during inference." },
    ],
    correctOptionId: "a",
    explanation: "SHAP leverages cooperative game theory Shapley values to provide mathematically consistent and locally accurate feature attribution.",
  }
);

// 5.3 Data Engineering
defineSkill(
  "data-engineering",
  "Data Engineering",
  "DATA_SCIENCE",
  "Data lakehouse architectures, schema evolution, partitioning, and streaming.",
  {
    prompt: "What is the fundamental architectural difference between an OLTP database and an OLAP data warehouse?",
    options: [
      { id: "a", text: "OLTP is row-oriented, optimized for low-latency atomic transactions (CRUD); OLAP is columnar, optimized for analytical aggregations over millions of rows." },
      { id: "b", text: "OLTP does not support SQL; OLAP only supports SQL." },
      { id: "c", text: "OLAP databases store data exclusively on magnetic tape." },
      { id: "d", text: "OLTP databases cannot store strings." },
    ],
    correctOptionId: "a",
    explanation: "Row storage suits single-record transactional updates; columnar storage allows fast vector scans and high compression for analytical aggregations.",
  },
  {
    prompt: "Why is designing ETL/ELT pipelines to be idempotent essential in data engineering?",
    options: [
      { id: "a", text: "It guarantees that re-running a failed job for a given time window produces the exact same state without creating duplicate records or corrupted totals." },
      { id: "b", text: "It allows pipelines to bypass network authentication." },
      { id: "c", text: "It converts JSON files into CSV files automatically." },
      { id: "d", text: "It makes SQL queries execute in constant time $O(1)$." },
    ],
    correctOptionId: "a",
    explanation: "Idempotent pipelines allow jobs to be safely retried upon failure without causing duplicate inserts or data corruption.",
  },
  {
    prompt: "In modern Lakehouse formats (e.g. Apache Iceberg, Delta Lake), how is ACID transactional consistency achieved over object storage like AWS S3?",
    options: [
      { id: "a", text: "By using an immutable append-only transaction metadata log that commits state via atomic pointer swaps." },
      { id: "b", text: "By holding a distributed hardware lock on the entire S3 bucket." },
      { id: "c", text: "By deleting and re-uploading all Parquet files on every write." },
      { id: "d", text: "Object storage natively supports multi-file distributed two-phase commits." },
    ],
    correctOptionId: "a",
    explanation: "Table formats like Iceberg track snapshots via metadata JSON/Avro logs, achieving atomic commits and time-travel on object stores.",
  }
);

// 5.4 Data Visualization
defineSkill(
  "data-visualization",
  "Data Visualisation",
  "DATA_SCIENCE",
  "Chart semantics, visual encoding, interactive dashboards, and design hygiene.",
  {
    prompt: "When visualizing quantitative changes over continuous time, which visual chart type is universally recommended over a bar chart?",
    options: [
      { id: "a", text: "A line chart, because continuous lines visually encode continuity, trend slopes, and temporal progression." },
      { id: "b", text: "A 3D pie chart." },
      { id: "c", text: "A radar chart with filled areas." },
      { id: "d", text: "A word cloud." },
    ],
    correctOptionId: "a",
    explanation: "Line charts connect consecutive data points across continuous intervals, making slopes and acceleration visually intuitive.",
  },
  {
    prompt: "Why is truncating the y-axis on a standard bar chart (not starting at zero) considered a major visualization distortion?",
    options: [
      { id: "a", text: "Because bar charts encode values through visual bar height/length; truncating the baseline exaggerates tiny differences misleadingly." },
      { id: "b", text: "Because modern web browsers cannot render charts with non-zero baselines." },
      { id: "c", text: "Because it triggers CSS rendering artifacts." },
      { id: "d", text: "Bar charts do not have a y-axis." },
    ],
    correctOptionId: "a",
    explanation: "The visual metaphor of a bar is its physical length proportional to zero; cutting the axis distorts the relative ratio.",
  },
  {
    prompt: "Why are perceptually uniform color maps (like Viridis or Cividis) preferred over the traditional rainbow (Jet) palette in scientific visualization?",
    options: [
      { id: "a", text: "They maintain uniform visual lightness increments across values, avoid false banding artifacts, and remain legible for colorblind viewers." },
      { id: "b", text: "They consume less printer ink." },
      { id: "c", text: "They increase chart rendering frame rates." },
      { id: "d", text: "They only display two colors." },
    ],
    correctOptionId: "a",
    explanation: "Perceptually uniform palettes map data magnitude monotonically to perceived luminance, preventing artificial visual thresholds.",
  }
);

// 5.5 Statistics
defineSkill(
  "statistics",
  "Statistics",
  "DATA_SCIENCE",
  "Probability distributions, p-values, confidence intervals, and Bayesian inference.",
  {
    prompt: "In classical frequentist hypothesis testing, what is the precise definition of a p-value?",
    options: [
      { id: "a", text: "The probability of observing a test statistic as extreme as or more extreme than the actual result, assuming the null hypothesis is true." },
      { id: "b", text: "The probability that the null hypothesis is true." },
      { id: "c", text: "The probability that the alternative hypothesis is false." },
      { id: "d", text: "The percentage of errors in the dataset." },
    ],
    correctOptionId: "a",
    explanation: "A p-value is $P(\\text{data} \\mid H_0)$, not the posterior probability of the hypothesis $P(H_0 \\mid \\text{data})$.",
  },
  {
    prompt: "What does the Central Limit Theorem (CLT) state regarding the sampling distribution of the sample mean?",
    options: [
      { id: "a", text: "Given a sufficiently large sample size, the sampling distribution of the mean approaches a normal distribution, regardless of the underlying population's distribution." },
      { id: "b", text: "All populations in nature follow a normal distribution." },
      { id: "c", text: "Variance decreases to zero as sample size grows." },
      { id: "d", text: "The sample mean is always equal to the population median." },
    ],
    correctOptionId: "a",
    explanation: "CLT guarantees normality of sample means from independent, identically distributed variables with finite variance for sufficiently large $N$.",
  },
  {
    prompt: "When running 1,000 simultaneous statistical hypothesis tests at $\\alpha = 0.05$, why is applying False Discovery Rate (FDR) control (like Benjamini-Hochberg) necessary?",
    options: [
      { id: "a", text: "Without correction for multiple testing, ~50 false positives would occur purely by random chance ($1000 \\times 0.05$)." },
      { id: "b", text: "Because p-values cannot be computed when $N > 100$." },
      { id: "c", text: "To force all p-values to zero." },
      { id: "d", text: "To eliminate the need for confidence intervals." },
    ],
    correctOptionId: "a",
    explanation: "Multiple comparisons accumulate alpha error; FDR procedures bound the proportion of false positives among rejected nulls.",
  }
);

// 5.6 Pandas
defineSkill(
  "pandas",
  "Pandas",
  "DATA_SCIENCE",
  "Vectorized operations, multi-indexes, groupby aggregations, and memory profiling.",
  {
    prompt: "Why should iterating over DataFrame rows with `for index, row in df.iterrows():` be avoided in high-performance Python data pipelines?",
    options: [
      { id: "a", text: "`iterrows()` constructs a new Series object for each row, destroying vectorization and running orders of magnitude slower than columnar operations." },
      { id: "b", text: "`iterrows()` corrupts column data types to strings." },
      { id: "c", text: "It is deprecated and removed in Pandas 2.0." },
      { id: "d", text: "It forces Pandas to write rows to disk." },
    ],
    correctOptionId: "a",
    explanation: "Iterating row-by-row creates Python object overhead per cell; vectorized array operations run in optimized C/SIMD.",
  },
  {
    prompt: "What causes the notorious `SettingWithCopyWarning` in Pandas when assigning values to a DataFrame column?",
    options: [
      { id: "a", text: "Chained indexing (e.g. `df[df['A'] > 0]['B'] = 1`), where Pandas cannot determine if the operation modifies a view or a copy." },
      { id: "b", text: "Running out of physical memory." },
      { id: "c", text: "Assigning floating-point numbers to integer columns." },
      { id: "d", text: "Renaming a column that has null values." },
    ],
    correctOptionId: "a",
    explanation: "Chained indexing creates ambiguity between views and copies; the idiomatic fix is `df.loc[row_indexer, 'B'] = 1`.",
  },
  {
    prompt: "How can you reduce the memory usage of a string column with low cardinality (e.g. 5 repeated status codes across 10 million rows) in Pandas?",
    options: [
      { id: "a", text: "Convert the column to the `category` dtype (`df['status'].astype('category')`)." },
      { id: "b", text: "Convert the column to `object` dtype." },
      { id: "c", text: "Save the DataFrame as a CSV file." },
      { id: "d", text: "Replace strings with Python tuples." },
    ],
    correctOptionId: "a",
    explanation: "Categorical dtypes store strings in an integer lookup dictionary, drastically cutting memory usage for repetitive text.",
  }
);

// ==========================================
// 6. ML FRAMEWORKS (4 skills)
// ==========================================

// 6.1 PyTorch
defineSkill(
  "pytorch",
  "PyTorch",
  "ML_FRAMEWORKS",
  "Autograd, custom nn.Modules, distributed data parallel, and CUDA memory management.",
  {
    prompt: "Why is it standard practice to wrap inference evaluation loops in `with torch.no_grad():` in PyTorch?",
    options: [
      { id: "a", text: "It deactivates the Autograd computation graph engine, significantly reducing memory consumption and speeding up forward passes." },
      { id: "b", text: "It converts neural network weights to zero." },
      { id: "c", text: "It prevents Python from printing warnings." },
      { id: "d", text: "It forces execution to run on CPU only." },
    ],
    correctOptionId: "a",
    explanation: "`torch.no_grad()` stops tracking operations for gradient backpropagation, saving VRAM during validation.",
  },
  {
    prompt: "What happens if a developer forgets to call `optimizer.zero_grad()` before `loss.backward()` in a standard PyTorch training loop?",
    options: [
      { id: "a", text: "Gradients accumulate into existing parameter buffers, causing parameter updates to be based on summed gradients from multiple mini-batches." },
      { id: "b", text: "PyTorch raises a `ZeroGradientException`." },
      { id: "c", text: "The model weights are randomly reinitialized." },
      { id: "d", text: "The learning rate becomes negative." },
    ],
    correctOptionId: "a",
    explanation: "PyTorch accumulates gradients by design (useful for gradient accumulation); failing to zero them mixes gradients across batches.",
  },
  {
    prompt: "Why is `DistributedDataParallel` (DDP) preferred over `DataParallel` (DP) for multi-GPU training in PyTorch?",
    options: [
      { id: "a", text: "DDP spawns an independent process per GPU, eliminating Python Global Interpreter Lock (GIL) contention and overlapping gradient all-reduce communication." },
      { id: "b", text: "DP does not support CUDA." },
      { id: "c", text: "DDP runs without any network communication." },
      { id: "d", text: "DP is deprecated and removed in PyTorch 2.0." },
    ],
    correctOptionId: "a",
    explanation: "DDP uses multi-process architecture with Ring-AllReduce, avoiding the single-process master GPU bottleneck of DP.",
  }
);

// 6.2 TensorFlow
defineSkill(
  "tensorflow",
  "TensorFlow",
  "ML_FRAMEWORKS",
  "Keras functional API, computation graphs, TF.data pipelines, and SavedModel export.",
  {
    prompt: "What is the primary benefit of decorating a Python function with `@tf.function` in TensorFlow 2+?",
    options: [
      { id: "a", text: "It compiles the Python function into a high-performance, optimized TensorFlow computation graph via AutoGraph." },
      { id: "b", text: "It converts the model into JavaScript." },
      { id: "c", text: "It automatically uploads training metrics to TensorBoard." },
      { id: "d", text: "It restricts the function to single-precision integers." },
    ],
    correctOptionId: "a",
    explanation: "`@tf.function` constructs static computation graphs from Python code, optimizing execution on accelerators.",
  },
  {
    prompt: "In a `tf.data.Dataset` input pipeline, what does chaining `.prefetch(tf.data.AUTOTUNE)` accomplish?",
    options: [
      { id: "a", text: "It overlaps the preprocessing and loading of data for step $N+1$ on CPU while the model is training step $N$ on GPU." },
      { id: "b", text: "It loads the entire dataset into GPU VRAM before training starts." },
      { id: "c", text: "It deletes duplicate images from disk." },
      { id: "d", text: "It normalizes image pixels between 0 and 1." },
    ],
    correctOptionId: "a",
    explanation: "`prefetch` decouples producer and consumer time, eliminating GPU idle time waiting for CPU batch preparation.",
  },
  {
    prompt: "When preparing a model for deployment on mobile and edge devices with TensorFlow Lite, what does Post-Training Quantization (e.g. FP32 to INT8) achieve?",
    options: [
      { id: "a", text: "It reduces model weight size by 4x and leverages integer hardware acceleration with minimal loss in accuracy." },
      { id: "b", text: "It converts neural networks into decision trees." },
      { id: "c", text: "It removes all convolutional layers." },
      { id: "d", text: "It requires edge devices to have a constant internet connection." },
    ],
    correctOptionId: "a",
    explanation: "Quantizing 32-bit floats to 8-bit integers compresses model footprint by ~75% and accelerates execution on edge NPUs.",
  }
);

// 6.3 Scikit-learn
defineSkill(
  "scikit-learn",
  "Scikit-learn",
  "ML_FRAMEWORKS",
  "Pipelines, ColumnTransformer, hyperparameter tuning, and ensemble regressors.",
  {
    prompt: "Why is using `sklearn.pipeline.Pipeline` strongly recommended over applying manual preprocessors before model training?",
    options: [
      { id: "a", text: "It encapsulates data transformations and estimator training into a single unit, guaranteeing transformers fit strictly during cross-validation folds without data leakage." },
      { id: "b", text: "Pipelines execute on GPUs automatically." },
      { id: "c", text: "Pipelines convert all classification problems into regressions." },
      { id: "d", text: "Scikit-learn models cannot be saved with pickle without a Pipeline." },
    ],
    correctOptionId: "a",
    explanation: "`Pipeline` chains transformers and estimators, preventing validation fold leakage during cross-validation.",
  },
  {
    prompt: "When evaluating a classification dataset with severe class imbalance (e.g. 95% Class 0 and 5% Class 1), why is `StratifiedKFold` preferred over standard `KFold`?",
    options: [
      { id: "a", text: "It ensures each split contains approximately the same percentage of samples of each target class as the complete set." },
      { id: "b", text: "It sorts all samples alphabetically before splitting." },
      { id: "c", text: "It duplicates minority class rows until folds are equal." },
      { id: "d", text: "It splits data by timestamp." },
    ],
    correctOptionId: "a",
    explanation: "Stratification preserves class proportions across all folds, avoiding empty minority classes in validation splits.",
  },
  {
    prompt: "In Scikit-learn, what two methods must a custom data transformation class implement to adhere to the Scikit-learn Transformer API contract?",
    options: [
      { id: "a", text: "`fit(X, y=None)` and `transform(X)` (often inheriting from `BaseEstimator` and `TransformerMixin`)." },
      { id: "b", text: "`predict(X)` and `score(X, y)`." },
      { id: "c", text: "`forward(X)` and `backward(grad)`." },
      { id: "d", text: "`compile()` and `train()`." },
    ],
    correctOptionId: "a",
    explanation: "The Scikit-learn transformer protocol requires `fit` (learn state) and `transform` (apply transformation).",
  }
);

// 6.4 Hugging Face
defineSkill(
  "hugging-face",
  "Hugging Face",
  "ML_FRAMEWORKS",
  "Transformers pipeline, tokenizers, AutoModel architectures, and Hub datasets.",
  {
    prompt: "In the Hugging Face `transformers` library, what are the two primary outputs of calling a tokenizer on raw text?",
    options: [
      { id: "a", text: "`input_ids` (numerical token indices) and `attention_mask` (binary mask indicating real tokens vs padding)." },
      { id: "b", text: "Raw HTML strings and CSS classes." },
      { id: "c", text: "Audio waveform arrays and sample rates." },
      { id: "d", text: "Compiled C++ bytecode." },
    ],
    correctOptionId: "a",
    explanation: "Tokenizers return `input_ids` for embedding lookups and `attention_mask` to prevent attention over pad tokens.",
  },
  {
    prompt: "What does the Hugging Face `AutoModelForSequenceClassification.from_pretrained(model_name)` abstraction do?",
    options: [
      { id: "a", text: "It automatically detects the model architecture from the checkpoint config, instantiates the model, loads pretrained weights, and attaches a classification head." },
      { id: "b", text: "It trains a model from scratch on Wikipedia." },
      { id: "c", text: "It converts PyTorch models into TensorFlow models." },
      { id: "d", text: "It creates a web server on port 8000." },
    ],
    correctOptionId: "a",
    explanation: "`AutoModel` classes inspect model metadata to instantiate the correct architecture and load pre-trained weights automatically.",
  },
  {
    prompt: "In the Hugging Face PEFT library, how does Low-Rank Adaptation (LoRA) enable parameter-efficient fine-tuning of large models on consumer GPUs?",
    options: [
      { id: "a", text: "It freezes the base model weights and injects trainable rank-decomposition matrices ($A \\times B$) into attention layers, updating < 1% of total parameters." },
      { id: "b", text: "It deletes 90% of model layers permanently." },
      { id: "c", text: "It converts model weights into 1-bit integers." },
      { id: "d", text: "It streams weights from the cloud during every token generation." },
    ],
    correctOptionId: "a",
    explanation: "LoRA freezes original weights and trains low-rank factorized matrices, drastically reducing trainable parameter counts and VRAM requirements.",
  }
);

console.log("Seeded Part 3 (AI, Data Science, ML Frameworks):", skills.length);
fs.writeFileSync("backend/src/services/skills/questionData_part3.json", JSON.stringify(skills, null, 2));
