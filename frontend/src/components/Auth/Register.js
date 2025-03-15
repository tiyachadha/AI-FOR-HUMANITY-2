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
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card">
            <div className="card-header">
              <h3 className="text-center">Register for Farm Help</h3>
            </div>
            <div className="card-body">
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
                    <div className="form-group mb-3">
                      <label htmlFor="username">Username</label>
                      <Field
                        type="text"
                        name="username"
                        className="form-control"
                        placeholder="Enter username"
                      />
                      <ErrorMessage name="username" component="div" className="text-danger" />
                    </div>

                    <div className="form-group mb-3">
                      <label htmlFor="email">Email</label>
                      <Field
                        type="email"
                        name="email"
                        className="form-control"
                        placeholder="Enter email"
                      />
                      <ErrorMessage name="email" component="div" className="text-danger" />
                    </div>

                    <div className="form-group mb-3">
                      <label htmlFor="password">Password</label>
                      <Field
                        type="password"
                        name="password"
                        className="form-control"
                        placeholder="Enter password"
                      />
                      <ErrorMessage name="password" component="div" className="text-danger" />
                    </div>

                    <div className="form-group mb-3">
                      <label htmlFor="confirmPassword">Confirm Password</label>
                      <Field
                        type="password"
                        name="confirmPassword"
                        className="form-control"
                        placeholder="Confirm password"
                      />
                      <ErrorMessage name="confirmPassword" component="div" className="text-danger" />
                    </div>

                    <div className="form-group mb-3">
                      <label htmlFor="farm_location">Farm Location (Optional)</label>
                      <Field
                        type="text"
                        name="farm_location"
                        className="form-control"
                        placeholder="Enter farm location"
                      />
                    </div>

                    <div className="form-group mb-3">
                      <label htmlFor="phone">Phone Number (Optional)</label>
                      <Field
                        type="text"
                        name="phone"
                        className="form-control"
                        placeholder="Enter phone number"
                      />
                    </div>

                    {errors.general && <div className="alert alert-danger">{errors.general}</div>}

                    <button
                      type="submit"
                      className="btn btn-primary w-100"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? 'Registering...' : 'Register'}
                    </button>
                  </Form>
                )}
              </Formik>
              <div className="mt-3 text-center">
                <p>
                  Already have an account?{' '}
                  <span
                    className="text-primary"
                    style={{ cursor: 'pointer' }}
                    onClick={() => navigate('/login')}
                  >
                    Login
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;