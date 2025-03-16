import React from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../../Auth.css'

const loginSchema = Yup.object().shape({
  username: Yup.string().required('Username is required'),
  password: Yup.string().required('Password is required')
});

const Login = ({ setAuth }) => {
  const navigate = useNavigate();

  const handleSubmit = async (values, { setSubmitting, setErrors }) => {
    try {
      const response = await axios.post('http://localhost:8000/users/token/', {
        username: values.username,
        password: values.password
      });

      localStorage.setItem('access_token', response.data.access);
      localStorage.setItem('refresh_token', response.data.refresh);
      setAuth(true);
      navigate('/dashboard');
    } catch (error) {
      setErrors({ auth: 'Invalid username or password' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-content">
        <div className="login-card">
          <div className="login-header">
            <h1>AgriTech</h1>
            <h2>Login to Farm Help</h2>
            <p className="login-subtitle">Access your farm management dashboard</p>
          </div>
          <div className="login-body">
            <Formik
              initialValues={{ username: '', password: '' }}
              validationSchema={loginSchema}
              onSubmit={handleSubmit}
            >
              {({ isSubmitting, errors }) => (
                <Form>
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
                    <label htmlFor="password">Password</label>
                    <Field
                      type="password"
                      name="password"
                      className="form-input"
                      placeholder="Enter password"
                    />
                    <ErrorMessage name="password" component="div" className="error-message" />
                  </div>

                  {errors.auth && <div className="auth-error">{errors.auth}</div>}

                  <button
                    type="submit"
                    className="submit-button"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Logging in...' : 'Login'}
                  </button>
                </Form>
              )}
            </Formik>
            <div className="auth-redirect">
              <p>
                Don't have an account?{' '}
                <span
                  className="redirect-link"
                  onClick={() => navigate('/register')}
                >
                  Register
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>
      <div className="login-background"></div>
    </div>
  );
};

export default Login;