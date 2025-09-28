# 🔥 Toxic Release Mapper

Toxic Release Mapper is a web application that provides accessible and understandable insights into the EPA's Toxic Release Inventory (TRI) data. It empowers communities to understand the environmental impact of industrial facilities in their area through an interactive map, detailed data visualizations, and AI-powered analysis.

## 🎯 Problem Statement

The EPA's TRI dataset is a powerful resource, but its raw format can be dense, complex, and difficult for the average person to interpret. As a result, communities often struggle to understand the presence and potential impact of chemical releases from nearby industrial facilities. This information gap can be a barrier to informed public discourse and local environmental stewardship.

## ✨ Key Features

-   **Interactive Map:** Visualize the locations of toxic-releasing facilities in your area, color-coded by release volume.
-   **Facility Search:** Search for facilities by ZIP code, county, or state to see a detailed list of nearby sites and their reported chemical releases.
-   **Detailed Breakdowns:** View specific data for each facility, including total release amounts and the top chemicals being released.
-   **AI-Powered Insights (via Google Gemini):**
    -   **Health & Safety Q&A:** Ask plain-language questions about chemicals and their health effects (e.g., "What are the health risks of benzene exposure?").
    -   **Comparative Analysis:** Get contextual comparisons of environmental data, such as how a county's releases stack up against the state average.
    -   **Actionable Suggestions:** Receive AI-generated suggestions for community actions, like attending public hearings or engaging with local environmental groups.
-   **Facility Details Sidebar:** A clean, modern sidebar provides a snapshot of a facility's key information without leaving the map view.

## 🛠️ Tech Stack

This project is built with a modern, type-safe, and performant technology stack.

-   **Framework:** [Next.js](https://nextjs.org/) (React)
-   **Language:** [TypeScript](https://www.typescriptlang.org/)
-   **Styling:** [Tailwind CSS](https://tailwindcss.com/)
-   **UI Components:** [shadcn/ui](https://ui.shadcn.com/)
-   **Mapping:** [Pigeon Maps](https://pigeon-maps.js.org/)
-   **Backend API:** Next.js API Routes
-   **AI Integration:** [Google Gemini](https://gemini.google.com/)
-   **Data Source:** [EPA TRI Public Dataset](https://www.epa.gov/toxics-release-inventory-tri-program)

## 🚀 Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites

-   Node.js (v18 or later)
-   pnpm (or your preferred package manager)

### Installation & Setup

1.  **Clone the repository:**
    ```sh
    git clone https://github.com/tmtran612/toxic-release-mapper.git
    cd toxic-release-mapper
    ```

2.  **Install dependencies:**
    ```sh
    pnpm install
    ```

3.  **Set up environment variables:**
    Create a `.env.local` file in the root of the project and add your API keys.
    ```env
    GOOGLE_GENERATIVE_AI_API_KEY="YOUR_GEMINI_API_KEY"
    ```

4.  **Run the development server:**
    ```sh
    pnpm dev
    ```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 📂 Project Structure

The project follows the standard Next.js `app` directory structure.

```
/
├── app/                    # Main application source
│   ├── api/                # Backend API routes
│   ├── (pages)/            # Next.js page routes (map, search, etc.)
│   ├── layout.tsx          # Root layout
│   └── globals.css         # Global styles
├── components/             # Shared React components
│   ├── ui/                 # shadcn/ui components
│   └── map-view.tsx        # Main map component
├── lib/                    # Helper functions, type definitions, and utilities
│   ├── types.ts            # TypeScript type definitions
│   └── utils.ts            # Utility functions
└── public/                 # Static assets
```

## 🗺️ Roadmap

-   [ ] **User Watchlists:** Allow users to "watch" specific facilities or chemicals and store them in a user account.
-   [ ] **Notifications:** Send simple alerts when a watched facility reports new data.
-   [ ] **Historical Timeline:** Implement a timeline visualization to track reported emissions over several years.
-   [ ] **Advanced Data Aggregation:** Integrate a data warehouse solution (e.g., BigQuery, Snowflake) for faster and more complex queries, such as ranking the top polluters in a state.
-   [ ] **UI/UX Polish:** Continuously refine the user interface and experience based on feedback.
