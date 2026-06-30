import { useState } from 'react';
import {
  Container, Row, Col, Card, Form, Button, Alert, ButtonGroup,
  InputGroup, Spinner
} from 'react-bootstrap';
import {
  PersonFill, BuildingFill, EnvelopeFill, LockFill,
  TelephoneFill, FileTextFill, BoxArrowInRight
} from 'react-bootstrap-icons';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';

const Register = () => {
  const navigate = useNavigate();
  const [role, setRole] = useState('CITIZEN');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    first_name: '',
    last_name: '',
    phone_number: '',
    company_name: '',
    business_registration_number: '',
    contact_phone: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      await api.post('users/register/', { ...formData, role });
      setSuccess(true);
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      const errorData = err.response?.data;
      let errorMessage = "Registration failed. Please check your inputs.";
      if (errorData) {
        const firstKey = Object.keys(errorData)[0];
        errorMessage = errorData[firstKey][0];
      }
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const iconStyle={background:'#f8f9fa'};

  return (
    <div className="py-5 px-3 d-flex align-items-center justify-content-center"
      style={{minHeight:'100vh',background:'linear-gradient(135deg,#eef5ff,#ffffff)'}}>
      <Card className="border-0 shadow-lg w-100" style={{maxWidth:700,borderRadius:22}}>
        <Card.Body className="p-4 p-md-5">
          <div className="text-center mb-4">
            <div className="mx-auto mb-3 rounded-circle d-flex align-items-center justify-content-center"
              style={{width:72,height:72,background:'linear-gradient(135deg,#0d6efd,#4dabf7)',color:'#fff',fontSize:30}}>
              <BoxArrowInRight/>
            </div>
            <h2 className="fw-bold">Create Your Account</h2>
            <p className="text-muted mb-0">Join the Travel Diary community today.</p>
          </div>

          {error && <Alert variant="danger" className="rounded-3">{error}</Alert>}

          {success ? (
            <Alert variant="success" className="text-center rounded-3 py-4">
              <h4>Registration Successful!</h4>
              <p className="mb-2">Redirecting you to the login page...</p>
              {role==='MANAGER' && (
                <small>Your business account will need administrator verification before posting inventory.</small>
              )}
            </Alert>
          ) : (
            <Form onSubmit={handleSubmit}>
              <div className="d-flex justify-content-center mb-4">
                <ButtonGroup>
                  <Button
                    variant={role==='CITIZEN'?'primary':'outline-primary'}
                    onClick={()=>setRole('CITIZEN')}
                    className="px-4 py-2">
                    <PersonFill className="me-2"/>Traveler
                  </Button>
                  <Button
                    variant={role==='MANAGER'?'primary':'outline-primary'}
                    onClick={()=>setRole('MANAGER')}
                    className="px-4 py-2">
                    <BuildingFill className="me-2"/>Business
                  </Button>
                </ButtonGroup>
              </div>

              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold">Email Address</Form.Label>
                <InputGroup>
                  <InputGroup.Text style={iconStyle}><EnvelopeFill/></InputGroup.Text>
                  <Form.Control type="email" name="email" placeholder="Enter your email"
                    value={formData.email} onChange={handleChange} required/>
                </InputGroup>
              </Form.Group>

              <Form.Group className="mb-4">
                <Form.Label className="fw-semibold">Password</Form.Label>
                <InputGroup>
                  <InputGroup.Text style={iconStyle}><LockFill/></InputGroup.Text>
                  <Form.Control type="password" name="password" placeholder="Create a password"
                    value={formData.password} onChange={handleChange} required minLength="8"/>
                </InputGroup>
              </Form.Group>

              {role==='CITIZEN' && (
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>First Name</Form.Label>
                      <InputGroup>
                        <InputGroup.Text style={iconStyle}><PersonFill/></InputGroup.Text>
                        <Form.Control name="first_name" value={formData.first_name}
                          onChange={handleChange} required/>
                      </InputGroup>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Last Name</Form.Label>
                      <InputGroup>
                        <InputGroup.Text style={iconStyle}><PersonFill/></InputGroup.Text>
                        <Form.Control name="last_name" value={formData.last_name}
                          onChange={handleChange} required/>
                      </InputGroup>
                    </Form.Group>
                  </Col>
                </Row>
              )}

              {role==='MANAGER' && (
                <>
                  <Form.Group className="mb-3">
                    <Form.Label>Company Name</Form.Label>
                    <InputGroup>
                      <InputGroup.Text style={iconStyle}><BuildingFill/></InputGroup.Text>
                      <Form.Control name="company_name" value={formData.company_name}
                        onChange={handleChange} required/>
                    </InputGroup>
                  </Form.Group>

                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Registration Number</Form.Label>
                        <InputGroup>
                          <InputGroup.Text style={iconStyle}><FileTextFill/></InputGroup.Text>
                          <Form.Control name="business_registration_number"
                            value={formData.business_registration_number}
                            onChange={handleChange} required/>
                        </InputGroup>
                      </Form.Group>
                    </Col>

                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Contact Phone</Form.Label>
                        <InputGroup>
                          <InputGroup.Text style={iconStyle}><TelephoneFill/></InputGroup.Text>
                          <Form.Control name="contact_phone"
                            value={formData.contact_phone}
                            onChange={handleChange} required/>
                        </InputGroup>
                      </Form.Group>
                    </Col>
                  </Row>
                </>
              )}

              <Button type="submit" className="w-100 py-3 fw-semibold mt-3" disabled={isLoading}>
                {isLoading ? <><Spinner size="sm" animation="border" className="me-2"/>Creating Account...</> : 'Register'}
              </Button>
            </Form>
          )}

          <div className="text-center mt-4">
            <span className="text-muted">Already have an account? </span>
            <Link to="/login" className="fw-bold text-decoration-none">Sign In</Link>
          </div>
        </Card.Body>
      </Card>
    </div>
  );
};

export default Register;
