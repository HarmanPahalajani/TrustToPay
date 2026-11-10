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
// 7. CLOUD & DEVOPS (8 skills)
// ==========================================

// 7.1 AWS
defineSkill(
  "aws",
  "AWS",
  "CLOUD_DEVOPS",
  "IAM policies, ECS/EKS, Lambda, S3 security, CloudFront, and VPC networking.",
  {
    prompt: "In AWS Identity and Access Management (IAM), how are permissions evaluated when a user is subject to both an `Allow` policy and an explicit `Deny` policy?",
    options: [
      { id: "a", text: "An explicit Deny always overrides any Allow, resulting in access being denied." },
      { id: "b", text: "The Allow overrides the Deny if attached directly to the user." },
      { id: "c", text: "The most recently created policy wins." },
      { id: "d", text: "AWS prompts the administrator via email to resolve the conflict." },
    ],
    correctOptionId: "a",
    explanation: "AWS policy evaluation logic enforces that an explicit Deny always trumps an Allow.",
  },
  {
    prompt: "Which architectural configuration ensures that an Amazon S3 bucket cannot be accidentally made public by any IAM identity in the AWS account?",
    options: [
      { id: "a", text: "Enabling S3 Block Public Access at the AWS Account level." },
      { id: "b", text: "Naming the bucket with the prefix `private-`." },
      { id: "c", text: "Disabling AWS CloudTrail logging." },
      { id: "d", text: "Restricting S3 uploads to JPEG files only." },
    ],
    correctOptionId: "a",
    explanation: "Account-level S3 Block Public Access enforces an absolute centralized guardrail against public bucket configurations.",
  },
  {
    prompt: "In an AWS VPC architecture, how should private backend database instances connect to the internet to download security patches without accepting inbound internet connections?",
    options: [
      { id: "a", text: "Place databases in private subnets with routes directed to a NAT Gateway located in a public subnet." },
      { id: "b", text: "Assign public IPv4 addresses directly to the database instances." },
      { id: "c", text: "Attach an Internet Gateway directly to the private subnet route table." },
      { id: "d", text: "Disable all Security Groups on port 80/443." },
    ],
    correctOptionId: "a",
    explanation: "NAT Gateways in public subnets allow outbound-only internet connectivity for private subnet workloads.",
  }
);

// 7.2 Google Cloud
defineSkill(
  "google-cloud",
  "Google Cloud",
  "CLOUD_DEVOPS",
  "Cloud Run, GKE, Cloud IAM, Pub/Sub, BigQuery, and Secret Manager.",
  {
    prompt: "In Google Cloud resource hierarchy, what is the fundamental organizational container for all GCP resources, billing, and APIs?",
    options: [
      { id: "a", text: "A Google Cloud Project." },
      { id: "b", text: "A Cloud Storage bucket." },
      { id: "c", text: "A VPC Subnetwork." },
      { id: "d", text: "A Pub/Sub Topic." },
    ],
    correctOptionId: "a",
    explanation: "Projects are the foundational units for managing GCP resources, permissions, and billing.",
  },
  {
    prompt: "In Google Cloud Run, what does configuring `min-instances: 1` accomplish for a latency-critical web microservice?",
    options: [
      { id: "a", text: "It maintains at least one warm container instance continuously, eliminating cold-start latency for incoming traffic." },
      { id: "b", text: "It limits the maximum capacity to 1 simultaneous user." },
      { id: "c", text: "It prevents Cloud Run from scaling up during traffic spikes." },
      { id: "d", text: "It enables CPU virtualization on bare metal." },
    ],
    correctOptionId: "a",
    explanation: "`min-instances` keeps warm instances active, avoiding container provisioning delays upon receiving requests.",
  },
  {
    prompt: "How does Google Cloud Workload Identity Federation improve CI/CD pipeline security (e.g. from GitHub Actions) compared to traditional service account keys?",
    options: [
      { id: "a", text: "It exchanges short-lived OIDC tokens for GCP credentials, eliminating the need to generate, store, and rotate long-lived service account key files." },
      { id: "b", text: "It encrypts GitHub repositories using Cloud KMS." },
      { id: "c", text: "It runs GitHub Actions runners inside Google datacenters." },
      { id: "d", text: "It disables IAM permission checks for automated builds." },
    ],
    correctOptionId: "a",
    explanation: "Workload Identity Federation provides keyless authentication via federated OIDC tokens, removing key leakage risks.",
  }
);

// 7.3 Microsoft Azure
defineSkill(
  "azure",
  "Microsoft Azure",
  "CLOUD_DEVOPS",
  "Azure App Services, AKS, Azure Active Directory / Entra, and Blob Storage.",
  {
    prompt: "What is an Azure Resource Group?",
    options: [
      { id: "a", text: "A logical container for grouping, managing, deploying, and monitoring related Azure resources with shared lifecycle management." },
      { id: "b", text: "A physical rack inside an Azure datacenter." },
      { id: "c", text: "A virtual hard drive used by Azure VMs." },
      { id: "d", text: "A DNS zone record." },
    ],
    correctOptionId: "a",
    explanation: "Resource Groups aggregate related Azure resources to manage permissions, tags, and lifecycle events together.",
  },
  {
    prompt: "Why are Azure Managed Identities preferred for Azure App Service instances accessing Azure Key Vault?",
    options: [
      { id: "a", text: "Azure automatically manages credential creation and rotation in Microsoft Entra ID; developers never need credentials in configuration files." },
      { id: "b", text: "Managed identities bypass all Azure RBAC checks." },
      { id: "c", text: "They eliminate network latency between App Service and Key Vault." },
      { id: "d", text: "They allow public anonymous access to Key Vault." },
    ],
    correctOptionId: "a",
    explanation: "Managed Identities provide automated, credential-less authentication backed by Azure Active Directory/Entra.",
  },
  {
    prompt: "In Azure networking, how do Azure Private Endpoints secure communication to PaaS services (such as Azure SQL or Blob Storage)?",
    options: [
      { id: "a", text: "They assign a private IP address from your VNet to the service, keeping traffic entirely on the Microsoft backbone network and blocking public internet exposure." },
      { id: "b", text: "They route all packets through a third-party commercial VPN." },
      { id: "c", text: "They encrypt hard disks using BitLocker." },
      { id: "d", text: "They convert REST API requests to FTP." },
    ],
    correctOptionId: "a",
    explanation: "Private Endpoints link PaaS resources into private VNets via private IPs, eliminating public endpoint exposure.",
  }
);

