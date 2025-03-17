import React from 'react';

const PestDetectionResult = ({ detectionData }) => {
  if (!detectionData) return null;

  return (
    <div className="mt-4">
      <div className="card">
        <div className="card-header bg-success text-white">
          <h5 className="mb-0">Detection Results</h5>
        </div>
        <div className="card-body">
          {detectionData.detected_classes && detectionData.detected_classes.length > 0 ? (
            <div>
              <h6 className="card-subtitle mb-3">Detected Issues:</h6>
              <ul className="list-group mb-3">
                {detectionData.detected_classes.map((className, index) => (
                  <li key={index} className="list-group-item list-group-item-danger">
                    {className}
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <div className="alert alert-success">
              <strong>Good news!</strong> No plant diseases detected!
            </div>
          )}
          
          {detectionData.result_image && (
            <div>
              <h6 className="card-subtitle mb-2">Analyzed Image:</h6>
              <div className="border rounded p-2 mb-3">
                <img
                  src={detectionData.result_image}
                  alt="Analyzed plant"
                  className="img-fluid"
                />
              </div>
              <small className="text-muted">
                Analyzed on: {new Date(detectionData.created_at).toLocaleString()}
              </small>
            </div>
          )}
          
          {/* Recommendations Section */}
          {detectionData.detected_classes && detectionData.detected_classes.length > 0 && (
            <div className="mt-3">
              <div className="card bg-light">
                <div className="card-header">
                  <h6 className="mb-0">Recommendations</h6>
                </div>
                <div className="card-body">
                  <p>
                    Based on the detected issues, we recommend consulting with a plant 
                    specialist for appropriate treatment options. For general care:
                  </p>
                  <ul className="mb-0">
                    <li>Isolate affected plants to prevent spread</li>
                    <li>Remove severely affected leaves</li>
                    <li>Ensure proper air circulation</li>
                    <li>Adjust watering practices as needed</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PestDetectionResult;