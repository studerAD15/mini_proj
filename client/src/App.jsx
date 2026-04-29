import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";

import AuroraBackground from "./components/AuroraBackground";
import Navbar from "./components/Navbar";
import HeroSection from "./components/HeroSection";
import PredictionCard from "./components/PredictionCard";
import ImageAnalysisPanel from "./components/ImageAnalysisPanel";
import FeatureCards from "./components/FeatureCards";
import ModelComparisonTable from "./components/ModelComparisonTable";
import AnalyticsDashboard from "./components/AnalyticsDashboard";
import CinematicFooter from "./components/CinematicFooter";
import SettingsPanel from "./components/SettingsPanel";

import {
  predictRisk,
  getPredictions,
  getModelInfo as fetchModelInfo,
  getModelComparison as fetchModelComparison,
  refreshModel as refreshModelAPI,
  getAnalytics as fetchAnalytics,
  getImageModelStatus as fetchImageModelStatus,
  predictUltrasoundImage as predictUltrasoundImageAPI,
} from "./services/api";

const sectionVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, delay: i * 0.15, ease: [0.25, 0.46, 0.45, 0.94] },
  }),
};

export default function App() {
  const [result, setResult] = useState(null);
  const [imageResult, setImageResult] = useState(null);
  const [modelInfo, setModelInfo] = useState(null);
  const [comparison, setComparison] = useState(null);
  const [bestModel, setBestModel] = useState("");
  const [analytics, setAnalytics] = useState(null);
  const [imageModelStatus, setImageModelStatus] = useState(null);

  const [predictions, setPredictions] = useState([]);
  const [historyTotal, setHistoryTotal] = useState(0);
  const [historyPage, setHistoryPage] = useState(1);
  const [historyTotalPages, setHistoryTotalPages] = useState(1);
  const [historyFilters, setHistoryFilters] = useState({});

  const [predicting, setPredicting] = useState(false);
  const [predictingImage, setPredictingImage] = useState(false);
  const [loadingModel, setLoadingModel] = useState(true);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [loadingAnalytics, setLoadingAnalytics] = useState(true);
  const [loadingImageStatus, setLoadingImageStatus] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [training, setTraining] = useState(false);

  const [settingsOpen, setSettingsOpen] = useState(false);
  const [lastPrediction, setLastPrediction] = useState(null);
  const [settings, setSettings] = useState({
    showFeatureImportance: true,
    compactView: false,
  });
  const [selectedModel, setSelectedModel] = useState("Default");

  const loadModelInfo = useCallback(async () => {
    setLoadingModel(true);
    try {
      const { data } = await fetchModelInfo();
      setModelInfo(data);
    } catch {
      setModelInfo(null);
    }
    try {
      const { data } = await fetchModelComparison();
      setComparison(data.models || []);
      setBestModel(data.bestModel || "");
    } catch {
      setComparison(null);
    }
    setLoadingModel(false);
  }, []);

  const loadPredictions = useCallback(
    async (filters = historyFilters, page = historyPage) => {
      setLoadingHistory(true);
      try {
        const { data } = await getPredictions({ page, limit: 10, ...filters });
        setPredictions(data.predictions || []);
        setHistoryTotal(data.total || 0);
        setHistoryPage(data.page || 1);
        setHistoryTotalPages(data.totalPages || 1);
      } catch {
        setPredictions([]);
      }
      setLoadingHistory(false);
    },
    [historyFilters, historyPage]
  );

  const loadAnalytics = useCallback(async () => {
    setLoadingAnalytics(true);
    try {
      const { data } = await fetchAnalytics();
      setAnalytics(data);
    } catch {
      setAnalytics(null);
    }
    setLoadingAnalytics(false);
  }, []);

  const loadImageModelStatus = useCallback(async () => {
    setLoadingImageStatus(true);
    try {
      const { data } = await fetchImageModelStatus();
      setImageModelStatus(data);
    } catch {
      setImageModelStatus(null);
    }
    setLoadingImageStatus(false);
  }, []);

  useEffect(() => {
    loadModelInfo();
    loadPredictions({}, 1);
    loadAnalytics();
    loadImageModelStatus();
  }, [loadAnalytics, loadImageModelStatus, loadModelInfo, loadPredictions]);

  const handlePredict = async (patientData) => {
    setPredicting(true);
    try {
      const { data } = await predictRisk(patientData);
      setResult(data);
      setLastPrediction(new Date().toISOString());
      toast.success("Prediction complete!");
      loadPredictions({}, 1);
      loadAnalytics();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Prediction failed");
    }
    setPredicting(false);
  };

  const handlePredictImage = async (file) => {
    setPredictingImage(true);
    try {
      const formData = new FormData();
      formData.append("image", file);
      const { data } = await predictUltrasoundImageAPI(formData);
      setImageResult(data);
      toast.success("Ultrasound analysis complete!");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Ultrasound analysis failed");
    }
    setPredictingImage(false);
  };

  const handleRefreshModel = async () => {
    setRefreshing(true);
    try {
      await refreshModelAPI();
      await loadModelInfo();
      toast.success("Model info refreshed");
    } catch {
      toast.error("Failed to refresh model");
    }
    setRefreshing(false);
  };

  const handleTrainModel = async () => {
    setTraining(true);
    try {
      await refreshModelAPI();
      await loadModelInfo();
      toast.success("Advanced model retrained successfully");
    } catch {
      toast.error("Training failed");
    }
    setTraining(false);
  };

  const handleClearHistory = () => {
    setPredictions([]);
    setHistoryTotal(0);
    setHistoryPage(1);
    setHistoryTotalPages(1);
    loadAnalytics();
  };

  const modelNames = comparison ? comparison.map((c) => c.model) : ["Default"];

  return (
    <>
      <AuroraBackground />

      <div className="relative z-10 min-h-screen">
        <Navbar
          lastPrediction={lastPrediction}
          onRefreshModel={handleRefreshModel}
          refreshing={refreshing}
          onOpenSettings={() => setSettingsOpen(true)}
          onTrainModel={handleTrainModel}
          training={training}
        />

        <main className="max-w-[1440px] mx-auto px-4 sm:px-6">
          <motion.div custom={0} variants={sectionVariants} initial="hidden" animate="visible">
            <HeroSection />
          </motion.div>

          <motion.div custom={1} variants={sectionVariants} initial="hidden" animate="visible">
            <PredictionCard onPredict={handlePredict} result={result} loading={predicting} />
          </motion.div>

          <motion.div custom={2} variants={sectionVariants} initial="hidden" animate="visible">
            <ImageAnalysisPanel
              status={imageModelStatus}
              loadingStatus={loadingImageStatus}
              onRefreshStatus={loadImageModelStatus}
              onPredictImage={handlePredictImage}
              predicting={predictingImage}
              result={imageResult}
            />
          </motion.div>

          <motion.div custom={3} variants={sectionVariants} initial="hidden" animate="visible">
            <FeatureCards modelInfo={modelInfo} predictions={predictions} loadingModel={loadingModel || loadingHistory} />
          </motion.div>

          <motion.div custom={4} variants={sectionVariants} initial="hidden" animate="visible">
            <ModelComparisonTable comparison={comparison} bestModel={bestModel} loading={loadingModel} />
          </motion.div>

          <motion.div custom={5} variants={sectionVariants} initial="hidden" animate="visible">
            <AnalyticsDashboard analytics={analytics} loading={loadingAnalytics} />
          </motion.div>

          <motion.div custom={6} variants={sectionVariants} initial="hidden" animate="visible">
            <CinematicFooter />
          </motion.div>
        </main>
      </div>

      <SettingsPanel
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        settings={settings}
        setSettings={setSettings}
        onClearHistory={handleClearHistory}
        modelNames={modelNames}
        selectedModel={selectedModel}
        onModelChange={setSelectedModel}
      />
    </>
  );
}