// 7.4 Docker
defineSkill(
  "docker",
  "Docker",
  "CLOUD_DEVOPS",
  "Multi-stage builds, non-root containers, build caching, and volume mounting.",
  {
    prompt: "Why should commands like `COPY package*.json ./` and `RUN npm install` precede `COPY . .` in a Node.js Dockerfile?",
    options: [
      { id: "a", text: "Docker caches intermediate layers; ordering dependency installation before source files reuses the cached `npm install` layer when only application code changes." },
      { id: "b", text: "Docker cannot compile JavaScript unless package.json is first." },
      { id: "c", text: "It reduces the final image size by 99%." },
      { id: "d", text: "To prevent root user execution." },
    ],
    correctOptionId: "a",
    explanation: "Layer caching invalidates downward; placing infrequently changing dependency steps first maximizes cache hits.",
  },
  {
    prompt: "What primary security and efficiency benefit does a Docker multi-stage build provide?",
    options: [
      { id: "a", text: "It separates the build environment (compilers, build tools, devDependencies) from the final minimal runtime image, reducing image size and attack surface." },
      { id: "b", text: "It runs containers across multiple operating systems simultaneously." },
      { id: "c", text: "It bypasses container resource limits." },
      { id: "d", text: "It automatically publishes containers to Docker Hub." },
    ],
    correctOptionId: "a",
    explanation: "Multi-stage builds discard compilers and heavy SDKs from intermediate stages, leaving only production runtime artifacts.",
  },
  {
    prompt: "Which Docker security hardening configuration is essential to prevent container breakout exploits to the host operating system?",
    options: [
      { id: "a", text: "Specifying a non-root `USER`, dropping Linux capabilities (`--cap-drop=ALL`), and mounting root as read-only (`--read-only`)." },
      { id: "b", text: "Running containers with `--privileged` flag." },
      { id: "c", text: "Disabling Docker logging drivers." },
      { id: "d", text: "Using host networking mode (`--net=host`)." },
    ],
    correctOptionId: "a",
    explanation: "Dropping capabilities and enforcing non-root execution restricts what exploits can execute if container processes are compromised.",
  }
);

// 7.5 Kubernetes
defineSkill(
  "kubernetes",
  "Kubernetes",
  "CLOUD_DEVOPS",
  "Pods, Deployments, Services, Ingress, ConfigMaps, and resource limits.",
  {
    prompt: "In Kubernetes workload management, what is the hierarchical relationship between Deployments, ReplicaSets, and Pods?",
    options: [
      { id: "a", text: "Deployments manage declarative rollouts and revisions of ReplicaSets, and ReplicaSets ensure the desired count of Pods are running." },
      { id: "b", text: "Pods manage Deployments, which manage Services." },
      { id: "c", text: "ReplicaSets create Deployments upon cluster reboot." },
      { id: "d", text: "Pods and Deployments are identical objects." },
    ],
    correctOptionId: "a",
    explanation: "Deployment controllers manage ReplicaSet versions for rolling updates; ReplicaSets ensure pod replica counts.",
  },
  {
    prompt: "What is the critical distinction between a Kubernetes `livenessProbe` and a `readinessProbe`?",
    options: [
      { id: "a", text: "A failed liveness probe triggers a container restart; a failed readiness probe removes the Pod from Service endpoints so it stops receiving traffic." },
      { id: "b", text: "Liveness probes are for ingress only; readiness probes are for storage." },
      { id: "c", text: "Readiness probes delete the container image from the node." },
      { id: "d", text: "Both probes trigger an immediate node reboot." },
    ],
    correctOptionId: "a",
    explanation: "Liveness detects deadlocks/crashes to restart containers; readiness determines if a container is warm and ready to receive traffic.",
  },
  {
    prompt: "During node maintenance or cluster autoscaling in Kubernetes, what prevents all replicas of an application from being terminated at the same time?",
    options: [
      { id: "a", text: "Configuring a PodDisruptionBudget (PDB) specifying `minAvailable` or `maxUnavailable` replicas." },
      { id: "b", text: "Setting `restartPolicy: Never` on the Pod spec." },
      { id: "c", text: "Disabling Kubelet on the control plane." },
      { id: "d", text: "Using StatefulSets without volumes." },
    ],
    correctOptionId: "a",
    explanation: "PDBs limit voluntary disruptions, guaranteeing a quorum of pods remains operational during node drains or upgrades.",
  }
);

