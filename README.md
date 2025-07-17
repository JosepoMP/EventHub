# 🧠 EventHub

> EventHub is a **modular, dynamic, and scalable web-based admin panel**, developed entirely with **HTML, CSS, and JavaScript**.  
> It uses a **local JSON server** (`db.json`) to simulate backend operations and database interactions.

---

## 🚀 Overview

EventHub is designed as a powerful Single Page Application (SPA) with a clean interface and flexible logic. It allows complete management of users, events, and content — all from a dynamic dashboard and admin interface.

The project is constantly evolving and being enhanced with new functionalities, design improvements, and better code architecture.

---

## ⚙️ Tech Stack

- **HTML5**
- **CSS3** (custom responsive design)
- **JavaScript ES6+**
- **JSON Server** (`db.json`)
- **Modular JS structure**
- **SPA navigation logic**

---

## 🧩 Features

✅ **User authentication**  
✅ **Login & registration flow**  
✅ **Admin dashboard**  
✅ **Event creation and editing**  
✅ **Dynamic form validation**  
✅ **Routing simulation via JS**  
✅ **Data persistence via JSON Server**  
✅ **Real-time interface updates**

---

## 🛠️ How It Works

1. `index.html` loads the main layout and routing logic.
2. JavaScript modules dynamically handle:
   - Page navigation
   - Event listeners
   - API requests (`fetch`)
3. All data (users, events, etc.) is stored and retrieved from `db.json`.
4. Components are rendered dynamically depending on authentication and route.
5. Admins have access to event editing, deletion, and user management.

---

## 📦 File Structure

```bash
📁 WebAdmin/
├── index.html
├── /css/
│   └── styles.css
├── /js/
│   ├── main.js
│   ├── auth.js
│   ├── router.js
│   ├── events.js
│   └── ui.js
├── /pages/
│   ├── login.html
│   ├── dashboard.html
│   └── admin.html
├── db.json
└── README.md
```
## 🧪 How to Run the Project Locally

To test and explore **WebAdmin** on your own machine, follow these steps:

### 1. Clone the repository

```bash
git clone https://github.com/your-username/WebAdmin.git
cd WebAdmin
```

### 2. Install JSON Server (if not installed)

```bash
npm install -g json-server
```

> You only need to install this once globally.

### 3. Start the JSON Server

```bash
json-server --watch db.json --port 3000
```

This will start a local API server at:  
**http://localhost:3000**

### 4. Open the project

You can now open `index.html` in your browser directly or use a local server (recommended):

#### Option A – Open directly:
- Just double-click `index.html` (but some features may not work due to browser restrictions)

#### Option B – Use Live Server (VSCode plugin):
- Open the folder in **VSCode**
- Right-click `index.html` and choose **"Open with Live Server"**

---

> ✅ Now you're ready to use WebAdmin as a fully functional local SPA with persistent data, authentication, and admin panel logic — all powered by `db.json`.

---

## 💡 Possible Future Implementations

- 🌐 Connect to a real backend using Express or Node.js.
- 🧑‍💻 Role-based access (admin vs normal user).
- 🧾 Event categories and advanced filters.
- 🔔 Notification system.
- 📱 Full mobile responsiveness.
- 🔐 JWT or session-based authentication.
- 📊 Visual analytics for admin panel.

---

## 🧠 Developer Notes

- Entirely modular codebase, split by logic (auth, UI, routing, API).
- Fully functional as a **local prototype** or educational admin SPA.
- Frontend architecture can be upgraded to use frameworks like React or Vue.
- Designed with future scalability in mind.

---

## 📄 License

This project is licensed under the  
**GNU Affero General Public License v3.0**

> 🛡️ You are free to **use, modify, distribute, and run** the project —  
> but any modified version **used to provide a service over a network** must also make its **source code available** under the same license.

[View full license](https://www.gnu.org/licenses/agpl-3.0.html)

> ⚠️ Commercial use is allowed, but the license enforces strong copyleft:  
> if you build upon this project, **you must keep it open-source** and under the same AGPL license.

---

## 🧑‍🎓 Author

Made with 💻 and a lot of passion by [**Jose Patiño**](https://github.com/josegithub)  
> Full stack Developer · Tech Enthusiast · Creative Coder

---

## 🌟 Want to Collaborate?

Currently a personal project in continuous progress.  
Feel free to explore and fork for learning purposes — but for commercial or collaborative use, **please contact me first**. ✉️

---
