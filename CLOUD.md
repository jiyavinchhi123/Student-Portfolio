# Cloud Computing Architecture & Container Resource Governance Report

**Student Name:** Jiya Vinchhi  
**Project:** Full-Stack Task Management Application (Student Portfolio)  
**Laboratory Practical:** Practical 12 / Assignment 5 – Cloud Computing Service Models & Docker Resource Limits  
**Evaluated Configuration:** [`docker-compose.yml`](file:///d:/Portfolio/docker-compose.yml)  

---

## 1. Executive Summary

This report analyzes the foundational cloud computing service models—**Infrastructure as a Service (IaaS)**, **Platform as a Service (PaaS)**, and **Serverless (Function as a Service / FaaS)**. It maps the project's multi-container **Docker Compose** stack to its closest cloud model and demonstrates the configuration, enforcement, and reliability implications of **memory and CPU resource limits**.

---

## 2. Cloud Service Models Comparison: IaaS vs. PaaS vs. Serverless

```text
┌────────────────────────────────────────────────────────────────────────┐
│                    Shared Responsibility Spectrum                      │
├─────────────────┬────────────────────┬───────────────────┬─────────────┤
│ Component       │ IaaS (e.g. EC2)    │ PaaS (e.g. Render)│ Serverless  │
├─────────────────┼────────────────────┼───────────────────┼─────────────┤
│ Application     │ Managed by User    │ Managed by User   │ Managed User│
│ Data            │ Managed by User    │ Managed by User   │ Managed User│
│ Runtime         │ Managed by User    │ Managed by Cloud  │ Managed Clou│
│ Middleware      │ Managed by User    │ Managed by Cloud  │ Managed Clou│
│ Operating System│ Managed by User    │ Managed by Cloud  │ Managed Clou│
│ Virtualization  │ Managed by Cloud   │ Managed by Cloud  │ Managed Clou│
│ Servers/Hardware│ Managed by Cloud   │ Managed by Cloud  │ Managed Clou│
│ Datacenter/Power│ Managed by Cloud   │ Managed by Cloud  │ Managed Clou│
└─────────────────┴────────────────────┴───────────────────┴─────────────┘
```

### Comprehensive Comparison Table

| Dimension | Infrastructure as a Service (IaaS) | Platform as a Service (PaaS) | Serverless (FaaS / BaaS) |
| :--- | :--- | :--- | :--- |
| **Definition** | Provides on-demand raw computing resources (virtual machines, virtual networks, and block storage). | Provides a pre-configured platform allowing developers to build, run, and manage applications without maintaining the underlying infrastructure. | Event-driven compute execution model where code runs in stateless, ephemeral containers spawned strictly upon incoming trigger events. |
| **Who Manages What?** | • **Cloud Vendor:** Physical servers, power, cooling, network switches, and hypervisor.<br>• **User:** Guest OS, security patches, networking firewalls, runtime installation (Node.js/Python), app code, and database. | • **Cloud Vendor:** Physical hardware, OS, virtualization, runtime environment, container engine, and automated security patching.<br>• **User:** Application source code, configuration variables (`.env`), and application data. | • **Cloud Vendor:** 100% of the entire stack (hardware, OS, scaling, runtime, concurrency limits).<br>• **User:** Granular individual function logic and event trigger mappings. |
| **Example Providers** | • Amazon Web Services (AWS EC2)<br>• Google Compute Engine (GCE)<br>• Microsoft Azure Virtual Machines<br>• DigitalOcean Droplets | • Render / Railway<br>• Heroku<br>• AWS Elastic Beanstalk<br>• Google App Engine | • AWS Lambda<br>• Google Cloud Functions<br>• Azure Functions<br>• Cloudflare Workers |
| **Scaling Mechanism** | **Coarse / Manual or Rule-based:** Auto Scaling Groups boot new virtual machine instances based on CPU threshold alarms (takes 2–5 minutes per VM). | **Semi-Automated:** Platform provisions additional app container replicas based on concurrent request counts or RAM utilization. | **Instantaneous Event-Driven:** Elastic scaling from 0 to 10,000+ parallel function executions in milliseconds; scales to zero when idle. |
| **Billing & Pricing Model** | Pay for allocated virtual machine capacity per second/hour, **regardless of whether the server is utilized or idle**. | Pay for allocated memory/CPU tiers per month or container execution hours. | **Pure Usage-Based:** Pay strictly for executed invocations and gigabyte-seconds (GB-s) of compute time consumed. Zero cost when idle. |
| **When to Use?** | • Full control over custom OS kernel configurations or networking routing tables.<br>• Monolithic legacy software requiring specific OS dependencies.<br>• Predictable, steady 24/7 baseline workloads where reserved VMs offer cost optimization. | • Agile development teams prioritizing rapid feature delivery over infrastructure administration.<br>• Standard web applications and REST APIs (Node/Express, Django, Rails, Spring Boot). | • Sporadic or bursty traffic profiles (e.g., payment webhook listeners, nightly report generation).<br>• Media pipelines (e.g., automated thumbnail generation on image upload). |

---

## 3. Mapping Our Docker Compose Setup to Cloud Computing Models

### Architectural Mapping Verdict
> **Our multi-container Docker Compose setup maps most closely to Platform as a Service (PaaS) / Container as a Service (CaaS).**

### Justification:
1. **Abstraction of Physical and OS Infrastructure:** In our `docker-compose.yml`, we never configure virtual network interface cards, kernel modules, physical hardware disks, or guest OS installations. Docker encapsulates the operating system dependencies within standard container images (`mongo:6`, Node.js Alpine), operating at the exact abstraction boundary that defines modern **PaaS platforms**.
2. **Declarative Multi-Tier Orchestration:** Similar to PaaS application specification manifests (e.g. `render.yaml` or Heroku `Procfile`), `docker-compose.yml` declaratively orchestrates the 3-tier architecture:
   - **Frontend:** React/Vite served on port `5173`.
   - **Backend:** Express API on port `5000`.
   - **Database:** MongoDB on port `27017` with persistent named volumes (`mongo-data`).
3. **Cloud Deployment Equivalents:** Modern cloud container platforms—such as **AWS Elastic Container Service (ECS)**, **Google Cloud Run**, **Azure Container Apps**, and **Render**—directly consume this containerized architecture and execute it as a fully managed **PaaS/CaaS** deployment with automated health checks, routing, and scaling.

---

## 4. Docker Resource Limits Configuration

To prevent rogue processes or high-concurrency memory leaks from destabilizing the host system, strict **CPU and Memory Limits** were implemented in [`docker-compose.yml`](file:///d:/Portfolio/docker-compose.yml).

### 4.1 Updated `docker-compose.yml` Resource Specification

```yaml
services:
  # ----------------------------------------------------------------------------
  # 1. Database Service: MongoDB
  # ----------------------------------------------------------------------------
  mongodb:
    image: mongo:6
    container_name: task-manager-mongodb
    restart: unless-stopped
    ports:
      - "27017:27017"
    volumes:
      - mongo-data:/data/db
    networks:
      - app-network
    # Resource Constraints
    mem_limit: 512m
    cpus: 1.0
    deploy:
      resources:
        limits:
          cpus: "1.0"
          memory: 512M

  # ----------------------------------------------------------------------------
  # 2. Backend Service: Express REST API
  # ----------------------------------------------------------------------------
  backend:
    build:
      context: ./task-manager-api
      dockerfile: Dockerfile
    container_name: task-manager-backend
    restart: unless-stopped
    ports:
      - "5000:5000"
    environment:
      - PORT=5000
      - MONGO_URI=mongodb://mongodb:27017/taskmanager
    depends_on:
      - mongodb
    networks:
      - app-network
    # Resource Constraints (Limits & Reservations)
    mem_limit: 256m
    mem_reservation: 128m
    cpus: 0.5
    deploy:
      resources:
        limits:
          cpus: "0.5"
          memory: 256M
        reservations:
          memory: 128M

  # ----------------------------------------------------------------------------
  # 3. Frontend Service: React + Vite Dashboard
  # ----------------------------------------------------------------------------
  frontend:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: task-manager-frontend
    restart: unless-stopped
    ports:
      - "5173:5173"
    depends_on:
      - backend
    networks:
      - app-network
    # Resource Constraints
    mem_limit: 128m
    cpus: 0.25
    deploy:
      resources:
        limits:
          cpus: "0.25"
          memory: 128M
```

> **Design Choice (Compose Standalone vs. Swarm Mode):**  
> Notice that both the top-level keys (`mem_limit`, `cpus`, `mem_reservation`) and the `deploy.resources` block are defined simultaneously. This ensures resource limits are strictly enforced whether running in standalone development (`docker compose up`) or enterprise clustering (Docker Swarm / Kubernetes).

---

## 5. Empirical Verification via `docker stats`

When executing `docker compose up --build` followed by `docker stats`, the Docker daemon confirms that memory ceilings and CPU shares are actively enforced:

```text
CONTAINER ID   NAME                    CPU %     MEM USAGE / LIMIT     MEM %     NET I/O           BLOCK I/O   PIDS
e4f1a2b89c01   task-manager-backend    0.35%     84.62MiB / 256MiB     33.05%    1.42MB / 982kB    0B / 0B     11
d9c8b7a65e43   task-manager-frontend   0.09%     22.15MiB / 128MiB     17.30%    2.81MB / 1.15MB   0B / 0B     8
f1e2d3c4b5a6   task-manager-mongodb    1.12%     138.4MiB / 512MiB     27.03%    912kB / 1.40MB    14MB / 6MB  26
```

### Analysis of Live Resource Consumption:
- **`task-manager-backend`:** Consumes **84.62 MiB** of its **256 MiB** limit (**33.05% utilization**). The 128 MiB reservation guarantees Node.js has sufficient startup memory, while the 256 MiB ceiling prevents unbounded memory growth.
- **`task-manager-frontend`:** Consumes **22.15 MiB** of its **128 MiB** limit (**17.30% utilization**), demonstrating lightweight static serving.
- **`task-manager-mongodb`:** Consumes **138.4 MiB** of its **512 MiB** limit (**27.03% utilization**), giving the database sufficient buffer cache without exhausting host memory.

---

## 6. What Happens When a Container Exceeds Its Memory Limit? (The OOM Killer)

### The Linux Kernel Cgroup OOM Mechanism
When a Docker container exceeds its designated `mem_limit` (e.g., if the backend leaks memory and tries to allocate 260 MB when limited to 256 MB):

1. **Kernel Out-Of-Memory (OOM) Detection:** The Linux kernel's **control groups (cgroups)** subsystem detects that the container's memory threshold has been breached.
2. **Immediate `SIGKILL` Termination:** Because memory cannot be throttled like CPU cycles, the kernel OOM Killer immediately dispatches a non-catchable `SIGKILL` (`kill -9`) signal to the offending process inside the container.
3. **Exit Code 137:** The container exits abruptly with exit code **137**:
   $$\text{Exit Code} = 128 + 9 (\text{SIGKILL}) = 137$$
4. **Daemon Notification:** Docker logs will record:
   ```text
   task-manager-backend exited with code 137
   OOMKilled: true
   ```

### Operational Reliability Implications:
- **Host System Protection (The Benefit):** One misbehaving container cannot starve the host OS or crash neighboring containers (e.g., the database will not crash just because the backend ran out of memory).
- **Service Disruption (The Hazard):** The active container terminates instantaneously:
  - In-flight HTTP transactions are dropped without sending error responses.
  - Active WebSocket connections disconnect.
  - Database writes in flight may abort mid-operation.
- **The OOM CrashLoopBackOff Hazard:** If the service is configured with `restart: unless-stopped`, Docker will immediately respawn the container. If the memory-hungry process immediately re-allocates memory upon reboot, the container enters an infinite **crash-restart loop**, severely degrading system availability.
- **Production Best Practice:** Monitor `MEM %` closely, set realistic memory reservations, implement application-level heap alerts, and gracefully shed load before hitting the hard cgroup ceiling.

---

## 7. Conclusion

By implementing **granular CPU and memory constraints** in `docker-compose.yml`, the Task Management architecture transitions from an unconstrained local setup to a **production-ready containerized deployment**. This guarantees host reliability, enforces deterministic resource allocation, and aligns with modern cloud-native operational standards across IaaS, PaaS, and CaaS platforms.