// 7.6 CI/CD
defineSkill(
  "ci-cd",
  "CI/CD",
  "CLOUD_DEVOPS",
  "Automated test stages, artifact publishing, zero-downtime rollouts, and rollback.",
  {
    prompt: "What is the foundational objective of Continuous Integration (CI) in software development teams?",
    options: [
      { id: "a", text: "Frequently integrating code changes into a shared mainline branch accompanied by automated builds and test suites to catch regressions early." },
      { id: "b", text: "Automatically charging customers on credit cards." },
      { id: "c", text: "Deploying untested code directly to production servers every 5 minutes." },
      { id: "d", text: "Replacing software engineers with autonomous shell scripts." },
    ],
    correctOptionId: "a",
    explanation: "CI catches integration bugs early by continuously building and testing merged commits on automated runners.",
  },
  {
    prompt: "What is the key difference between a Blue/Green deployment and a Canary deployment?",
    options: [
      { id: "a", text: "Blue/Green switches 100% of traffic instantaneously between two identical production environments; Canary routes a small percentage (e.g. 5%) of users to the new version first to monitor telemetry." },
      { id: "b", text: "Blue/Green is for frontend only; Canary is for backend only." },
      { id: "c", text: "Canary deployments require complete system downtime." },
      { id: "d", text: "Blue/Green deployments do not support rollback." },
    ],
    correctOptionId: "a",
    explanation: "Blue/Green swaps entire environments instantly; Canary rolls out incrementally to small user fractions to validate safety.",
  },
  {
    prompt: "In modern CI/CD supply chain security, how do tools like Cosign and Sigstore prevent unauthorized binary tampering before deployment?",
    options: [
      { id: "a", text: "By signing container images and build attestations with verifiable cryptographic signatures that Kubernetes admission controllers verify before launching pods." },
      { id: "b", text: "By scanning source code for grammar errors." },
      { id: "c", text: "By converting container images into encrypted zip files." },
      { id: "d", text: "By deleting the Git commit history." },
    ],
    correctOptionId: "a",
    explanation: "Cryptographic image signing and SLSA provenance verify artifact origin and integrity, blocking tampered containers.",
  }
);

// 7.7 Terraform
defineSkill(
  "terraform",
  "Terraform",
  "CLOUD_DEVOPS",
  "HCL configuration, state locking, module composition, and drift detection.",
  {
    prompt: "In HashiCorp Terraform, what critical role does the `terraform.tfstate` state file perform?",
    options: [
      { id: "a", text: "It maps declared HCL configuration resources to real-world cloud resource IDs and tracks metadata to compute execution diffs." },
      { id: "b", text: "It contains the source code of the Terraform Go binary." },
      { id: "c", text: "It stores user SSH passwords in plaintext." },
      { id: "d", text: "It converts HCL to Python code." },
    ],
    correctOptionId: "a",
    explanation: "Terraform state bridges declarative code and actual infrastructure state, tracking resource IDs and dependencies.",
  },
  {
    prompt: "When multiple engineers or automated CI/CD pipelines run Terraform concurrently, what prevents corrupted state file collisions?",
    options: [
      { id: "a", text: "Configuring a remote backend (such as S3 with DynamoDB state locking or Terraform Cloud) that enforces distributed state locking." },
      { id: "b", text: "Checking `terraform.tfstate` into a public Git repository." },
      { id: "c", text: "Running Terraform with the `-force` flag." },
      { id: "d", text: "Terraform automatically merges concurrent state writes using git." },
    ],
    correctOptionId: "a",
    explanation: "Remote backend locking acquires an exclusive lock during plan/apply, preventing concurrent writes from corrupting state.",
  },
  {
    prompt: "When refactoring Terraform code to rename a resource or move it into a submodule, how can developers prevent Terraform from destroying and recreating the cloud resource?",
    options: [
      { id: "a", text: "Add a `moved` configuration block (`moved { from = ... to = ... }`) to update the state address without infrastructure changes." },
      { id: "b", text: "Delete the cloud resource manually in the AWS console first." },
      { id: "c", text: "Delete the state file." },
      { id: "d", text: "Set `prevent_destroy = false`." },
    ],
    correctOptionId: "a",
    explanation: "`moved` blocks inform Terraform of internal HCL refactors, renaming state addresses without triggering destroy/recreate cycles.",
  }
);

// 7.8 Linux
defineSkill(
  "linux",
  "Linux",
  "CLOUD_DEVOPS",
  "Systemd services, file permissions, memory management, and network utilities.",
  {
    prompt: "In Linux file permissions, what access rights does the octal mode `chmod 755 filename` grant to User, Group, and Others?",
    options: [
      { id: "a", text: "User: Read/Write/Execute (7); Group: Read/Execute (5); Others: Read/Execute (5)." },
      { id: "b", text: "Full Read/Write/Execute for everyone (777)." },
      { id: "c", text: "Read-only for all users." },
      { id: "d", text: "Write-only for group members." },
    ],
    correctOptionId: "a",
    explanation: "Octal permissions map 4=read, 2=write, 1=execute: 7 = rwx, 5 = r-x.",
  },
  {
    prompt: "In a Linux systemd service unit file, which directive guarantees that a backend process is automatically restarted if it exits with an error code or crashes?",
    options: [
      { id: "a", text: "`Restart=on-failure` (or `Restart=always`)." },
      { id: "b", text: "`Type=oneshot`" },
      { id: "c", text: "`KillMode=none`" },
      { id: "d", text: "`StandardOutput=null`" },
    ],
    correctOptionId: "a",
    explanation: "`Restart=on-failure` instructs systemd to restart crashed processes automatically with backoff intervals.",
  },
  {
    prompt: "When observing high Linux system load average alongside low CPU utilization, what is typically the root cause indicated by processes in the 'D' state in `ps` / `top`?",
    options: [
      { id: "a", text: "Processes waiting in Uninterruptible Sleep, typically stuck waiting on disk I/O, NFS mounts, or network file locking." },
      { id: "b", text: "Processes executing fast SIMD instructions on the GPU." },
      { id: "c", text: "Kernel memory corruption." },
      { id: "d", text: "Network packets arriving faster than 10Gbps." },
    ],
    correctOptionId: "a",
    explanation: "D-state processes count toward load average; they represent tasks waiting synchronously for unresponsive disk or block I/O.",
  }
);

// ==========================================
// 8. DATABASES & STORAGE (7 skills)
// ==========================================

