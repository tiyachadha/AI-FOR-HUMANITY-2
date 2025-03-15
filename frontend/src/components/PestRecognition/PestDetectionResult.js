import React from 'react';

const PestDetectionResult = ({ detectionData }) => {
  if (!detectionData) {
    return null;
  }

  return (
    <div className="card mt-4">
      <div className="card-header bg-info text-white">
        <h4>Detection Results</h4>
      </div>
      <div className="card-body">
        <div className="row">
          <div className="col-md-6">
            <h5>Uploaded Image</h5>
            <div className="border rounded p-2 mb-3">
              <img 
                src={`http://localhost:8000${detectionData.image}`} 
                alt={detectionData.detected_pest} 
                className="img-fluid" 
              />
            </div>
          </div>
          <div className="col-md-6">
            <h5>Detection Details</h5>
            <div className="border rounded p-3 mb-3">
              <h4 className="text-danger">{detectionData.detected_pest}</h4>
              <p><strong>Confidence:</strong> {(detectionData.confidence * 100).toFixed(2)}%</p>
            </div>
            
            <h5>Recommended Treatment</h5>
            <div className="border rounded p-3">
              <p>{detectionData.treatment}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PestDetectionResult;