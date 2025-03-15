import React from 'react';

const CropPredictionResult = ({ predictionData }) => {
  if (!predictionData) {
    return null;
  }

  return (
    <div className="card mt-4">
      <div className="card-header bg-success text-white">
        <h4>Prediction Results</h4>
      </div>
      <div className="card-body">
        <div className="row">
          <div className="col-md-6">
            <h5>Recommended Crop</h5>
            <div className="p-3 border rounded mb-3 bg-light">
              <h3 className="text-center text-success">{predictionData.predicted_crop}</h3>
            </div>
          </div>
          <div className="col-md-6">
            <h5>Recommended Fertilizer</h5>
            <div className="p-3 border rounded mb-3 bg-light">
              <p>{predictionData.recommended_fertilizer}</p>
            </div>
          </div>
        </div>
        
        <div className="mt-3">
          <h5>Soil Parameters</h5>
          <div className="row">
            <div className="col-md-4">
              <div className="card mb-2">
                <div className="card-body">
                  <h6>N-P-K Values</h6>
                  <p>{predictionData.nitrogen} - {predictionData.phosphorus} - {predictionData.potassium}</p>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card mb-2">
                <div className="card-body">
                  <h6>pH Value</h6>
                  <p>{predictionData.ph}</p>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card mb-2">
                <div className="card-body">
                  <h6>Climate</h6>
                  <p>Temperature: {predictionData.temperature}°C</p>
                  <p>Humidity: {predictionData.humidity}%</p>
                  <p>Rainfall: {predictionData.rainfall} mm</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CropPredictionResult;