// 8.1 PostgreSQL
defineSkill(
  "postgresql",
  "PostgreSQL",
  "DATABASES",
  "ACID transactions, MVCC vacuuming, EXPLAIN ANALYZE, and JSONB operations.",
  {
    prompt: "In PostgreSQL relational design, what is the role of a Foreign Key constraint with `ON DELETE CASCADE`?",
    options: [
      { id: "a", text: "Enforces referential integrity and automatically deletes dependent child rows when the referenced parent row is deleted." },
      { id: "b", text: "Encrypts the primary key column on disk." },
      { id: "c", text: "Converts the child table into a temporary table." },
      { id: "d", text: "Disables all index updates on the child table." },
    ],
    correctOptionId: "a",
    explanation: "Foreign key constraints maintain referential integrity; `ON DELETE CASCADE` propagates deletions to dependent child rows.",
  },
  {
    prompt: "When debugging slow SQL queries in PostgreSQL, why is `EXPLAIN (ANALYZE, BUFFERS)` preferred over plain `EXPLAIN`?",
    options: [
      { id: "a", text: "`EXPLAIN ANALYZE` actually executes the query to return real measured execution times, row counts, and buffer cache hits rather than estimated planner costs." },
      { id: "b", text: "`EXPLAIN ANALYZE` automatically creates missing B-tree indexes." },
      { id: "c", text: "`EXPLAIN` without analyze cannot parse WHERE clauses." },
      { id: "d", text: "Plain `EXPLAIN` locks the table against writes." },
    ],
    correctOptionId: "a",
    explanation: "`EXPLAIN` shows planner estimates; `ANALYZE` executes the query to display real row counts, timings, and buffer statistics.",
  },
  {
    prompt: "Under PostgreSQL Multi-Version Concurrency Control (MVCC), what critical role does the `VACUUM` process serve?",
    options: [
      { id: "a", text: "It reclaims dead row versions (tuples) left by UPDATE and DELETE operations and prevents Transaction ID (XID) wraparound failure." },
      { id: "b", text: "It compresses WAL logs into gzip archives." },
      { id: "c", text: "It converts table schemas into JSON schemas." },
      { id: "d", text: "It terminates slow idle client connections." },
    ],
    correctOptionId: "a",
    explanation: "Postgres MVCC preserves old tuple versions on updates/deletes; VACUUM reclaims page space and freezes transaction IDs.",
  }
);

// 8.2 MySQL
defineSkill(
  "mysql",
  "MySQL",
  "DATABASES",
  "InnoDB storage engine, replication topologies, query indexing, and locking modes.",
  {
    prompt: "Why is the InnoDB storage engine universally preferred over the legacy MyISAM engine in MySQL for transactional applications?",
    options: [
      { id: "a", text: "InnoDB provides full ACID compliance, foreign key constraints, crash recovery via redo logs, and row-level locking instead of full table locks." },
      { id: "b", text: "MyISAM does not support indexing." },
      { id: "c", text: "InnoDB only runs in memory without disk persistence." },
      { id: "d", text: "MyISAM was removed in MySQL 3.0." },
    ],
    correctOptionId: "a",
    explanation: "InnoDB provides robust ACID transaction guarantees, crash recovery, and high concurrency via row-level locking.",
  },
  {
    prompt: "In MySQL, if a composite index exists on `(country, status, created_at)`, which query will effectively utilize the index under the leftmost prefix rule?",
    options: [
      { id: "a", text: "`WHERE country = 'US' AND status = 'ACTIVE'`" },
      { id: "b", text: "`WHERE status = 'ACTIVE' AND created_at > '2024-01-01'` (omitting `country`)." },
      { id: "c", text: "`WHERE created_at > '2024-01-01'` (omitting `country` and `status`)." },
      { id: "d", text: "None of these queries can use composite indexes." },
    ],
    correctOptionId: "a",
    explanation: "B-tree composite indexes can only be traversed starting from the leftmost column; queries omitting the leading column cannot leverage the index tree.",
  },
  {
    prompt: "In MySQL asynchronous master-replica replication, what problem can occur if a web application writes to the master and immediately attempts to read the same record from a replica?",
    options: [
      { id: "a", text: "Replication lag may cause the replica to return stale or missing data (read-your-own-writes inconsistency)." },
      { id: "b", text: "The replica immediately crashes." },
      { id: "c", text: "The master database rolls back the write." },
      { id: "d", text: "MySQL converts the read query into a write query." },
    ],
    correctOptionId: "a",
    explanation: "Asynchronous replication introduces latency before binary logs apply on replicas; reading immediately after writing can yield stale data.",
  }
);

// 8.3 MongoDB
defineSkill(
  "mongodb",
  "MongoDB",
  "DATABASES",
  "Document modeling, aggregation pipelines, replica sets, and sharding strategies.",
  {
    prompt: "In MongoDB document modeling, what hard limit exists on the maximum size of a single BSON document?",
    options: [
      { id: "a", text: "16 Megabytes (MB), requiring large files or unbounded arrays to use GridFS or parent referencing." },
      { id: "b", text: "1 Gigabyte." },
      { id: "c", text: "64 Kilobytes." },
      { id: "d", text: "There is no limit on document size in MongoDB." },
    ],
    correctOptionId: "a",
    explanation: "MongoDB caps individual BSON documents at 16MB to prevent memory bloat and inefficient network transmission.",
  },
  {
    prompt: "When designing an aggregation pipeline in MongoDB, why should `$match` and `$project` stages be placed as early as possible in the pipeline?",
    options: [
      { id: "a", text: "Early `$match` stages utilize indexes and filter out unnecessary documents, minimizing RAM usage and compute overhead in downstream pipeline stages." },
      { id: "b", text: "MongoDB syntax rejects `$match` unless it is the first stage." },
      { id: "c", text: "It encrypts the documents in memory." },
      { id: "d", text: "Pipeline stages execute in reverse order." },
    ],
    correctOptionId: "a",
    explanation: "Filtering documents early reduces working set volume and allows index utilization before heavy aggregations or grouping.",
  },
  {
    prompt: "In a MongoDB replica set, what write concern guarantees that a write operation has been written to the majority of data-bearing voting members before returning success?",
    options: [
      { id: "a", text: "`{ w: 'majority' }`" },
      { id: "b", text: "`{ w: 0 }`" },
      { id: "c", text: "`{ w: 1 }`" },
      { id: "d", text: "`{ j: false }`" },
    ],
    correctOptionId: "a",
    explanation: "`w: 'majority'` ensures writes are committed to a majority of replica set nodes, preventing data loss during primary failover.",
  }
);

