import React, { useState } from 'react';
import { Tabs, Tab } from 'react-bootstrap';
import CropPredictionForm from '../CropPrediction/CropPredictionForm';
import CropPredictionResult from '../CropPrediction/CropPredictionResult';
import PestRecognitionForm from '../PestRecognition/PestRecognitionForm';
import PestDetectionResult from '../PestRecognition/PestDetectionResult';
import PredictionHistory from '../PredictionHistory/PredictionHistory';

const Dashboard = () => {
  const [cropPrediction, setCropPrediction] = useState(null);
  const [pestDetection, setPestDetection] = useState(null);
  const [historyRefreshTrigger, setHistoryRefreshTrigger] = useState(0);

  const handleNewPrediction = (prediction) => {
    setCropPrediction(prediction);
    // Increment trigger to cause PredictionHistory to reload
    setHistoryRefreshTrigger(prev => prev + 1);
  };

  // Function to refresh history after new pest detections
  const handleNewDetection = (detection) => {
    setPestDetection(detection);
    // Increment trigger to cause PredictionHistory to reload
    setHistoryRefreshTrigger(prev => prev + 1);
  };
  return (
    <div className="container mt-4">
      <h1 className="mb-4">Farm Help Dashboard</h1>
      
      <Tabs defaultActiveKey="crop-prediction" className="mb-4">
        <Tab eventKey="crop-prediction" title="Crop Prediction">
          <div className="row">
            <div className="col-md-12">
              <CropPredictionForm onPredictionResult={handleNewPrediction} />
              <CropPredictionResult predictionData={cropPrediction} />
            </div>
          </div>
        </Tab>
        
        <Tab eventKey="pest-recognition" title="Pest Recognition">
          <div className="row">
            <div className="col-md-12">
              <PestRecognitionForm onDetectionResult={handleNewDetection} />
              <PestDetectionResult detectionData={pestDetection} />
            </div>
          </div>
        </Tab>
        <Tab eventKey="history" title="History">
          <div className="row">
            <div className="col-md-12">
              <PredictionHistory key={historyRefreshTrigger} />
            </div>
          </div>
        </Tab>
        
      </Tabs>
    </div>
  );
};

export default Dashboard;