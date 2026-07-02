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
      case "CONFIRMED": return <Badge pill bg="success" className="px-3 py-2 shadow-sm">Confirmed</Badge>;
      case "PENDING": return <Badge pill bg="warning" text="dark" className="px-3 py-2 shadow-sm">Pending</Badge>;
      case "CANCELLED": return <Badge pill bg="danger" className="px-3 py-2 shadow-sm">Cancelled</Badge>;
      case "COMPLETED": return <Badge pill bg="info" className="px-3 py-2 shadow-sm">Completed</Badge>;
      default: return <Badge pill bg="secondary" className="px-3 py-2 shadow-sm">{status}</Badge>;
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
      <div className="d-flex flex-column justify-content-center align-items-center" style={{ minHeight: "60vh" }}>
        <Spinner animation="grow" variant="primary" className="mb-3" />
        <h5 className="text-muted">Loading your adventures...</h5>
      </div>
    );
  }

  return (
    <Container className="py-5">
      
      {/* Header Section */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-5">
        <div>
          <h2 className="fw-bold mb-1">Welcome back, {user?.email?.split('@')[0] || 'Traveler'} 👋</h2>
          <p className="text-muted mb-0">Manage your upcoming adventures and travel history.</p>
        </div>
        <Button 
          as={Link} 
          to="/destinations" 
          variant="primary" 
          size="lg" 
          className="mt-4 mt-md-0 px-4 rounded-pill shadow-sm"
        >
          ✨ Plan a New Trip
        </Button>
      </div>

      {error && <Alert variant="danger" className="rounded-3 shadow-sm">{error}</Alert>}

      {/* Analytics Cards */}
      <Row className="mb-5 g-4">
        <Col md={4}>
          <Card className="shadow-sm border-0 rounded-4 bg-white text-center h-100 transition-hover">
            <Card.Body className="py-4 d-flex flex-column align-items-center justify-content-center">
              <div className="bg-light p-3 rounded-circle mb-3 d-inline-block">
                <span className="fs-3">🧳</span>
              </div>
              <h6 className="text-muted fw-bold text-uppercase tracking-wider">Total Trips</h6>
              <h2 className="display-6 fw-bolder mb-0 text-dark">{bookings.length}</h2>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="shadow-sm border-0 rounded-4 bg-white text-center h-100 transition-hover">
            <Card.Body className="py-4 d-flex flex-column align-items-center justify-content-center">
              <div className="bg-primary bg-opacity-10 p-3 rounded-circle mb-3 d-inline-block">
                <span className="fs-3">✈️</span>
              </div>
              <h6 className="text-muted fw-bold text-uppercase tracking-wider">Active Bookings</h6>
              <h2 className="display-6 fw-bolder mb-0 text-primary">
                {bookings.filter((b) => b.status === "CONFIRMED").length}
              </h2>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="shadow-sm border-0 rounded-4 bg-white text-center h-100 transition-hover">
            <Card.Body className="py-4 d-flex flex-column align-items-center justify-content-center">
              <div className="bg-success bg-opacity-10 p-3 rounded-circle mb-3 d-inline-block">
                <span className="fs-3">💳</span>
              </div>
              <h6 className="text-muted fw-bold text-uppercase tracking-wider">Total Spent</h6>
              <h2 className="display-6 fw-bolder mb-0 text-success">
                ${totalSpent.toFixed(2)}
              </h2>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="fw-bold mb-0">Your Travel History</h4>
      </div>

      {bookings.length === 0 ? (
        <Card className="text-center py-5 shadow-sm border-0 rounded-4 bg-white">
          <Card.Body className="py-5">
            <div className="display-1 text-muted mb-4">🌍</div>
            <h4 className="text-dark fw-bold mb-3">You haven't booked any trips yet.</h4>
            <p className="text-muted mb-4">The world is waiting! Start exploring our top destinations.</p>
            <Button as={Link} to="/destinations" variant="primary" size="lg" className="rounded-pill px-5 shadow-sm">
              Explore Destinations
            </Button>
          </Card.Body>
        </Card>
      ) : (
        <Card className="shadow-sm border-0 rounded-4 overflow-hidden">
          <Table responsive hover className="mb-0 text-nowrap align-middle">
            <thead className="bg-light text-muted" style={{ fontSize: '0.85rem' }}>
              <tr className="text-uppercase">
                <th className="py-3 ps-4 border-0">Booking Ref #</th>
                <th className="py-3 border-0">Check-in</th>
                <th className="py-3 border-0">Check-out</th>
                <th className="py-3 border-0">Total Cost</th>
                <th className="py-3 border-0">Status</th>
                <th className="py-3 pe-4 border-0 text-end">Actions</th>
              </tr>
            </thead>
            <tbody className="border-top-0">
              {bookings.map((booking) => (
                <tr key={booking.id} className="bg-white">
                  <td className="py-3 ps-4">
                    <strong className="text-primary">#{booking.id.toString().padStart(4, "0")}</strong>
                  </td>
                  <td className="py-3 text-muted">{booking.check_in_date}</td>
                  <td className="py-3 text-muted">{booking.check_out_date}</td>
                  <td className="py-3 fw-semibold">${parseFloat(booking.total_amount).toFixed(2)}</td>
                  
                  <td className="py-3">
                    <div className="d-flex align-items-center gap-2">
                      {getStatusBadge(booking.status)}
                      {/* NEW: Stripe Paid Badge */}
                      {booking.is_paid && <Badge pill bg="success" className="px-3 py-2 shadow-sm"><i className="bi bi-check-circle me-1"></i> Paid</Badge>}
                    </div>
                  </td>
                  
                  <td className="py-3 pe-4 text-end">
                    {/* NEW: Pay Now Button directly in the table row */}
                    {booking.status === 'CONFIRMED' && !booking.is_paid && (
                        <Button 
                            variant="primary" 
                            size="sm" 
                            className="me-2 rounded-pill px-3 shadow-sm fw-semibold" 
                            onClick={() => handlePayClick(booking)}
                        >
                            💳 Pay Now
                        </Button>
                    )}
                    
                    <Button
                      variant="light"
                      size="sm"
                      className="rounded-pill px-3 fw-semibold border shadow-sm"
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
      <Modal show={showDetailsModal} onHide={handleCloseDetailsModal} centered size="lg">
        {selectedBooking && (
          <>
            <Modal.Header closeButton className="bg-light border-0 py-4 px-4 rounded-top-4">
              <Modal.Title className="fw-bold text-primary">
                Booking Reference #{selectedBooking.id.toString().padStart(4, "0")}
              </Modal.Title>
            </Modal.Header>
            <Modal.Body className="p-4 p-md-5">
              
              <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 bg-light p-3 rounded-4">
                <h6 className="mb-0 text-muted fw-bold text-uppercase">Current Status</h6>
                <div className="d-flex gap-2 mt-2 mt-sm-0">
                    {getStatusBadge(selectedBooking.status)}
                    {selectedBooking.is_paid && <Badge pill bg="success" className="px-3 py-2 shadow-sm">Paid</Badge>}
                    {selectedBooking?.is_refunded && <Badge pill bg="secondary" className="px-3 py-2 shadow-sm" >Refunded</Badge>}
                  
                    {/* {selectedBooking.is_refunded && <Badge pill bg="bg-info" className="px-3 py-2 shadow-sm">Refunded</Badge>} */}
                </div>
              </div>

              <h6 className="text-primary fw-bold text-uppercase tracking-wider mb-3">
                Itinerary Details 
              </h6>
              
              <ListGroup variant="flush" className="mb-4 border rounded-4 overflow-hidden shadow-sm">
                <ListGroup.Item className="d-flex justify-content-between align-items-center py-3">
                  <span className="text-muted">Check-in Date:</span>
                  <strong className="fs-6">{selectedBooking.check_in_date}</strong>
                </ListGroup.Item>
                <ListGroup.Item className="d-flex justify-content-between align-items-center py-3">
                  <span className="text-muted">Check-out Date:</span>
                  <strong className="fs-6">{selectedBooking.check_out_date}</strong>
                </ListGroup.Item>
                {selectedBooking.accommodation_name && (
                  <ListGroup.Item className="d-flex justify-content-between align-items-center py-3">
                    <span className="text-muted">Accommodation:</span>
                    <strong className="text-end fs-6">{selectedBooking.accommodation_name}</strong>
                  </ListGroup.Item>
                )}
                {selectedBooking.tour_package_name && (
                  <ListGroup.Item className="d-flex justify-content-between align-items-center py-3">
                    <span className="text-muted">Tour Package:</span>
                    <strong className="text-end fs-6">{selectedBooking.tour_package_name}</strong>
                  </ListGroup.Item>
                )}
                <ListGroup.Item className="d-flex justify-content-between align-items-center py-3 bg-light">
                  <span className="text-muted">Destination:</span>
                  <strong className="fs-6">{selectedBooking.destination_name}</strong>
                </ListGroup.Item>
              </ListGroup>

              <div className="d-flex justify-content-between align-items-center p-4 bg-success bg-opacity-10 rounded-4 border border-success border-opacity-25">
                <h5 className="mb-0 text-dark fw-bold">Total Amount</h5>
                <h3 className="mb-0 text-success fw-bolder">
                  ${parseFloat(selectedBooking.total_amount).toFixed(2)}
                </h3>
              </div>
            </Modal.Body>
            <Modal.Footer className="d-flex justify-content-between border-0 px-4 pb-4 pt-0">
              {selectedBooking.status === "PENDING" || selectedBooking.status === "CONFIRMED" ? (
                <Button 
                  variant="outline-danger" 
                  className="rounded-pill px-4 fw-semibold"
                  onClick={handleCancelBooking} 
                  disabled={isCancelling}
                >
                  {isCancelling ? (
                    <><Spinner size="sm" animation="border" className="me-2" /> Cancelling...</>
                  ) : (
                    "Cancel Booking"
                  )}
                </Button>
              ) : <div></div>}
              <Button variant="secondary" className="rounded-pill px-4 fw-semibold shadow-sm" onClick={handleCloseDetailsModal}>
                Close Window
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