// 8.4 Redis
defineSkill(
  "redis",
  "Redis",
  "DATABASES",
  "In-memory data structures, pub/sub, TTL eviction policies, and distributed locks.",
  {
    prompt: "Which Redis data structure is optimal for maintaining a real-time leaderboard sorted by numerical user scores?",
    options: [
      { id: "a", text: "Sorted Set (ZSET), which maintains elements ordered by a floating-point score using a skip list and hash table." },
      { id: "b", text: "List (LPUSH/RPUSH)." },
      { id: "c", text: "String." },
      { id: "d", text: "Bitmap." },
    ],
    correctOptionId: "a",
    explanation: "Sorted Sets (ZSET) provide $O(\\log N)$ operations for adding, updating, and range-querying elements by score.",
  },
  {
    prompt: "Under the Cache-Aside pattern, what step should a backend take when updating a record in the primary SQL database?",
    options: [
      { id: "a", text: "Update the database first, then invalidate (delete) the corresponding cache key in Redis." },
      { id: "b", text: "Update Redis and ignore the SQL database." },
      { id: "c", text: "Never set TTL expiration on cached keys." },
      { id: "d", text: "Delete all keys across the entire Redis instance." },
    ],
    correctOptionId: "a",
    explanation: "Deleting the cached key after writing to the database forces the next read to fetch fresh state, avoiding write-ordering race conditions.",
  },
  {
    prompt: "Why should releasing a distributed lock in Redis be executed using a Lua script rather than a simple `DEL key` command?",
    options: [
      { id: "a", text: "The Lua script executes atomically, checking that the lock's stored random token matches the worker's ID before deleting to avoid releasing another worker's expired lock." },
      { id: "b", text: "Lua scripts compress Redis keys." },
      { id: "c", text: "`DEL` is disabled in Redis clustering." },
      { id: "d", text: "Lua scripts run on the client machine." },
    ],
    correctOptionId: "a",
    explanation: "Atomic verification with Lua ensures that a worker that experienced an unexpected delay does not delete a lock re-acquired by another worker.",
  }
);

// 8.5 SQLite
defineSkill(
  "sqlite",
  "SQLite",
  "DATABASES",
  "Embedded serverless architecture, WAL mode, pragmas, and concurrency locks.",
  {
    prompt: "How does SQLite's architecture differ fundamentally from client-server databases like PostgreSQL or MySQL?",
    options: [
      { id: "a", text: "SQLite is an embedded, in-process C library that reads and writes directly to standard disk files without a separate server process." },
      { id: "b", text: "SQLite only runs on web browsers via WebSockets." },
      { id: "c", text: "SQLite does not support SQL syntax." },
      { id: "d", text: "SQLite cannot enforce primary keys." },
    ],
    correctOptionId: "a",
    explanation: "SQLite runs in the host process memory and manages storage directly in single cross-platform disk files.",
  },
  {
    prompt: "What major concurrency improvement does enabling Write-Ahead Logging (`PRAGMA journal_mode = WAL;`) provide in SQLite?",
    options: [
      { id: "a", text: "It allows concurrent readers to read without blocking a writer, and a writer to write without blocking readers." },
      { id: "b", text: "It allows multiple concurrent writers to write to the same table simultaneously." },
      { id: "c", text: "It disables disk writes completely." },
      { id: "d", text: "It converts SQLite into a distributed NoSQL store." },
    ],
    correctOptionId: "a",
    explanation: "WAL mode decouples readers and writers, permitting simultaneous readers alongside a single active writer.",
  },
  {
    prompt: "When multiple threads or processes access an SQLite database concurrently, how should an application handle `SQLITE_BUSY` lock contention errors?",
    options: [
      { id: "a", text: "Set a connection busy timeout (`PRAGMA busy_timeout = 5000;`) so SQLite sleeps and retries before throwing an error, and use WAL mode." },
      { id: "b", text: "Delete the database file and recreate it." },
      { id: "c", text: "Kill the operating system process immediately." },
      { id: "d", text: "Ignore the error and assume the write succeeded." },
    ],
    correctOptionId: "a",
    explanation: "`busy_timeout` instructs the SQLite engine to wait and poll for the file lock rather than failing immediately upon contention.",
  }
);

