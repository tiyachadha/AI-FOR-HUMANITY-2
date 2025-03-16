import React, { useState } from 'react';
import { Container, Row, Col, Nav } from 'react-bootstrap';
import CropPredictionForm from '../CropPrediction/CropPredictionForm';
import CropPredictionResult from '../CropPrediction/CropPredictionResult';
import PestRecognitionForm from '../PestRecognition/PestRecognitionForm';
import PestDetectionResult from '../PestRecognition/PestDetectionResult';
import PredictionHistory from '../PredictionHistory/PredictionHistory';
import '../../Dashboard.css'; // We'll create this file for custom styling

const Dashboard = () => {
  const [cropPrediction, setCropPrediction] = useState(null);
  const [pestDetection, setPestDetection] = useState(null);
  const [historyRefreshTrigger, setHistoryRefreshTrigger] = useState(0);
  const [activeTab, setActiveTab] = useState('crop-prediction');

  const handleNewPrediction = (prediction) => {
    setCropPrediction(prediction);
    setHistoryRefreshTrigger(prev => prev + 1);
  };

  const handleNewDetection = (detection) => {
    setPestDetection(detection);
    setHistoryRefreshTrigger(prev => prev + 1);
  };

  const renderActiveContent = () => {
    switch (activeTab) {
      case 'crop-prediction':
        return (
          <>
            <CropPredictionForm onPredictionResult={handleNewPrediction} />
            <CropPredictionResult predictionData={cropPrediction} />
          </>
        );
      case 'pest-recognition':
        return (
          <>
            <PestRecognitionForm onDetectionResult={handleNewDetection} />
            <PestDetectionResult detectionData={pestDetection} />
          </>
        );
      case 'history':
        return <PredictionHistory key={historyRefreshTrigger} />;
      default:
        return <div>Select an option from the sidebar</div>;
    }
  };

  return (
    <Container fluid className="dashboard-container p-0">
      <Row className="m-0">
        {/* Sidebar */}
        <Col md={3} lg={2} className="sidebar p-0">
          <div className="sidebar-header">
            <h3>Farm Help</h3>
          </div>
          <div className="sidebar-user">
            <div className="user-avatar">
              <i className="bi bi-person-circle"></i>
            </div>
            <div className="user-info">
              <h6>Welcome</h6>
              <p>Farmer</p>
            </div>
          </div>
          <Nav className="flex-column sidebar-nav">
            <Nav.Item>
              <Nav.Link 
                className={activeTab === 'crop-prediction' ? 'active' : ''} 
                onClick={() => setActiveTab('crop-prediction')}
              >
                <i className="bi bi-grid-3x3-gap me-2"></i>
                Crop Prediction
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link 
                className={activeTab === 'pest-recognition' ? 'active' : ''}
                onClick={() => setActiveTab('pest-recognition')}
              >
                <i className="bi bi-bug me-2"></i>
                Pest Recognition
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link 
                className={activeTab === 'history' ? 'active' : ''}
                onClick={() => setActiveTab('history')}
              >
                <i className="bi bi-clock-history me-2"></i>
                History
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link 
                className={activeTab === 'settings' ? 'active' : ''}
                onClick={() => setActiveTab('settings')}
              >
                <i className="bi bi-gear me-2"></i>
                Settings
              </Nav.Link>
            </Nav.Item>
            <Nav.Item className="mt-auto">
              <Nav.Link 
                className="logout-link"
                onClick={() => console.log('Logout')}
              >
                <i className="bi bi-box-arrow-right me-2"></i>
                Logout
              </Nav.Link>
            </Nav.Item>
          </Nav>
        </Col>

        {/* Main Content */}
        <Col md={9} lg={10} className="main-content p-0">
          <div className="content-header">
            <h1>{activeTab.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}</h1>
            <div className="header-actions">
              <button className="btn btn-sm btn-outline-secondary me-2">
                <i className="bi bi-bell"></i>
              </button>
              <button className="btn btn-sm btn-outline-secondary">
                <i className="bi bi-question-circle"></i>
              </button>
            </div>
          </div>
          <div className="content-body">
            {renderActiveContent()}
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default Dashboard;