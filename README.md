# Skillr | Technical Documentation

**Objective:** A "Tinder for learning" platform where users match based on complementary skills (teaching what they know and learning what they want).

---

## 1. Tech Stack
* **Frontend:** React (Vite) + Tailwind CSS v4 (CSS-first engine).
* **Animations:** Framer Motion (tactile UI interactions).
* **Backend/BaaS:** Supabase (PostgreSQL, Auth, Storage).
* **Icons:** Lucide-React.

---

## 2. Database Schema (PostgreSQL)

The database is normalized to ensure data integrity and to facilitate complex matching queries. All table names are **lowercase**.

### 2.1. Table: `skill_skills`
The master repository of allowed skills to prevent "junk data."
| Column | Type | Description |
| :--- | :--- | :--- |
| `id` | uuid | Primary Key |
| `name` | text | Unique skill name (e.g., "React") |
| `category` | text | Categorization for filtering (e.g., "Development") |

### 2.2. Table: `skill_profiles`
Extends the Supabase `auth.users` table with application-specific metadata.
| Column | Type | Description |
| :--- | :--- | :--- |
| `id` | uuid | Primary Key (FK to `auth.users.id`) |
| `full_name` | text | User's display name |
| `contact_number`| text | Displayed only after a mutual match |
| `avatar_url` | text | Public URL from Supabase Storage |
| `bio` | text | User's professional/learning summary |
| `updated_at` | timestamptz | Last profile modification |

### 2.3. Table: `skill_profile_skills` (Junction Table)
Maps the many-to-many relationship between profiles and skills.
| Column | Type | Description |
| :--- | :--- | :--- |
| `profile_id` | uuid | FK to `skill_profiles.id` |
| `skill_id` | uuid | FK to `skill_skills.id` |
| `association_type`| enum | Either `'have'` (can teach) or `'want'` (wants to learn) |

### 2.4. Table: `skill_matches`
Tracks interactions between users.
| Column | Type | Description |
| :--- | :--- | :--- |
| `id` | uuid | Primary Key |
| `requester_id` | uuid | User who initiated the match |
| `receiver_id` | uuid | User receiving the request |
| `status` | enum | `'pending'`, `'accepted'`, `'rejected'` |

---

## 3. Data Handling & Logic

### 3.1. The Matching Engine (RPC)
Instead of fetching all data and filtering on the client, we use a PostgreSQL function (`get_potential_matches`) for "God-level" performance.

**Logic:**
1. It identifies users who **have** a skill that the current user **wants**.
2. It excludes the current user from the results.
3. It aggregates shared skills into an array for the UI.
4. It calculates a "Sync Score" based on the count of overlapping skills.



### 3.2. Image Management
* **Storage Bucket:** `avatars`.
* **Security:** RLS policies restrict users to a folder named after their `auth.uid()`.
* **Flow:** Image is uploaded to Storage first -> Public URL is generated -> URL is saved to `skill_profiles.avatar_url`.

---

## 4. Application Architecture

### 4.1. Core Routes
* `/auth`: Login/Signup toggle.
* `/profile`: Multi-step form (Name, Bio, Photo, and Skill Selection).
* `/`: The "Feed" - displays potential match cards via the RPC.
* `/inbox`: Lists match requests and allows for Accept/Reject actions.

### 4.2. Component Breakdown
* **SkillPicker:** A searchable, multi-select component. It fetches the master list from `skill_skills` and handles local filtering.
* **Navbar:** A fixed glassmorphism dock at the bottom of the screen for mobile-first navigation.
* **MatchCard:** Features Framer Motion hover effects and "Mutual Match" detection logic.

---

## 5. Security (RLS Policies)
Row Level Security is enabled on all tables to ensure data privacy:
* **Profiles:** Viewable by all; Updatable only by the owner (`auth.uid() = id`).
* **Matches:** Viewable/Updatable only if the user is either the `requester_id` or `receiver_id`.
* **Storage:** `INSERT/UPDATE` allowed only if the file path starts with the user's ID.

---

## 6. Environment Setup
Create a `.env` file in the root directory:
```env
VITE_SUPABASE_URL=your_project_url
VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY=your_anon_key
```

---

## 7. Detailed Page Architecture & UX

### 7.1. Authentication Page (`AuthPage.jsx`)
The entry point of the application. It uses a high-contrast dark theme to set the "God-level" premium tone immediately.
* **Visuals:** Centered brand logo (Skillr) with a neon-cyan glow effect.
* **Logic:** A single `isLogin` state toggles the form between "Sign In" and "Sign Up."
* **Supabase Integration:** Uses `signInWithPassword` and `signUp`. 
* **User Flow:** Upon successful signup, users are redirected to the `ProfileSetup` page because the `hasProfile` state in `App.jsx` will evaluate to `false`.

---

### 7.2. Profile Setup & Management (`ProfileSetup.jsx`)
A comprehensive onboarding form designed as a split-screen layout on desktop and a vertical stack on mobile.
* **Identity Section (Left Column):** * **Avatar Upload:** A dashed-border dropzone. It handles real-time uploads to Supabase Storage and displays a preview immediately upon completion.
    * **Bio:** A large textarea for the user's mission statement.
* **Skills Section (Right Column):** * **SkillPickers:** Two instances of the `SkillPicker` component. One for `have` (Expertise) and one for `want` (Interests).
    * **Contact Info:** Collects the `contact_number` which remains hidden from other users until a mutual match is established.
* **Logic:** Uses an **Atomic Upsert** strategy. It deletes all existing entries in `skill_profile_skills` for the user and re-inserts the new selection to prevent stale data.



---

### 7.3. Discovery Dashboard (`Dashboard.jsx`)
The core "Tinder-like" experience. This page is responsible for showing the "Neural Match" feed.
* **The Feed:** Displays a grid of cards fetched via the `get_potential_matches` RPC.
* **Match Cards:**
    * **Sync Score:** A calculated percentage (e.g., "80% SYNC") showing how well their "Haves" match your "Wants."
    * **Shared Skills:** Small badges showing exactly which skills triggered the match.
    * **Interaction:** Clicking "Request Match" triggers a check for a **Mutual Match**.
* **Mutual Match Logic:** If user A requests user B, and user B has already requested user A, the system immediately updates the status to `accepted` and triggers a `canvas-confetti` celebration.



---

### 7.4. Match Inbox (`Inbox.jsx`)
The management hub for all incoming and successful connections.
* **Pending Requests:** Shows a list of users who have requested a match with the current user. Actions include:
    * **Accept:** Updates `skill_matches` status to `accepted`.
    * **Decline:** Updates status to `rejected`.
* **Successful Matches:** Once a match is `accepted`, the UI changes to reveal the "Contact Identity" (Phone/Email). 
* **Visuals:** Uses a simplified list view with small avatars and action buttons to keep the focus on decision-making.



---

### 7.5. Global Navigation (`Navbar.jsx`)
A persistent, floating glassmorphism dock located at the bottom of the viewport.
* **Active States:** Uses `useLocation` from `react-router-dom` to highlight the current route with a cyan glow and a `layoutId` animation from Framer Motion for smooth transitions between icons.
* **Z-Index:** Set to `z-50` to ensure it sits above all match cards and modals.