// 8.6 Elasticsearch
defineSkill(
  "elasticsearch",
  "Elasticsearch",
  "DATABASES",
  "Inverted index, BM25 scoring, mapping analyzers, and cluster shards.",
  {
    prompt: "What underlying data structure allows Elasticsearch and Apache Lucene to perform sub-second full-text keyword searches across billions of documents?",
    options: [
      { id: "a", text: "The inverted index, which maps distinct analyzed terms to the list of documents and positions where they occur." },
      { id: "b", text: "A singly-linked list." },
      { id: "c", text: "A B+ tree index on auto-incrementing IDs." },
      { id: "d", text: "A flat JSON file read sequentially." },
    ],
    correctOptionId: "a",
    explanation: "An inverted index inverts document structure into a dictionary of terms pointing to postings lists (document IDs and frequencies).",
  },
  {
    prompt: "In Elasticsearch, what is the crucial difference between a `match` query and a `term` query?",
    options: [
      { id: "a", text: "`match` passes the search text through an analyzer (tokenizing/lowercasing) before searching; `term` searches for the exact unanalyzed byte value." },
      { id: "b", text: "`term` query performs fuzzy spell-checking automatically." },
      { id: "c", text: "`match` queries are only for numeric fields." },
      { id: "d", text: "`term` queries can only be run by administrators." },
    ],
    correctOptionId: "a",
    explanation: "`match` analyzes the query string against analyzed text fields; `term` looks up exact unmodified tokens (ideal for keywords/IDs).",
  },
  {
    prompt: "How does Elasticsearch prevent split-brain scenarios (where network partitions cause two nodes to each elect themselves as cluster master)?",
    options: [
      { id: "a", text: "By requiring a quorum of master-eligible nodes (`(N / 2) + 1`) to form a consensus before electing a master node." },
      { id: "b", text: "By assigning master status to the node with the fastest CPU." },
      { id: "c", text: "By restarting all nodes every hour." },
      { id: "d", text: "Elasticsearch clusters can only ever have 1 node in total." },
    ],
    correctOptionId: "a",
    explanation: "Quorum-based consensus guarantees that only the partition containing a majority of master-eligible nodes can form a cluster.",
  }
);

// 8.7 Database Design
defineSkill(
  "database-design",
  "Database Design",
  "DATABASES",
  "Normalization, relational constraints, foreign keys, and indexing architectures.",
  {
    prompt: "What condition must a relational database schema satisfy to achieve Third Normal Form (3NF)?",
    options: [
      { id: "a", text: "It must be in 2NF, and every non-key column must depend non-transitively directly on the primary key ('the key, the whole key, and nothing but the key')." },
      { id: "b", text: "Every table must have exactly 3 columns." },
      { id: "c", text: "All foreign keys must be disabled." },
      { id: "d", text: "Data must be stored in JSONB columns." },
    ],
    correctOptionId: "a",
    explanation: "3NF eliminates transitive dependencies where a non-prime attribute depends on another non-prime attribute.",
  },
  {
    prompt: "Under what engineering circumstance is intentional denormalization appropriate in a production relational database?",
    options: [
      { id: "a", text: "When heavy analytical read performance requires eliminating expensive multi-table joins, and write amplification/consistency overhead is acceptable." },
      { id: "b", text: "When you want to avoid writing primary keys." },
      { id: "c", text: "When disk space is severely limited." },
      { id: "d", text: "To make database schema migrations impossible." },
    ],
    correctOptionId: "a",
    explanation: "Denormalization trades redundancy and complex write synchronization for dramatically faster read query performance.",
  },
  {
    prompt: "When designing horizontal database sharding across a distributed fleet, what criteria defines an effective shard key?",
    options: [
      { id: "a", text: "High cardinality, uniform write distribution to avoid hot-spotting, and alignment with common query access patterns to minimize cross-shard joins." },
      { id: "b", text: "A Boolean flag with only two distinct values." },
      { id: "c", text: "A monotonic timestamp that routes all writes to a single shard." },
      { id: "d", text: "A random number that changes on every query." },
    ],
    correctOptionId: "a",
    explanation: "Good shard keys distribute writes evenly across cluster nodes while co-locating related entity queries to single shards.",
  }
);

// ==========================================
// 9. CYBERSECURITY (6 skills - Smart Contracts is in Part 1)
// ==========================================

// 9.1 Application Security
defineSkill(
  "application-security",
  "Application Security",
  "CYBERSECURITY",
  "OWASP Top 10 mitigation, CSRF, XSS prevention, and secure header configuration.",
  {
    prompt: "What is the primary defense against Stored Cross-Site Scripting (XSS) when rendering user-submitted text in a web application?",
    options: [
      { id: "a", text: "Context-aware output encoding (escaping HTML, JS, CSS entities) before rendering and enforcing a strict Content Security Policy (CSP)." },
      { id: "b", text: "Running an anti-virus scan on the web server." },
      { id: "c", text: "Hashing user input with MD5." },
      { id: "d", text: "Disabling JavaScript in all browser clients." },
    ],
    correctOptionId: "a",
    explanation: "Contextual output encoding neutralizes injected HTML/JS tags so browsers interpret user input strictly as inert text.",
  },
  {
    prompt: "How does the `SameSite=Lax` or `SameSite=Strict` cookie attribute mitigate Cross-Site Request Forgery (CSRF) attacks?",
    options: [
      { id: "a", text: "It instructs the browser not to send the authentication cookie along with cross-site requests initiated by third-party origins." },
      { id: "b", text: "It encrypts user passwords in database tables." },
      { id: "c", text: "It forces the website to load over HTTP instead of HTTPS." },
      { id: "d", text: "It blocks all POST requests on the origin server." },
    ],
    correctOptionId: "a",
    explanation: "`SameSite` prevents cookies from being attached to cross-site requests, neutralizing CSRF exploitation vectors.",
  },
  {
    prompt: "How should an application protect against Server-Side Request Forgery (SSRF) when fetching external user-provided URLs (e.g. fetching webhooks or image avatars)?",
    options: [
      { id: "a", text: "Resolve the domain DNS, validate that the destination IP does not fall within private/loopback/cloud metadata ranges (e.g. 169.254.169.254, 10.0.0.0/8), and disallow redirects." },
      { id: "b", text: "Check that the URL begins with `http://`." },
      { id: "c", text: "Convert the URL to uppercase." },
      { id: "d", text: "Run the request with root privileges." },
    ],
    correctOptionId: "a",
    explanation: "Validating resolved IP addresses against private subnets and internal cloud metadata services prevents SSRF attacks.",
  }
);

