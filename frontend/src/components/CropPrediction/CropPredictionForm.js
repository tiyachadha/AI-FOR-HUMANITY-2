import React from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';
import { toast } from 'react-toastify';

const cropPredictionSchema = Yup.object().shape({
  nitrogen: Yup.number().required('Nitrogen value is required'),
  phosphorus: Yup.number().required('Phosphorus value is required'),
  potassium: Yup.number().required('Potassium value is required'),
  ph: Yup.number().required('pH value is required'),
  rainfall: Yup.number().required('Rainfall value is required'),
  humidity: Yup.number().required('Humidity value is required'),
  temperature: Yup.number().required('Temperature value is required')
});

const CropPredictionForm = ({ onPredictionResult }) => {
  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await axios.post(
        'http://localhost:8000/api/predict-crop/',
        values,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      onPredictionResult(response.data);
      resetForm();
      toast.success('Prediction completed successfully!');
    } catch (error) {
      toast.error('Failed to predict crop. Please try again.');
      console.error('Error:', error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="card">
      <div className="card-header">
        <h4>Crop Prediction</h4>
      </div>
      <div className="card-body">
        <Formik
          initialValues={{
            nitrogen: '',
            phosphorus: '',
            potassium: '',
            ph: '',
            rainfall: '',
            humidity: '',
            temperature: ''
          }}
          validationSchema={cropPredictionSchema}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting }) => (
            <Form>
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label htmlFor="nitrogen">Nitrogen (N)</label>
                  <Field
                    type="number"
                    name="nitrogen"
                    className="form-control"
                    placeholder="Enter nitrogen value"
                  />
                  <ErrorMessage name="nitrogen" component="div" className="text-danger" />
                </div>

                <div className="col-md-6 mb-3">
                  <label htmlFor="phosphorus">Phosphorus (P)</label>
                  <Field
                    type="number"
                    name="phosphorus"
                    className="form-control"
                    placeholder="Enter phosphorus value"
                  />
                  <ErrorMessage name="phosphorus" component="div" className="text-danger" />
                </div>
              </div>

              <div className="row">
                <div className="col-md-6 mb-3">
                  <label htmlFor="potassium">Potassium (K)</label>
                  <Field
                    type="number"
                    name="potassium"
                    className="form-control"
                    placeholder="Enter potassium value"
                  />
                  <ErrorMessage name="potassium" component="div" className="text-danger" />
                </div>

                <div className="col-md-6 mb-3">
                  <label htmlFor="ph">pH Value</label>
                  <Field
                    type="number"
                    name="ph"
                    className="form-control"
                    placeholder="Enter pH value"
                    step="0.1"
                    />
                    <ErrorMessage name="ph" component="div" className="text-danger" />
                    </div>
                    </div>
                    <div className="row">
            <div className="col-md-4 mb-3">
              <label htmlFor="rainfall">Rainfall (mm)</label>
              <Field
                type="number"
                name="rainfall"
                className="form-control"
                placeholder="Enter rainfall value"
              />
              <ErrorMessage name="rainfall" component="div" className="text-danger" />
            </div>

            <div className="col-md-4 mb-3">
              <label htmlFor="humidity">Humidity (%)</label>
              <Field
                type="number"
                name="humidity"
                className="form-control"
                placeholder="Enter humidity percentage"
              />
              <ErrorMessage name="humidity" component="div" className="text-danger" />
            </div>

            <div className="col-md-4 mb-3">
              <label htmlFor="temperature">Temperature (°C)</label>
              <Field
                type="number"
                name="temperature"
                className="form-control"
                placeholder="Enter temperature"
                step="0.1"
              />
              <ErrorMessage name="temperature" component="div" className="text-danger" />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Predicting...' : 'Predict Crop'}
          </button>
        </Form>
      )}
    </Formik>
  </div>
</div>

);
};
export default CropPredictionForm;