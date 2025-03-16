import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  Cell
} from 'recharts';

const PredictionHistory = () => {
  const [predictionHistory, setPredictionHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeView, setActiveView] = useState('table');
  const [chartType, setChartType] = useState('crop');

  // Colors for charts
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

  useEffect(() => {
    const fetchPredictionHistory = async () => {
      try {
        setLoading(true);
        // Get the token from localStorage
        const token = localStorage.getItem('access_token');
        
        if (!token) {
          setError('No authentication token found. Please log in again.');
          setLoading(false);
          return;
        }

        const response = await axios.get('http://localhost:8000/api/prediction-history/', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.data && Array.isArray(response.data)) {
          // Process the data for charts
          const processedData = response.data.map(item => {
            try {
              // Safely parse the soil_params_json string into an object
              let soilParams = {};
              
              if (item.soil_params_json) {
                try {
                  soilParams = JSON.parse(item.soil_params_json);
                } catch (jsonError) {
                  console.warn('Invalid JSON in soil_params_json:', jsonError);
                  // Use an empty object if parsing fails
                  soilParams = {};
                }
              }
              
              return {
                ...item,
                ...soilParams,
                prediction_date: new Date(item.prediction_date).toLocaleDateString()
              };
            } catch (itemError) {
              console.error('Error processing item:', item, itemError);
              return {
                ...item,
                prediction_date: item.prediction_date ? new Date(item.prediction_date).toLocaleDateString() : 'Unknown date'
              };
            }
          });
          
          setPredictionHistory(processedData);
        } else {
          setError('Invalid data format received from server');
          console.error('Invalid data format:', response.data);
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching prediction history:', err);
        setError(err.response?.data?.detail || 'Failed to fetch prediction history');
        setLoading(false);
      }
    };

    fetchPredictionHistory();
  }, []);

  // Function to prepare data for crop distribution chart
  const prepareCropDistributionData = () => {
    if (!predictionHistory || predictionHistory.length === 0) return [];
    
    const cropCounts = {};
    
    predictionHistory.forEach(item => {
      if (item.crop) {
        cropCounts[item.crop] = (cropCounts[item.crop] || 0) + 1;
      }
    });
    
    return Object.keys(cropCounts).map(crop => ({
      name: crop,
      value: cropCounts[crop]
    }));
  };

  // Function to prepare data for soil parameters chart
  const prepareSoilParamsData = () => {
    if (!predictionHistory || predictionHistory.length === 0) return [];
    
    // Take the latest 10 predictions for the chart
    return predictionHistory.slice(0, 10).reverse().map(item => ({
      name: item.prediction_date || 'Unknown',
      nitrogen: parseFloat(item.n) || 0,
      phosphorus: parseFloat(item.p) || 0,
      potassium: parseFloat(item.k) || 0,
      ph: (parseFloat(item.ph) || 0) * 10, // Scaling pH for better visualization
    }));
  };

  // Function to prepare fertilizer recommendation data
  const prepareFertilizerData = () => {
    if (!predictionHistory || predictionHistory.length === 0) return [];
    
    const fertilizerCounts = {};
    
    predictionHistory.forEach(item => {
      if (item.fertilizer) {
        fertilizerCounts[item.fertilizer] = (fertilizerCounts[item.fertilizer] || 0) + 1;
      }
    });
    
    return Object.keys(fertilizerCounts).map(fertilizer => ({
      name: fertilizer,
      value: fertilizerCounts[fertilizer]
    }));
  };

  if (loading) {
    return <div className="text-center p-4">Loading prediction history...</div>;
  }

  if (error) {
    return <div className="text-center p-4 text-danger">{error}</div>;
  }

  if (!predictionHistory || predictionHistory.length === 0) {
    return <div className="text-center p-4">No prediction history found. Make some predictions first!</div>;
  }

  return (
    <div className="prediction-history">
      <h2 className="mb-4">Your Prediction History</h2>
      
      {/* View toggle buttons (using Bootstrap styling) */}
      <div className="btn-group mb-4" role="group">
        <button 
          type="button" 
          className={`btn ${activeView === 'table' ? 'btn-primary' : 'btn-outline-primary'}`}
          onClick={() => setActiveView('table')}
        >
          Table View
        </button>
        <button 
          type="button" 
          className={`btn ${activeView === 'charts' ? 'btn-primary' : 'btn-outline-primary'}`}
          onClick={() => setActiveView('charts')}
        >
          Charts View
        </button>
      </div>
      
      {/* Table View */}
      {activeView === 'table' && (
        <div className="table-responsive">
          <table className="table table-striped table-bordered">
            <thead>
              <tr>
                <th>Date</th>
                <th>Crop</th>
                <th>Fertilizer</th>
                <th>N</th>
                <th>P</th>
                <th>K</th>
                <th>pH</th>
                <th>Rainfall</th>
                <th>Humidity</th>
                <th>Temperature</th>
              </tr>
            </thead>
            <tbody>
              {predictionHistory.map((item, index) => (
                <tr key={index}>
                  <td>{item.prediction_date}</td>
                  <td>{item.crop || 'N/A'}</td>
                  <td>{item.fertilizer || 'N/A'}</td>
                  <td>{item.n || 'N/A'}</td>
                  <td>{item.p || 'N/A'}</td>
                  <td>{item.k || 'N/A'}</td>
                  <td>{item.ph || 'N/A'}</td>
                  <td>{item.rainfall || 'N/A'}</td>
                  <td>{item.humidity || 'N/A'}</td>
                  <td>{item.temperature || 'N/A'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      
      {/* Charts View */}
      {activeView === 'charts' && (
        <div>
          {/* Chart type selector */}
          <div className="form-group mb-4">
            <label htmlFor="chartType">Select Chart Type:</label>
            <select 
              id="chartType"
              className="form-control" 
              style={{ maxWidth: '300px' }}
              value={chartType}
              onChange={(e) => setChartType(e.target.value)}
            >
              <option value="crop">Crop Distribution</option>
              <option value="soil">Soil Parameters History</option>
              <option value="fertilizer">Fertilizer Recommendations</option>
            </select>
          </div>
          
          {/* Crop Distribution Pie Chart */}
          {chartType === 'crop' && (
            <div>
              <h3 className="mb-3">Crop Distribution</h3>
              <ResponsiveContainer width="100%" height={400}>
                <PieChart>
                  <Pie
                    data={prepareCropDistributionData()}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    outerRadius={150}
                    fill="#8884d8"
                    dataKey="value"
                    label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {prepareCropDistributionData().map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
          
          {/* Soil Parameters Line Chart */}
          {chartType === 'soil' && (
            <div>
              <h3 className="mb-3">Soil Parameters History (Last 10 Predictions)</h3>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart
                  data={prepareSoilParamsData()}
                  margin={{top: 5, right: 30, left: 20, bottom: 5}}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="nitrogen" stroke="#8884d8" activeDot={{r: 8}} />
                  <Line type="monotone" dataKey="phosphorus" stroke="#82ca9d" activeDot={{r: 8}} />
                  <Line type="monotone" dataKey="potassium" stroke="#ffc658" activeDot={{r: 8}} />
                  <Line type="monotone" dataKey="ph" stroke="#ff8042" activeDot={{r: 8}} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
          
          {/* Fertilizer Bar Chart */}
          {chartType === 'fertilizer' && (
            <div>
              <h3 className="mb-3">Fertilizer Recommendations</h3>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart
                  data={prepareFertilizerData()}
                  margin={{top: 5, right: 30, left: 20, bottom: 5}}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="value" fill="#8884d8">
                    {prepareFertilizerData().map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PredictionHistory;