import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  Cell, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';
import '../../PredictionHistory.css';

const PredictionHistory = () => {
  const [predictionHistory, setPredictionHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeView, setActiveView] = useState('table');
  const [chartType, setChartType] = useState('crop');
  const [darkMode, setDarkMode] = useState(false);

  // Enhanced color schemes
  const LIGHT_COLORS = ['#3498db', '#2ecc71', '#f1c40f', '#e74c3c', '#9b59b6', '#1abc9c'];
  const DARK_COLORS = ['#59a5f5', '#6deca9', '#ffdc65', '#ff7b69', '#ce93d8', '#4dcebd'];

  // Use color scheme based on mode
  const COLORS = darkMode ? DARK_COLORS : LIGHT_COLORS;

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

  // Function to prepare radar chart data
  const prepareRadarData = () => {
    if (!predictionHistory || predictionHistory.length === 0) return [];
    
    // Use the most recent prediction for radar chart
    const latestPrediction = predictionHistory[0];
    
    return [
      {
        subject: 'Nitrogen',
        A: parseFloat(latestPrediction.n) || 0,
        fullMark: 150
      },
      {
        subject: 'Phosphorus',
        A: parseFloat(latestPrediction.p) || 0,
        fullMark: 150
      },
      {
        subject: 'Potassium',
        A: parseFloat(latestPrediction.k) || 0,
        fullMark: 150
      },
      {
        subject: 'pH',
        A: (parseFloat(latestPrediction.ph) || 0) * 10,
        fullMark: 140
      },
      {
        subject: 'Rainfall',
        A: parseFloat(latestPrediction.rainfall) || 0,
        fullMark: 300
      },
      {
        subject: 'Temperature',
        A: parseFloat(latestPrediction.temperature) || 0,
        fullMark: 50
      }
    ];
  };

  // Custom tooltip component
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip">
          <p className="label">{`${label}`}</p>
          {payload.map((entry, index) => (
            <p key={`item-${index}`} style={{ color: entry.color }}>
              {`${entry.name}: ${entry.value}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className={`loading-container ${darkMode ? 'dark-mode' : ''}`}>
        <div className="spinner"></div>
        <p>Loading prediction history...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`error-container ${darkMode ? 'dark-mode' : ''}`}>
        <div className="error-icon">!</div>
        <p>{error}</p>
      </div>
    );
  }

  if (!predictionHistory || predictionHistory.length === 0) {
    return (
      <div className={`empty-container ${darkMode ? 'dark-mode' : ''}`}>
        <div className="empty-icon">📊</div>
        <p>No prediction history found. Make some predictions first!</p>
      </div>
    );
  }

  return (
    <div className={`prediction-history ${darkMode ? 'dark-mode' : ''}`}>
      <div className="header">
        <h2>Your Prediction History</h2>
        <div className="controls">
          <button 
            className="theme-toggle"
            onClick={() => setDarkMode(!darkMode)}
            aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
          >
            {darkMode ? '☀️' : '🌙'}
          </button>
        </div>
      </div>
      
      {/* View toggle buttons */}
      <div className="view-toggle">
        <button 
          className={activeView === 'table' ? 'active' : ''}
          onClick={() => setActiveView('table')}
        >
          <span className="icon">📋</span> Table View
        </button>
        <button 
          className={activeView === 'charts' ? 'active' : ''}
          onClick={() => setActiveView('charts')}
        >
          <span className="icon">📊</span> Charts View
        </button>
      </div>
      
      {/* Table View */}
      {activeView === 'table' && (
        <div className="table-container">
          <div className="table-wrapper">
            <table>
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
        </div>
      )}
      
      {/* Charts View */}
      {activeView === 'charts' && (
        <div className="charts-container">
          {/* Chart type selector */}
          <div className="chart-selector">
            <label htmlFor="chartType">Select Chart Type:</label>
            <select 
              id="chartType"
              value={chartType}
              onChange={(e) => setChartType(e.target.value)}
            >
              <option value="crop">Crop Distribution</option>
              <option value="soil">Soil Parameters History</option>
              <option value="fertilizer">Fertilizer Recommendations</option>
              <option value="radar">Latest Soil Parameters</option>
            </select>
          </div>
          
          <div className="chart-wrapper">
            {/* Crop Distribution Pie Chart */}
            {chartType === 'crop' && (
              <div className="chart">
                <h3>Crop Distribution</h3>
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
                    <Tooltip content={<CustomTooltip />} />
                    <Legend layout="vertical" verticalAlign="middle" align="right" />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
            
            {/* Soil Parameters Line Chart */}
            {chartType === 'soil' && (
              <div className="chart">
                <h3>Soil Parameters History (Last 10 Predictions)</h3>
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart
                    data={prepareSoilParamsData()}
                    margin={{top: 20, right: 30, left: 20, bottom: 20}}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="nitrogen" 
                      stroke={COLORS[0]} 
                      strokeWidth={2}
                      activeDot={{r: 8}} 
                      dot={{ stroke: COLORS[0], strokeWidth: 2, r: 4 }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="phosphorus" 
                      stroke={COLORS[1]} 
                      strokeWidth={2}
                      activeDot={{r: 8}} 
                      dot={{ stroke: COLORS[1], strokeWidth: 2, r: 4 }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="potassium" 
                      stroke={COLORS[2]} 
                      strokeWidth={2}
                      activeDot={{r: 8}} 
                      dot={{ stroke: COLORS[2], strokeWidth: 2, r: 4 }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="ph" 
                      stroke={COLORS[3]} 
                      strokeWidth={2}
                      activeDot={{r: 8}} 
                      dot={{ stroke: COLORS[3], strokeWidth: 2, r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
            
            {/* Fertilizer Bar Chart */}
            {chartType === 'fertilizer' && (
              <div className="chart">
                <h3>Fertilizer Recommendations</h3>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart
                    data={prepareFertilizerData()}
                    margin={{top: 20, right: 30, left: 20, bottom: 20}}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Bar dataKey="value" fill="#8884d8" barSize={40} radius={[5, 5, 0, 0]}>
                      {prepareFertilizerData().map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
            
            {/* Radar Chart for Latest Soil Parameters */}
            {chartType === 'radar' && (
              <div className="chart">
                <h3>Latest Soil Parameters</h3>
                <ResponsiveContainer width="100%" height={400}>
                  <RadarChart 
                    cx="50%" 
                    cy="50%" 
                    outerRadius="80%" 
                    data={prepareRadarData()}
                  >
                    <PolarGrid />
                    <PolarAngleAxis dataKey="subject" />
                    <PolarRadiusAxis />
                    <Radar 
                      name="Soil Parameters" 
                      dataKey="A" 
                      stroke={COLORS[0]} 
                      fill={COLORS[0]} 
                      fillOpacity={0.6} 
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
          
          {/* Summary statistics */}
          {predictionHistory.length > 0 && (
            <div className="stats-summary">
              <h3>Summary Statistics</h3>
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-title">Total Predictions</div>
                  <div className="stat-value">{predictionHistory.length}</div>
                </div>
                <div className="stat-card">
                  <div className="stat-title">Unique Crops</div>
                  <div className="stat-value">{new Set(predictionHistory.map(item => item.crop).filter(Boolean)).size}</div>
                </div>
                <div className="stat-card">
                  <div className="stat-title">Unique Fertilizers</div>
                  <div className="stat-value">{new Set(predictionHistory.map(item => item.fertilizer).filter(Boolean)).size}</div>
                </div>
                <div className="stat-card">
                  <div className="stat-title">Average pH</div>
                  <div className="stat-value">
                    {(predictionHistory.reduce((sum, item) => sum + (parseFloat(item.ph) || 0), 0) / 
                      predictionHistory.filter(item => item.ph).length).toFixed(2)}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PredictionHistory;
                    