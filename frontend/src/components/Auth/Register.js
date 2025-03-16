import React from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const registerSchema = Yup.object().shape({
  username: Yup.string()
    .min(3, 'Username must be at least 3 characters')
    .required('Username is required'),
  email: Yup.string()
    .email('Invalid email address')
    .required('Email is required'),
  password: Yup.string()
    .min(8, 'Password must be at least 8 characters')
    .required('Password is required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password'), null], 'Passwords must match')
    .required('Confirm password is required'),
  farm_location: Yup.string(),
  phone: Yup.string()
});

const Register = () => {
  const navigate = useNavigate();

  const handleSubmit = async (values, { setSubmitting, setErrors }) => {
    try {
      await axios.post('http://localhost:8000/users/register/', {
        username: values.username,
        email: values.email,
        password: values.password,
        farm_location: values.farm_location,
        password2: values.confirmPassword,
        phone: values.phone
      });
      navigate('/login');
    } catch (error) {
      if (error.response && error.response.data) {
        setErrors(error.response.data);
      } else {
        setErrors({ general: 'Registration failed. Please try again.' });
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="register-container">
      <div className="register-content">
        <div className="register-card">
          <div className="register-header">
            <h1>AgriTech</h1>
            <h2>Join Farm Help</h2>
            <p className="register-subtitle">Start optimizing your agricultural practices today</p>
          </div>
          <div className="register-body">
            <Formik
              initialValues={{
                username: '',
                email: '',
                password: '',
                confirmPassword: '',
                farm_location: '',
                phone: ''
              }}
              validationSchema={registerSchema}
              onSubmit={handleSubmit}
            >
              {({ isSubmitting, errors }) => (
                <Form>
                  <div className="form-grid">
                    <div className="form-group">
                      <label htmlFor="username">Username</label>
                      <Field
                        type="text"
                        name="username"
                        className="form-input"
                        placeholder="Enter username"
                      />
                      <ErrorMessage name="username" component="div" className="error-message" />
                    </div>

                    <div className="form-group">
                      <label htmlFor="email">Email</label>
                      <Field
                        type="email"
                        name="email"
                        className="form-input"
                        placeholder="Enter email"
                      />
                      <ErrorMessage name="email" component="div" className="error-message" />
                    </div>

                    <div className="form-group">
                      <label htmlFor="password">Password</label>
                      <Field
                        type="password"
                        name="password"
                        className="form-input"
                        placeholder="Enter password"
                      />
                      <ErrorMessage name="password" component="div" className="error-message" />
                    </div>

                    <div className="form-group">
                      <label htmlFor="confirmPassword">Confirm Password</label>
                      <Field
                        type="password"
                        name="confirmPassword"
                        className="form-input"
                        placeholder="Confirm password"
                      />
                      <ErrorMessage name="confirmPassword" component="div" className="error-message" />
                    </div>

                    <div className="form-group">
                      <label htmlFor="farm_location">Farm Location (Optional)</label>
                      <Field
                        type="text"
                        name="farm_location"
                        className="form-input"
                        placeholder="Enter farm location"
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="phone">Phone Number (Optional)</label>
                      <Field
                        type="text"
                        name="phone"
                        className="form-input"
                        placeholder="Enter phone number"
                      />
                    </div>
                  </div>

                  {errors.general && <div className="auth-error">{errors.general}</div>}

                  <button
                    type="submit"
                    className="submit-button"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Registering...' : 'Join AgriTech'}
                  </button>
                </Form>
              )}
            </Formik>
            <div className="auth-redirect">
              <p>
                Already have an account?{' '}
                <span
                  className="redirect-link"
                  onClick={() => navigate('/login')}
                >
                  Login
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>
      <div className="register-background"></div>
    </div>
  );
};

export default Register;