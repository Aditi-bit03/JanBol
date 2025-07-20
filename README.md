# 🗣️ JanBol – Bharat’s Voice for Civic Change

> Imagine a Bharat where every citizen—whether from a metro city or a remote village—can raise their voice, not through forms or portals, but simply by speaking.  
> **JanBol** is more than an app. It’s a movement to make civic engagement inclusive, voice-first, and barrier-free.  
> Powered by GenAI and built for real Bharat, JanBol lets people speak their truth in their language, in their voice so no issue goes unheard, and no voice goes unnoticed.



🔗 [Live Demo](https://jan-bol.vercel.app/)




<img width="957" height="473" alt="homescreen" src="https://github.com/user-attachments/assets/56267efc-da88-473c-a9c8-a99f33d83fae" />





## ✨ Features Overview

| 🔥 Feature | 💡 Description |
|-----------|----------------|
| 🎙️ **Voice-First Issue Reporting** | Citizens can report civic issues using just their **voice** — no typing or complex forms needed. |
| 🌐 **Multilingual Support** | Built for Bharat: supports many regional languages  |
| 🤖 **GenAI-Powered Transcription & Summarization** | Converts voice input into structured, meaningful civic reports with **AI-powered analysis**. |
| 📊 **Real-Time Civic Dashboard** | Displays **live stats**, resolution metrics, and active user data for **transparency and accountability**. |
| 🧠 **Intent & Category Detection** | Automatically detects issue types (e.g., **garbage**, **water**, **roads**) for faster backend routing. |
| 📍 **Scalable Backend Infrastructure** | Powered by **Node.js + MongoDB** with room for scaling, integrations, and real-time updates. |





## 🧰 Tech Stack Used

JanBol is built using a modern, scalable, and privacy-conscious tech stack designed to empower users with seamless voice-based civic reporting.

| 🧩 Layer | 🛠️ Technology | 📌 Description |
|---------|----------------|----------------|
| 🎛️ **Frontend** | **React Native (Expo)** | Cross-platform mobile UI with a smooth, minimal, voice-first design. |
| 🌐 **Voice Recognition & NLP** | **Google Dialogflow** | Multilingual voice input, intent detection, and natural language understanding. |
| 🤖 **AI Processing** | **GenAI APIs / Custom ML Logic** | Transcribes voice, summarizes input, and converts it into structured civic data. |
| 🖥️ **Backend** | **Node.js + Express.js** | Handles API routes, AI pipeline integration, and data processing. |
| 🗄️ **Database** | **MongoDB (MongoDB Atlas)** | Stores civic reports, categories, metadata, and system logs in a flexible NoSQL format. |
| 📡 **Notifications** | **Firebase Cloud Messaging (FCM)** *(optional)* | Enables push notifications for updates and confirmations. |
| 🚀 **Deployment** | **Vercel (Frontend)** | Cloud-hosted services to ensure smooth public access and demos. |
| 🔐 **Security & Privacy** | **HT**





## 🛠️ Local Setup

Follow the steps below to run the **JanBol** project locally on your machine.



### 📦  Clone the Repository

```bash
git clone https://github.com/<your-username>/janbol.git
cd janbol/Project


FRONTEND
cd frontend
npm install


BACKEND
cd ../backend
npm install




## 🔐  Configure Environment Variables

Create a `.env` file **inside the `backend` folder** and add the following key-value pairs:

```env
GOOGLE_CLOUD_API_KEY=your_google_cloud_api_key
DIALOGFLOW_PROJECT_ID=your_dialogflow_project_id
FIREBASE_SERVER_KEY=your_firebase_server_key
MONGODB_URI=your_mongodb_connection_string


🚀 Run the Project
Start Backend

cd backend
npm run dev

Start Frontend (Expo)
Open a new terminal:
cd frontend
npx expo start
This will launch Expo DevTools. You can choose to run the app on Android, iOS, or Web


