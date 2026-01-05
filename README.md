<div align="center">
  <img src="https://via.placeholder.com/1200x400?text=LunaLoop+Banner" alt="LunaLoop Banner" width="100%" />

  # LunaLoop: Gamified Period Tracking App
  
  **A privacy-first, gamified menstrual health application built for KMK3323 Human-Computer Interaction.**
  
  [View Demo / APK] • [Report Bug] • [Request Feature]
</div>

---

## 📖 About The Project

**LunaLoop** is a high-fidelity smartphone application designed to address the lack of consistent menstrual tracking among university students. Traditional apps can be intrusive or lack motivation; LunaLoop solves this by combining **gamification** with a **privacy-first local storage architecture**.

This project was developed as part of the **KMK3323 Human-Computer Interaction** course (Semester 1 2025/2026) at UNIMAS, following a rigorous 4-phase User-Centered Design (UCD) process:
1.  **Phase 1:** User Research & MVP Scoping
2.  **Phase 2:** Conceptual Design & Wireflows
3.  **Phase 3:** Low-Fidelity Evaluation (Cooperative Evaluation)
4.  **Phase 4:** High-Fidelity Implementation & Usability Testing

### Key Features (MVP)
* **🎮 Gamification Engine:** Users earn XP, unlock badges (e.g., "Log in for 5 days"), and level up to maintain engagement.
* **🔒 Privacy Mode:** A dedicated toggle that instantly masks sensitive data and uses a discreet app icon/name.
* **⚡ Fast Daily Logging:** Streamlined one-page logging for Flow, Symptoms, Mood, and Water (takes <30 seconds).
* **📅 Dynamic CycleWheel:** Visual representation of the current phase, day count, and fertility window.
* **🔔 Smart Reminders:** Customizable notifications for period start and daily logging.
* **📱 Offline Capability:** Local-first architecture ensures the app works perfectly without an internet connection.

---

## 🛠 Tech Stack

This project utilizes a hybrid development approach to create a fully functional Android MVP.

* **Framework:** [React](https://reactjs.org/) (TypeScript) - Selected for component reusability.
* **Build System:** [Capacitor](https://capacitorjs.com/) - Wraps the web app into a native Android APK.
* **Development Tools:** Android Studio (Emulation & Build).
* **AI Tools:** Google AI Studio (Gemini 3.0 Pro) - Used for debugging complex state management and code generation.

---

## 🚀 Getting Started

Follow these steps to run the project locally for development.

### Prerequisites
* Node.js (v18 or higher)
* Android Studio (for APK generation)

### Installation

1.  **Clone the repository**
    ```sh
    git clone [https://github.com/awanan07/LunaLoop.git](https://github.com/awanan07/LunaLoop.git)
    cd LunaLoop
    ```

2.  **Install dependencies**
    ```sh
    npm install
    ```

3.  **Run the web development server**
    ```sh
    npm run dev
    ```

4.  **Sync with Android (Capacitor)**
    ```sh
    npx cap sync
    npx cap open android
    ```

---

## 🎨 Design & Screenshots

### High-Fidelity Prototype
| Home Dashboard | Fast Logging | Gamification Badges |
|:---:|:---:|:---:|
| <img src="URL_TO_YOUR_HOME_SCREENSHOT" width="200" /> | <img src="URL_TO_YOUR_LOGGING_SCREENSHOT" width="200" /> | <img src="URL_TO_YOUR_BADGES_SCREENSHOT" width="200" /> |

*Note: The design utilizes the Inter typeface and a palette of Pink (#FF729F) and Green (#4ADE80) based on the Phase 2 Style Guide.*

---

## 👥 The Team

**Faculty of Cognitive Science and Human Development (UNIMAS)**

| Name | Matric Number | Role |
|:---:|:---:|:---|
| **Abdul Aidil Azrie Bin Abdul Rahman** | 86235 | Group Leader / Dev |
| **Genyvine Meryence Anak Gerald** | 102298 | Co-Leader / Research |
| **Muhammad Zaheed Imran Bin Tanuja** | 101922 | Active Member / Media |
| **Dayang Nurrafiqah Binti Awang Abdurahman** | 98668 | Active Member / Testing |
| **Nabihah Binti Zainoldin@Zainuddin** | 100017 | Active Member / Video |
| **See Sze Pei** | 85618 | Active Member / Scenarios |

---

## 📝 License

Distributed for academic purposes.

---

## 🙏 Acknowledgements
* **Lecturer:** Professor Madya Dr. Mohd Kamal Bin Othman (G02)
* **Course:** KMK3323 Human-Computer Interaction
