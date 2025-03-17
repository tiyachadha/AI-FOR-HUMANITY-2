import React, { useState, useEffect } from 'react';
import { Formik, Form, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';
import { toast } from 'react-toastify';

const plantDiseaseSchema = Yup.object().shape({
  image: Yup.mixed()
    .required('An image file is required')
    .test(
      'fileFormat',
      'Unsupported file format. Please upload a JPEG or PNG file.',
      value => value && ['image/jpeg', 'image/png', 'image/jpg'].includes(value.type)
    )
    .test(
      'fileSize',
      'File size is too large. Max 5MB allowed.',
      value => value && value.size <= 5 * 1024 * 1024 // 5MB
    )
});

const PlantDiseaseDetectionForm = ({ onDetectionResult }) => {
  const [preview, setPreview] = useState(null);

  const handleImageChange = (event, setFieldValue) => {
    const file = event.currentTarget.files[0];
    if (file) {
      if (!['image/jpeg', 'image/png', 'image/jpg'].includes(file.type)) {
        toast.error('Unsupported file format. Please upload a JPEG or PNG file.');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size exceeds the 5MB limit.');
        return;
      }

      setFieldValue('image', file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        toast.error('Session expired. Please log in again.');
        return;
      }

      const formData = new FormData();
      formData.append('image', values.image);

      const response = await axios.post(
        'http://localhost:8000/api/plant-disease/',
        formData,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      // Handle detection result
      if (response.data) {
        const { detected_classes, result_image } = response.data;
        if (detected_classes) {
          toast.success(`Detected: ${detected_classes.join(', ')}`);
          if (result_image) {
            setPreview(`http://localhost:8000${result_image}`);
          }
        }
        onDetectionResult(response.data);
      } else {
        toast.error('Invalid response from server.');
      }
    } catch (error) {
      if (error.response) {
        if (error.response.status === 401) {
          toast.error('Session expired. Please log in again.');
          localStorage.removeItem('access_token');
        } else {
          toast.error('Failed to detect plant disease. Please try again.');
        }
      } else {
        toast.error('Network error. Please check your connection.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Clean up object URL to prevent memory leaks
  useEffect(() => {
    return () => {
      if (preview) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  return (
    <div className="card">
      <div className="card-header">
        <h4>Plant Disease Detection</h4>
      </div>
      <div className="card-body">
        <Formik
          initialValues={{ image: null }}
          validationSchema={plantDiseaseSchema}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting, setFieldValue, values }) => (
            <Form>
              <div className="row">
                <div className="col-md-12 mb-3">
                  <label htmlFor="image">Upload Plant Image</label>
                  <input
                    id="image"
                    name="image"
                    type="file"
                    className="form-control"
                    onChange={e => handleImageChange(e, setFieldValue)}
                  />
                  <ErrorMessage name="image" component="div" className="text-danger" />
                </div>
              </div>

              {preview && (
                <div className="row mb-3">
                  <div className="col-md-12">
                    <label>Image Preview</label>
                    <div className="border rounded p-2">
                      <img
                        src={preview}
                        alt="Preview"
                        className="img-fluid"
                        style={{ maxHeight: '300px' }}
                      />
                    </div>
                  </div>
                </div>
              )}

              <button
                type="submit"
                className="btn btn-primary"
                disabled={isSubmitting || !values.image}
              >
                {isSubmitting ? 'Detecting...' : 'Detect Disease'}
              </button>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};


export default PlantDiseaseDetectionForm;
