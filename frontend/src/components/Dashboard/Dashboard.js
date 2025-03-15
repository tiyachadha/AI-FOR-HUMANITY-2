import React, { useState } from 'react';
import { Tabs, Tab } from 'react-bootstrap';
import CropPredictionForm from '../CropPrediction/CropPredictionForm';
import CropPredictionResult from '../CropPrediction/CropPredictionResult';
import PestRecognitionForm from '../PestRecognition/PestRecognitionForm';
import PestDetectionResult from '../PestRecognition/PestDetectionResult';

const Dashboard = () => {
  const [cropPrediction, setCropPrediction] = useState(null);
  const [pestDetection, setPestDetection] = useState(null);

  return (
    <div className="container mt-4">
      <h1 className="mb-4">Farm Help Dashboard</h1>
      
      <Tabs defaultActiveKey="crop-prediction" className="mb-4">
        <Tab eventKey="crop-prediction" title="Crop Prediction">
          <div className="row">
            <div className="col-md-12">
              <CropPredictionForm onPredictionResult={setCropPrediction} />
              <CropPredictionResult predictionData={cropPrediction} />
            </div>
          </div>
        </Tab>
        
        <Tab eventKey="pest-recognition" title="Pest Recognition">
          <div className="row">
            <div className="col-md-12">
              <PestRecognitionForm onDetectionResult={setPestDetection} />
              <PestDetectionResult detectionData={pestDetection} />
            </div>
          </div>
        </Tab>
        
        <Tab eventKey="history" title="History">
          <div className="card">
            <div className="card-header">
              <h4>Prediction History</h4>
            </div>
            <div className="card-body">
              <p>Your recent predictions and analyses will appear here.</p>
              {/* This would be implemented with a backend API call to fetch history */}
            </div>
          </div>
        </Tab>
      </Tabs>
    </div>
  );
};

export default Dashboard;