// 9.2 Network Security
defineSkill(
  "network-security",
  "Network Security",
  "CYBERSECURITY",
  "TLS handshake, packet inspection, firewalls, and zero-trust segmentation.",
  {
    prompt: "What significant cryptographic security enhancement does TLS 1.3 mandate over older TLS versions?",
    options: [
      { id: "a", text: "It deprecates static RSA key exchanges and weak ciphers, mandating Ephemeral Diffie-Hellman to guarantee Forward Secrecy." },
      { id: "b", text: "It transmits passwords in unencrypted plain text." },
      { id: "c", text: "It removes support for AES encryption." },
      { id: "d", text: "It requires four round-trips before encrypting application data." },
    ],
    correctOptionId: "a",
    explanation: "TLS 1.3 eliminates vulnerable legacy ciphers and enforces ephemeral key exchange for perfect forward secrecy.",
  },
  {
    prompt: "In local enterprise networks, how do ARP Spoofing (poisoning) attacks operate?",
    options: [
      { id: "a", text: "An attacker broadcasts forged ARP replies associating their MAC address with the default gateway's IP, intercepting local network traffic." },
      { id: "b", text: "An attacker floods DNS servers with invalid domain queries." },
      { id: "c", text: "An attacker physically unplugs Ethernet cables." },
      { id: "d", text: "An attacker brute-forces Wi-Fi passwords." },
    ],
    correctOptionId: "a",
    explanation: "ARP lacks authentication; forged ARP packets trick clients into routing gateway traffic through the attacker's network interface.",
  },
  {
    prompt: "What is the core architectural principle of a Zero Trust Network Architecture?",
    options: [
      { id: "a", text: "'Never trust, always verify': every request, user, and service-to-service call must be authenticated, authorized, and encrypted, even inside internal perimeters." },
      { id: "b", text: "Trusting all traffic once inside the corporate VPN firewall." },
      { id: "c", text: "Disabling all internal microservice passwords." },
      { id: "d", text: "Removing all external firewall rules." },
    ],
    correctOptionId: "a",
    explanation: "Zero Trust assumes hostile actors exist both inside and outside the perimeter, requiring continuous mutual authentication.",
  }
);

// 9.3 Secure Coding
defineSkill(
  "secure-coding",
  "Secure Coding",
  "CYBERSECURITY",
  "Input sanitization, parameterization, timing safe comparisons, and secret handling.",
  {
    prompt: "Why should passwords never be stored using fast cryptographic hashing algorithms like SHA-256 or MD5?",
    options: [
      { id: "a", text: "Modern GPUs can compute billions of SHA-256 hashes per second; slow, memory-hard algorithms (Argon2id, bcrypt, PBKDF2) are required to resist brute-force attacks." },
      { id: "b", text: "SHA-256 hashes cannot be compared in Python." },
      { id: "c", text: "MD5 passwords take up too much database disk space." },
      { id: "d", text: "Fast hashes always decrypt back to plaintext automatically." },
    ],
    correctOptionId: "a",
    explanation: "Password hashing requires computationally expensive and memory-hard algorithms like Argon2id to resist GPU/ASIC cracking.",
  },
  {
    prompt: "Why must authentication token or HMAC signature verification use constant-time comparison functions (e.g. `crypto.timingSafeEqual`)?",
    options: [
      { id: "a", text: "Standard equality (`===`) exits early on the first mismatched byte, leaking character positions through timing side-channel analysis." },
      { id: "b", text: "Standard equality causes memory leaks." },
      { id: "c", text: "Constant-time comparison converts strings to JSON." },
      { id: "d", text: "Timing functions prevent SQL injection." },
    ],
    correctOptionId: "a",
    explanation: "Early-exit string comparisons leak verification progress via nanosecond timing differences, allowing iterative token forgery.",
  },
  {
    prompt: "Why is deserializing untrusted binary payloads (e.g. Python `pickle` or Java `ObjectInputStream`) dangerous in backend services?",
    options: [
      { id: "a", text: "Object deserialization can instantiate arbitrary classes and invoke gadget chains, leading directly to Remote Code Execution (RCE)." },
      { id: "b", text: "Deserialization causes the database to drop tables." },
      { id: "c", text: "Binary serialization is incompatible with Linux." },
      { id: "d", text: "It causes HTTP requests to return 404." },
    ],
    correctOptionId: "a",
    explanation: "Deserializing untrusted data allows attackers to construct gadget chains that execute arbitrary shell commands during object construction.",
  }
);

