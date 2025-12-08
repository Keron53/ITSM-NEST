# ITSM-NEST 🚀

**ITSM-NEST** is a modern, full-stack IT Service Management (ITSM) solution designed to streamline IT operations. Built with performance and scalability in mind, it leverages the power of **NestJS** for a robust backend and **React** (Vite) for a lightning-fast, responsive frontend.

![ITSM-NEST Banner](https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2070&auto=format&fit=crop)

## ✨ Key Features

Manage your IT lifecycle with a comprehensive suite of tools:

-   🔥 **Incident Management**: Track, prioritize, and resolve IT incidents efficiently to minimize downtime.
-   🧩 **Problem Management**: Identify and eliminate the root causes of recurring incidents.
-   🔄 **Change Management**: Plan, approve, and implement changes with controlled workflows to reduce risk.
-   📋 **Service Requests**: Handle general service requests from users with ease.
-   👥 **User Management**: Role-based access control (RBAC) for Admins, Agents, and Users.
-   📊 **Interactive Dashboard**: Real-time insights and metrics to monitor system health and team performance.

## 🛠️ Tech Stack

### Backend
-   **Framework**: [NestJS](https://nestjs.com/) (Node.js)
-   **Database**: MySQL (via TypeORM)
-   **Package Manager**: Yarn
-   **Authentication**: JWT

### Frontend
-   **Framework**: [React](https://reactjs.org/)
-   **Build Tool**: [Vite](https://vitejs.dev/)
-   **Styling**: [Tailwind CSS](https://tailwindcss.com/)
-   **Icons**: Lucide React

### DevOps
-   **Containerization**: Docker & Docker Compose

## 🚀 Getting Started

Run the entire application stack with a single command using Docker.

### Prerequisites
-   [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running.

### Installation

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/your-username/ITSM-NEST.git
    cd ITSM-NEST
    ```

2.  **Start the application**:
    ```bash
    docker-compose up --build
    ```
    *This command will build the backend and frontend images, start the MySQL database, and link everything together.*

3.  **Access the App**:
    -   🖥️ **Frontend**: [http://localhost](http://localhost)
    -   🔌 **Backend API**: [http://localhost:3000](http://localhost:3000)
    -   🗄️ **Database**: `localhost:3307` (User: `user_crud`, Password: `root`)

## 📂 Project Structure

```bash
ITSM-NEST/
├── src/                # NestJS Backend Source
│   ├── auth/           # Authentication Module
│   ├── incidents/      # Incident Management
│   ├── problems/       # Problem Management
│   ├── change-request/ # Change Management
│   └── ...
├── frontend/           # React Frontend Source
│   ├── src/
│   │   ├── pages/      # Application Pages
│   │   ├── components/ # Reusable Components
│   │   └── ...
├── docker-compose.yml  # Docker Orchestration
└── Dockerfile          # Backend Docker Configuration
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1.  Fork the project
2.  Create your feature branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

---

*Built with ❤️ by the ITSM-NEST Team.*
