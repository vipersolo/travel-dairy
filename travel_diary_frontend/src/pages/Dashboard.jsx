import { useState, useEffect } from "react";
import {
  Container, Row, Col, Card, Table, Badge, Spinner, Alert, Button, Modal, ListGroup,
} from "react-bootstrap";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import api from "../services/api";

// NEW: Import the Stripe Payment Modal
import PaymentModal from '../components/PaymentModal';

const Dashboard = () => {
  const { user } = useSelector((state) => state.auth);

  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // --- UI STATE 1: The Details Modal ---
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);

  // --- UI STATE 2: The Payment Modal ---
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentBooking, setPaymentBooking] = useState(null);

  const [isCancelling, setIsCancelling] = useState(false);

  useEffect(() => {
    const fetchUserBookings = async () => {
      try {
        const response = await api.get("travel/bookings/");
        setBookings(response.data);
      } catch (err) {
        setError("Failed to load your travel history.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchUserBookings();
  }, []);

  const totalSpent = bookings
    .filter((booking) => booking.status === "CONFIRMED" || booking.status === "COMPLETED")
    .reduce((sum, booking) => sum + parseFloat(booking.total_amount), 0);

  const getStatusBadge = (status) => {
    switch (status) {
      case "CONFIRMED": return <Badge bg="success">Confirmed</Badge>;
      case "PENDING": return <Badge bg="warning" text="dark">Pending</Badge>;
      case "CANCELLED": return <Badge bg="danger">Cancelled</Badge>;
      case "COMPLETED": return <Badge bg="info">Completed</Badge>;
      default: return <Badge bg="secondary">{status}</Badge>;
    }
  };

  // --- HANDLERS: Details Modal ---
  const handleViewDetails = (booking) => {
    setSelectedBooking(booking);
    setShowDetailsModal(true);
  };

  const handleCloseDetailsModal = () => {
    setSelectedBooking(null);
    setShowDetailsModal(false);
    setError(null);
  };

  // --- HANDLERS: Payment Modal ---
  const handlePayClick = (booking) => {
    setPaymentBooking(booking);
    setShowPaymentModal(true);
  };

  const handlePaymentSuccess = () => {
    setShowPaymentModal(false);
    // Update the local list so the UI instantly shows it as paid
    setBookings(bookings.map(b => 
        b.id === paymentBooking.id ? { ...b, is_paid: true } : b
    ));
    setPaymentBooking(null);
    alert("Payment successful! Your trip is fully locked in.");
  };

  // --- HANDLER: Cancellation (With Stripe Refund logic) ---
  const handleCancelBooking = async () => {
    const confirmCancel = window.confirm(
      "Are you sure you want to cancel this trip? If you have paid, a refund will be issued automatically."
    );

    if (!confirmCancel) return;
    setIsCancelling(true);

    try {
      // Pointing to the new cancel_booking endpoint we made for Stripe
      const response = await api.post(`travel/bookings/${selectedBooking.id}/cancel_booking/`);

      // Update bookings table instantly
      setBookings((prevBookings) =>
        prevBookings.map((booking) =>
          booking.id === selectedBooking.id 
            ? { ...booking, status: 'CANCELLED', is_paid: false } // Reset paid status on cancel
            : booking
        )
      );

      // Update the open modal instantly
      setSelectedBooking(prev => ({ ...prev, status: 'CANCELLED', is_paid: false }));
      
      alert(response.data.message || "Booking cancelled successfully.");
      
    } catch (err) {
      alert(err.response?.data?.error || "Failed to cancel the booking. Please try again.");
    } finally {
      setIsCancelling(false);
    }
  };

  if (isLoading) {
    return (
      <div className="text-center mt-5">
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  return (
    <Container>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Welcome, {user?.email}</h2>
        <Button as={Link} to="/destinations" variant="outline-primary">
          Plan a New Trip
        </Button>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}

      <Row className="mb-5 g-4">
        <Col md={4}>
          <Card className="shadow-sm border-0 bg-light text-center h-100">
            <Card.Body className="py-4">
              <h5 className="text-muted">Total Trips</h5>
              <h2 className="display-5 fw-bold">{bookings.length}</h2>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="shadow-sm border-0 bg-light text-center h-100">
            <Card.Body className="py-4">
              <h5 className="text-muted">Active Bookings</h5>
              <h2 className="display-5 fw-bold text-primary">
                {bookings.filter((b) => b.status === "CONFIRMED").length}
              </h2>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="shadow-sm border-0 bg-light text-center h-100">
            <Card.Body className="py-4">
              <h5 className="text-muted">Total Spent</h5>
              <h2 className="display-5 fw-bold text-success">
                ${totalSpent.toFixed(2)}
              </h2>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <h4 className="mb-3">Your Travel History</h4>

      {bookings.length === 0 ? (
        <Card className="text-center py-5 shadow-sm border-0 bg-light">
          <Card.Body>
            <h4 className="text-muted mb-3">You haven't booked any trips yet.</h4>
            <Button as={Link} to="/destinations" variant="primary" size="lg">
              Explore Destinations
            </Button>
          </Card.Body>
        </Card>
      ) : (
        <Card className="shadow-sm border-0">
          <Table responsive hover className="mb-0">
            <thead className="bg-light">
              <tr>
                <th>Booking Ref #</th>
                <th>Check-in</th>
                <th>Check-out</th>
                <th>Total Cost</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((booking) => (
                <tr key={booking.id} className="align-middle">
                  <td><strong>#{booking.id.toString().padStart(4, "0")}</strong></td>
                  <td>{booking.check_in_date}</td>
                  <td>{booking.check_out_date}</td>
                  <td>${parseFloat(booking.total_amount).toFixed(2)}</td>
                  
                  <td>
                    {getStatusBadge(booking.status)}
                    {/* NEW: Stripe Paid Badge */}
                    {booking.is_paid && <Badge bg="success" className="ms-2">Paid</Badge>}
                  </td>
                  
                  <td>
                    {/* NEW: Pay Now Button directly in the table row */}
                    {booking.status === 'CONFIRMED' && !booking.is_paid && (
                        <Button 
                            variant="primary" 
                            size="sm" 
                            className="me-2" 
                            onClick={() => handlePayClick(booking)}
                        >
                            💳 Pay Now
                        </Button>
                    )}
                    
                    <Button
                      variant="outline-secondary"
                      size="sm"
                      onClick={() => handleViewDetails(booking)}
                    >
                      View Details
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card>
      )}

      {/* --- MODAL 1: Booking Details --- */}
      <Modal show={showDetailsModal} onHide={handleCloseDetailsModal} centered>
        {selectedBooking && (
          <>
            <Modal.Header closeButton className="bg-light">
              <Modal.Title>
                Booking #{selectedBooking.id.toString().padStart(4, "0")}
              </Modal.Title>
            </Modal.Header>
            <Modal.Body className="p-4">
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h5 className="mb-0">Status</h5>
                <div>
                    {getStatusBadge(selectedBooking.status)}
                    {selectedBooking.is_paid && <Badge bg="success" className="ms-2">Paid</Badge>}
                </div>
              </div>

              <h6 className="text-muted text-uppercase mb-3" style={{ fontSize: "0.85rem" }}>
                Itinerary Details
              </h6>
              <ListGroup variant="flush" className="mb-4 border rounded">
                <ListGroup.Item className="d-flex justify-content-between">
                  <span>Check-in:</span>
                  <strong>{selectedBooking.check_in_date}</strong>
                </ListGroup.Item>
                <ListGroup.Item className="d-flex justify-content-between">
                  <span>Check-out:</span>
                  <strong>{selectedBooking.check_out_date}</strong>
                </ListGroup.Item>
                {selectedBooking.accommodation_name && (
                  <ListGroup.Item className="d-flex justify-content-between">
                    <span>Hotel:</span>
                    <strong className="text-end">{selectedBooking.accommodation_name}</strong>
                  </ListGroup.Item>
                )}
                {selectedBooking.tour_package_name && (
                  <ListGroup.Item className="d-flex justify-content-between">
                    <span>Tour Package:</span>
                    <strong className="text-end">{selectedBooking.tour_package_name}</strong>
                  </ListGroup.Item>
                )}
              </ListGroup>

              <div className="d-flex justify-content-between align-items-center p-3 bg-light rounded border">
                <h5 className="mb-0">Total Amount</h5>
                <h4 className="mb-0 text-success fw-bold">
                  ${parseFloat(selectedBooking.total_amount).toFixed(2)}
                </h4>
              </div>
            </Modal.Body>
            <Modal.Footer className="d-flex justify-content-between">
              {selectedBooking.status === "PENDING" || selectedBooking.status === "CONFIRMED" ? (
                <Button variant="outline-danger" onClick={handleCancelBooking} disabled={isCancelling}>
                  {isCancelling ? <Spinner size="sm" animation="border" /> : "Cancel Booking"}
                </Button>
              ) : <div></div>}
              <Button variant="secondary" onClick={handleCloseDetailsModal}>
                Close
              </Button>
            </Modal.Footer>
          </>
        )}
      </Modal>

      {/* --- MODAL 2: Stripe Payment --- */}
      <PaymentModal 
        show={showPaymentModal} 
        onHide={() => {
            setShowPaymentModal(false);
            setPaymentBooking(null);
        }} 
        booking={paymentBooking}
        onPaymentSuccess={handlePaymentSuccess}
      />
      
    </Container>
  );
};

export default Dashboard;