// 9.4 Vulnerability Assessment
defineSkill(
  "vulnerability-assessment",
  "Vulnerability Assessment",
  "CYBERSECURITY",
  "Static code analysis (SAST), dynamic analysis (DAST), and CVE impact scoring.",
  {
    prompt: "In the Common Vulnerability Scoring System (CVSS v3.1), what does a Base Score of 9.8 indicate?",
    options: [
      { id: "a", text: "A Critical severity vulnerability that is typically network-accessible with low attack complexity, requiring no user interaction or privileges." },
      { id: "b", text: "A minor cosmetic bug in CSS layout." },
      { id: "c", text: "A vulnerability that requires physical access to hardware." },
      { id: "d", text: "A vulnerability that has already been patched." },
    ],
    correctOptionId: "a",
    explanation: "CVSS scores 9.0–10.0 are Critical; 9.8 represents unauthenticated, network-exploitable flaws with high impact on confidentiality, integrity, and availability.",
  },
  {
    prompt: "What is the primary difference between Static Application Security Testing (SAST) and Dynamic Application Security Testing (DAST)?",
    options: [
      { id: "a", text: "SAST inspects raw source code or bytecode at rest without running the application; DAST tests a running application externally via HTTP requests." },
      { id: "b", text: "SAST is for mobile apps only; DAST is for desktop apps." },
      { id: "c", text: "DAST requires access to Git repository commit history." },
      { id: "d", text: "SAST only detects hardware defects." },
    ],
    correctOptionId: "a",
    explanation: "SAST analyzes code structure and ASTs at rest (white-box); DAST probes running services externally (black-box).",
  },
  {
    prompt: "When prioritizing vulnerability remediation, why should security teams evaluate the Exploit Prediction Scoring System (EPSS) alongside CVSS?",
    options: [
      { id: "a", text: "EPSS estimates the probability that a CVE will actually be exploited in the wild within 30 days, helping teams prioritize actively weaponized threats." },
      { id: "b", text: "EPSS automatically generates code patches." },
      { id: "c", text: "CVSS is deprecated and replaced by EPSS." },
      { id: "d", text: "EPSS measures how many lines of code are in the codebase." },
    ],
    correctOptionId: "a",
    explanation: "CVSS measures theoretical severity; EPSS measures real-world exploitation probability, enabling threat-informed prioritization.",
  }
);

// 9.5 Security Testing
defineSkill(
  "security-testing",
  "Security Testing",
  "CYBERSECURITY",
  "Fuzzing endpoints, threat modeling, security regression tests, and red-team audits.",
  {
    prompt: "What is the primary objective of automated fuzz testing (fuzzing) in security quality assurance?",
    options: [
      { id: "a", text: "Feeding malformed, pseudo-random, and boundary inputs into software parsers and APIs to discover crashes, memory leaks, and unhandled edge cases." },
      { id: "b", text: "Testing user interface button styling and colors." },
      { id: "c", text: "Generating automated marketing documentation." },
      { id: "d", text: "Checking spelling in code comments." },
    ],
    correctOptionId: "a",
    explanation: "Fuzzing discovers software vulnerabilities by bombarding endpoints with mutated inputs to trigger crashes and unexpected state transitions.",
  },
  {
    prompt: "In threat modeling, what does the mnemonic STRIDE stand for?",
    options: [
      { id: "a", text: "Spoofing, Tampering, Repudiation, Information Disclosure, Denial of Service, and Elevation of Privilege." },
      { id: "b", text: "Security, Testing, Reliability, Integrity, Deployment, and Encryption." },
      { id: "c", text: "Syntax, Timing, Routing, Infrastructure, Debugging, and Execution." },
      { id: "d", text: "Scaling, Tracing, Recovery, Idempotency, Durability, and Efficiency." },
    ],
    correctOptionId: "a",
    explanation: "STRIDE is Microsoft's threat classification model covering the six primary categories of security threats.",
  },
  {
    prompt: "Why should automated security regression tests be incorporated into continuous integration pipelines?",
    options: [
      { id: "a", text: "To guarantee that previously resolved vulnerabilities, security configurations, and auth boundary checks cannot be inadvertently reintroduced in future PRs." },
      { id: "b", text: "To replace all manual penetration testing." },
      { id: "c", text: "To slow down deployments intentionally." },
      { id: "d", text: "Because Git requires security tests to create branches." },
    ],
    correctOptionId: "a",
    explanation: "Security unit and integration tests guard against regressions, ensuring patched vulnerabilities remain closed.",
  }
);

// 9.6 API Security
defineSkill(
  "api-security",
  "API Security",
  "CYBERSECURITY",
  "Rate limiting, payload size guards, scope enforcement, and replay attack prevention.",
  {
    prompt: "What is Broken Object Level Authorization (BOLA / IDOR), ranked #1 in the OWASP API Security Top 10?",
    options: [
      { id: "a", text: "When an API endpoint accesses records by user-supplied ID (e.g. `/api/orders/1234`) without verifying that the authenticated user owns or has permission to view that object." },
      { id: "b", text: "When an API uses JSON instead of XML." },
      { id: "c", text: "When an API server runs out of disk space." },
      { id: "d", text: "When clients forget to send an User-Agent header." },
    ],
    correctOptionId: "a",
    explanation: "BOLA occurs when endpoints expose direct object references without validating caller authorization on the specific resource ID.",
  },
  {
    prompt: "How can API gateways protect backend microservices from Regular Expression Denial of Service (ReDoS) attacks in JSON payloads?",
    options: [
      { id: "a", text: "Enforce strict request payload size limits, configure input validation schemas, and restrict regex evaluation with execution timeouts." },
      { id: "b", text: "Disable HTTPS encryption." },
      { id: "c", text: "Convert all strings into binary integers." },
      { id: "d", text: "Allow arbitrary regular expressions to run indefinitely." },
    ],
    correctOptionId: "a",
    explanation: "Limiting payload size and setting evaluation timeouts prevents catastrophic backtracking in vulnerable regular expressions.",
  },
  {
    prompt: "How does implementing API request signing (using HMAC-SHA256 with timestamps and nonces) prevent replay attacks on sensitive webhooks?",
    options: [
      { id: "a", text: "The server rejects requests with expired timestamps or previously observed nonces, ensuring an intercepted signed payload cannot be re-sent later." },
      { id: "b", text: "It compresses payloads with gzip." },
      { id: "c", text: "It forces callers to use Google Chrome." },
      { id: "d", text: "It deletes the payload after 5 milliseconds." },
    ],
    correctOptionId: "a",
    explanation: "Timestamps limit the replay window; unique nonces ensure each request can be processed exactly once within that window.",
  }
);

console.log("Seeded Part 4 (Cloud/DevOps, Databases, Cybersecurity):", skills.length);
fs.writeFileSync("backend/src/services/skills/questionData_part4.json", JSON.stringify(skills, null, 2));
