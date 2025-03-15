import React from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

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
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card">
            <div className="card-header">
              <h3 className="text-center">Login to Farm Help</h3>
            </div>
            <div className="card-body">
              <Formik
                initialValues={{ username: '', password: '' }}
                validationSchema={loginSchema}
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
                      <label htmlFor="password">Password</label>
                      <Field
                        type="password"
                        name="password"
                        className="form-control"
                        placeholder="Enter password"
                      />
                      <ErrorMessage name="password" component="div" className="text-danger" />
                    </div>

                    {errors.auth && <div className="alert alert-danger">{errors.auth}</div>}

                    <button
                      type="submit"
                      className="btn btn-primary w-100"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? 'Logging in...' : 'Login'}
                    </button>
                  </Form>
                )}
              </Formik>
              <div className="mt-3 text-center">
                <p>
                  Don't have an account?{' '}
                  <span
                    className="text-primary"
                    style={{ cursor: 'pointer' }}
                    onClick={() => navigate('/register')}
                  >
                    Register
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

export default Login;