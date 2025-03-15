import React, { useState } from 'react';
import { Formik, Form, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';
import { toast } from 'react-toastify';

const FILE_SIZE = 5 * 1024 * 1024; // 5MB
const SUPPORTED_FORMATS = ['image/jpg', 'image/jpeg', 'image/png'];

const pestRecognitionSchema = Yup.object().shape({
  image: Yup.mixed()
    .required('Image is required')
    .test('fileSize', 'File too large (max 5MB)', value => !value || value.size <= FILE_SIZE)
    .test('fileFormat', 'Unsupported format', value => !value || SUPPORTED_FORMATS.includes(value.type))
});

const PestRecognitionForm = ({ onDetectionResult }) => {
  const [preview, setPreview] = useState(null);

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      const token = localStorage.getItem('access_token');
      const formData = new FormData();
      formData.append('image', values.image);
      
      const response = await axios.post(
        'http://localhost:8000/api/detect-pest/',
        formData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      
      onDetectionResult(response.data);
      resetForm();
      setPreview(null);
      toast.success('Pest detection completed successfully!');
    } catch (error) {
      toast.error('Failed to detect pest. Please try again.');
      console.error('Error:', error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="card">
      <div className="card-header">
        <h4>Pest Recognition</h4>
      </div>
      <div className="card-body">
        <Formik
          initialValues={{
            image: null
          }}
          validationSchema={pestRecognitionSchema}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting, setFieldValue, errors, touched }) => (
            <Form>
              <div className="mb-3">
                <label className="form-label">Upload Plant Image</label>
                <input
                  type="file"
                  className="form-control"
                  onChange={(event) => {
                    const file = event.currentTarget.files[0];
                    setFieldValue('image', file);
                    
                    if (file) {
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        setPreview(reader.result);
                      };
                      reader.readAsDataURL(file);
                    } else {
                      setPreview(null);
                    }
                  }}
                />
                {errors.image && touched.image ? (
                  <div className="text-danger">{errors.image}</div>
                ) : null}
              </div>

              {preview && (
                <div className="mb-3">
                  <label className="form-label">Image Preview</label>
                  <div className="p-2 border rounded">
                    <img 
                      src={preview} 
                      alt="Preview" 
                      className="img-fluid" 
                      style={{ maxHeight: '300px' }} 
                    />
                  </div>
                </div>
              )}

              <button
                type="submit"
                className="btn btn-primary"
                disabled={isSubmitting || !preview}
              >
                {isSubmitting ? 'Detecting...' : 'Detect Pests/Diseases'}
              </button>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};

export default PestRecognitionForm;