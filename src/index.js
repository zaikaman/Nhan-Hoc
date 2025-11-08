import React from "react";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import ReactDOM from "react-dom/client";
import "./index.css";
import { TopicPage, RoadmapPage, QuizPage, ProfilePage, ResourcesPage, AnalyticsPage, RecommendationsPage } from "./pages/index";
import App from "./App";
import AppWrapper from "./AppWrapper";
import DebugDBPage from "./pages/debug/debugDB";
import ChatPage from "./pages/chat/chat";
import PDFAnalysis from "./pages/pdfAnalysis/pdfAnalysis";
import reportWebVitals from "./reportWebVitals";

const router = createBrowserRouter([
  {
    path: "/",
    element: <ProfilePage />,
  },
  {
    path: "/profile",
    element: <ProfilePage />,
  },
  {
    path: "/test",
    element: <App></App>,
  },
  {
    path: "/roadmap/",
    element: <RoadmapPage />,
  },
  {
    path: "/quiz/",
    element: <QuizPage />,
  },
  {
    path: "/topic/",
    element: <TopicPage />,
  },
  {
    path: "/resources/",
    element: <ResourcesPage />,
  },
  {
    path: "/analytics/",
    element: <AnalyticsPage />,
  },
  {
    path: "/recommendations/",
    element: <RecommendationsPage />,
  },
  {
    path: "/pdf-analysis/",
    element: <PDFAnalysis />,
  },
  {
    path: "/chat/",
    element: <ChatPage />,
  },
  {
    path: "/debug",
    element: <DebugDBPage />,
  },
]);

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <AppWrapper>
      <RouterProvider router={router} />
    </AppWrapper>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
