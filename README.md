# Modern Student Portfolio - React Router & State Management

A premium, modern React portfolio application built with Vite and Tailwind CSS. This version includes full single-page application (SPA) routing and interactive, reactive state management features.

## 🚀 Key Features

### 1. Multi-Page client-side Navigation (React Router v6)
- **`BrowserRouter` integration** at the entrypoint (`main.jsx`).
- **Dynamic Route-based Views** in `App.jsx`:
  - `/` &rarr; `Home` Page (rendering Header Hero banner only)
  - `/about` &rarr; About Me section page
  - `/skills` &rarr; Skills section page
  - `/achievements` &rarr; Achievements section page
  - `/projects` &rarr; standalone Projects Catalog page
  - `/contact` &rarr; standalone Contact Form page
- **SPA Links** implemented using React Router `<Link>` and `<NavLink>` inside `<Navbar>` to avoid full page reloads.
- **Custom 404 Page** (`NotFound.jsx`) rendering dynamically using wildcard route `*` for any undefined path.

### 2. State Management & Interactive UI (`useState`)
- **Dark/Light Mode Toggle**: Dynamic theme state stored in `localStorage` and applied as a CSS class to the root `<html>` element.
- **Controlled Contact Form**:
  - Name, Email, and Message inputs tied directly to React state (`useState`).
  - **Live Typing Preview**: A dynamic box displays form contents in real-time as you type.
  - **Character Counter**: Live validation counting input characters in the message textbox (`0 / 500`).
- **UI Visibility Tooltip**: A secondary `useState` hook controlling an animated contact help box ("Need Help?").

### 3. Dynamic GitHub API Integration & Asynchronous State Handling (Practical 3)
- **Asynchronous State Management**: Leverages React `useState` and `useEffect` to manage `repos`, `loading`, and `error` states correctly.
- **REST API Integration**: Dynamically fetches public repositories from the GitHub API for `jiyavinchhi123`.
- **Interactive UI Feedback**:
  - **Loading Spinner Component** (`Spinner.jsx`): Displays a beautiful glassmorphic spinning circle with pulsating text during network requests.
  - **Error Alert Banner Component** (`ErrorMessage.jsx`): Shows details when a fetch fails (e.g., rate-limiting or offline) with an interactive **Retry Button** to trigger refetches.
- **Search & Filter Input**: A real-time filter bar lets users filter the loaded GitHub repositories by name.
- **Star Counts & Metadata**: Displays stargazers count with a yellow star icon and the repository's primary programming language badge.
- **Sort Ordering**: Repositories are automatically sorted by star count descending, highlighting the most popular projects first.

---

## 🛠️ Installation & Setup

1. **Clone the repository** (if setting up on a new environment).
2. **Install dependencies**:
   ```bash
   npm install
   ```
   *Note: This will install `react-router-dom` and `framer-motion` along with core packages.*
3. **Configure Environment Variables**:
   Create a `.env` file in the root directory and add your Web3Forms Access Key:
   ```env
   VITE_WEB3FORMS_ACCESS_KEY=your_access_key_here
   ```
4. **Run the Development Server**:
   ```bash
   npm run dev
   ```
5. **Build for Production**:
   ```bash
   npm run build
   ```

---

## 📂 Project Structure

```text
src/
├── assets/             # Project images & assets
├── components/         # Reusable presentation components
│   ├── About.jsx
│   ├── Achievements.jsx
│   ├── Contact.jsx     # Controlled contact form + tooltip + live preview
│   ├── Navbar.jsx      # Navigation links built using NavLink
│   ├── Projects.jsx
│   └── ...
├── pages/              # Routing pages
│   ├── Home.jsx        # Landing page layout (Hero, About, Skills, Achievements)
│   └── NotFound.jsx    # Custom 404 error page
├── App.jsx             # Routes definition & theme handling
└── main.jsx            # Entry point wrapped in <BrowserRouter>
```
