/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "./components/Layout";
import { Dashboard } from "./pages/Dashboard";
import { LogoGenerator } from "./pages/LogoGenerator";
import { IconGenerator } from "./pages/IconGenerator";
import { InfographicGenerator } from "./pages/InfographicGenerator";
import { TShirtGenerator } from "./pages/TShirtGenerator";
import { PatternGenerator } from "./pages/PatternGenerator";
import { StickerGenerator } from "./pages/StickerGenerator";
import { SilhouetteGenerator } from "./pages/SilhouetteGenerator";
import { History } from "./pages/History";
import { Settings } from "./pages/Settings";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="logo" element={<LogoGenerator />} />
          <Route path="icon" element={<IconGenerator />} />
          <Route path="infographic" element={<InfographicGenerator />} />
          <Route path="tshirt" element={<TShirtGenerator />} />
          <Route path="pattern" element={<PatternGenerator />} />
          <Route path="sticker" element={<StickerGenerator />} />
          <Route path="silhouette" element={<SilhouetteGenerator />} />
          <Route path="history" element={<History />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
