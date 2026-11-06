import { BrowserRouter, MemoryRouter, Navigate, Route, Routes, useLocation } from "react-router-dom";
import { MotionConfig } from "framer-motion";
import Header from "./components/Header.jsx";
import Footer from "./components/Footer.jsx";
import ScrollToTop from "./components/ScrollToTop.jsx";
import Home from "./pages/Home.jsx";
import Quote from "./pages/Quote.jsx";
import Results from "./pages/Results.jsx";
import Checkout from "./pages/Checkout.jsx";
import Confirmation from "./pages/Confirmation.jsx";
import NotFound from "./pages/NotFound.jsx";
import IndustryPage from "./pages/IndustryPage.jsx";
import { Privacy, Terms } from "./pages/Legal.jsx";
import { Analytics } from "@vercel/analytics/react";
import { QuoteProvider } from "./lib/store.jsx";
import { IS_PREVIEW } from "./config.js";

function Shell() {
  const { pathname } = useLocation();
  const inFlow = pathname.startsWith("/quote/") || pathname === "/quote";
  return (
    <>
      <ScrollToTop />
      {!inFlow && <Header />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/quote" element={<Quote />} />
        <Route path="/quote/:step" element={<Quote />} />
        <Route path="/quotes" element={<Results />} />
        <Route path="/checkout/:id" element={<Checkout />} />
        <Route path="/confirmation" element={<Confirmation />} />
        <Route path="/insurance/:slug" element={<IndustryPage />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/home" element={<Navigate to="/" replace />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      {!inFlow && <Footer />}
      {!IS_PREVIEW && <Analytics />}
    </>
  );
}

/* The claude.ai preview has no real URL to route on, so it keeps routes in memory. */
const Router = IS_PREVIEW ? MemoryRouter : BrowserRouter;

export default function App() {
  return (
    <MotionConfig reducedMotion="user">
      <QuoteProvider>
        <Router>
          <Shell />
        </Router>
      </QuoteProvider>
    </MotionConfig>
  );
}
