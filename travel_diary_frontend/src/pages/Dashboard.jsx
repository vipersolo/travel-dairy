import { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Table,
  Badge,
  Spinner,
  Alert,
  Button,
  Modal,
  ListGroup,
} from "react-bootstrap";

import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import api from "../services/api";

const Dashboard = () => {
  const { user } = useSelector((state) => state.auth);

  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);

  // Cancellation loading state
  const [isCancelling, setIsCancelling] = useState(false);

  // Fetch bookings
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

  // Total spent calculation
  const totalSpent = bookings
    .filter(
      (booking) =>
        booking.status === "CONFIRMED" || booking.status === "COMPLETED",
    )
    .reduce((sum, booking) => sum + parseFloat(booking.total_amount), 0);

  // Status badge helper
  const getStatusBadge = (status) => {
    switch (status) {
      case "CONFIRMED":
        return <Badge bg="success">Confirmed</Badge>;

      case "PENDING":
        return (
          <Badge bg="warning" text="dark">
            Pending
          </Badge>
        );

      case "CANCELLED":
        return <Badge bg="danger">Cancelled</Badge>;

      case "COMPLETED":
        return <Badge bg="info">Completed</Badge>;

      default:
        return <Badge bg="secondary">{status}</Badge>;
    }
  };

  // Open modal
  const handleViewDetails = (booking) => {
    setSelectedBooking(booking);
    setShowModal(true);
  };

  // Close modal
  const handleCloseModal = () => {
    setSelectedBooking(null);
    setShowModal(false);
    setError(null);
  };

  // Cancel booking
  const handleCancelBooking = async () => {
    const confirmCancel = window.confirm(
      "Are you sure you want to cancel this trip? This action cannot be undone.",
    );

    if (!confirmCancel) return;

    setIsCancelling(true);

    try {
      const response = await api.post(
        `travel/bookings/${selectedBooking.id}/cancel/`,
      );

      const updatedBooking = response.data;

      // Update bookings table instantly
      setBookings((prevBookings) =>
        prevBookings.map((booking) =>
          booking.id === updatedBooking.id ? updatedBooking : booking,
        ),
      );

      // Update modal instantly
      setSelectedBooking(updatedBooking);
    } catch (err) {
      alert(
        err.response?.data?.error ||
          "Failed to cancel the booking. Please try again.",
      );
    } finally {
      setIsCancelling(false);
    }
  };

  // Loading screen
  if (isLoading) {
    return (
      <div className="text-center mt-5">
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  return (
    <Container>
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Welcome, {user?.email}</h2>

        <Button as={Link} to="/destinations" variant="outline-primary">
          Plan a New Trip
        </Button>
      </div>

      {/* Error */}
      {error && <Alert variant="danger">{error}</Alert>}

      {/* Summary Cards */}
      <Row className="mb-5 g-4">
        {/* Total Trips */}
        <Col md={4}>
          <Card className="shadow-sm border-0 bg-light text-center h-100">
            <Card.Body className="py-4">
              <h5 className="text-muted">Total Trips</h5>

              <h2 className="display-5 fw-bold">{bookings.length}</h2>
            </Card.Body>
          </Card>
        </Col>

        {/* Active Bookings */}
        <Col md={4}>
          <Card className="shadow-sm border-0 bg-light text-center h-100">
            <Card.Body className="py-4">
              <h5 className="text-muted">Active Bookings</h5>

              <h2 className="display-5 fw-bold text-primary">
                {
                  bookings.filter((booking) => booking.status === "CONFIRMED")
                    .length
                }
              </h2>
            </Card.Body>
          </Card>
        </Col>

        {/* Total Spent */}
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

      {/* Travel History */}
      <h4 className="mb-3">Your Travel History</h4>

      {bookings.length === 0 ? (
        <Card className="text-center py-5 shadow-sm border-0 bg-light">
          <Card.Body>
            <h4 className="text-muted mb-3">
              You haven't booked any trips yet.
            </h4>

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
                  <td>
                    <strong>#{booking.id.toString().padStart(4, "0")}</strong>
                  </td>

                  <td>{booking.check_in_date}</td>

                  <td>{booking.check_out_date}</td>

                  <td>${parseFloat(booking.total_amount).toFixed(2)}</td>

                  <td>{getStatusBadge(booking.status)}</td>

                  <td>
                    <Button
                      variant="link"
                      size="sm"
                      className="text-decoration-none"
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

      {/* Booking Details Modal */}
      <Modal show={showModal} onHide={handleCloseModal} centered>
        {selectedBooking && (
          <>
            <Modal.Header closeButton className="bg-light">
              <Modal.Title>
                Booking #{selectedBooking.id.toString().padStart(4, "0")}
              </Modal.Title>
            </Modal.Header>

            <Modal.Body className="p-4">
              {/* Status */}
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h5 className="mb-0">Status</h5>

                {getStatusBadge(selectedBooking.status)}
              </div>

              {/* Itinerary */}
              <h6
                className="text-muted text-uppercase mb-3"
                style={{ fontSize: "0.85rem" }}
              >
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

                {/* Hotel */}
                {selectedBooking.accommodation_name && (
                  <ListGroup.Item className="d-flex justify-content-between">
                    <span>Hotel:</span>

                    <strong className="text-end">
                      {selectedBooking.accommodation_name}
                    </strong>
                  </ListGroup.Item>
                )}

                {/* Tour Package */}
                {selectedBooking.tour_package_name && (
                  <ListGroup.Item className="d-flex justify-content-between">
                    <span>Tour Package:</span>

                    <strong className="text-end">
                      {selectedBooking.tour_package_name}
                    </strong>
                  </ListGroup.Item>
                )}
              </ListGroup>

              {/* Total */}
              <div className="d-flex justify-content-between align-items-center p-3 bg-light rounded border">
                <h5 className="mb-0">Total Amount</h5>

                <h4 className="mb-0 text-success fw-bold">
                  ${parseFloat(selectedBooking.total_amount).toFixed(2)}
                </h4>
              </div>
            </Modal.Body>

            <Modal.Footer className="d-flex justify-content-between">
              {/* Cancel Button */}
              {selectedBooking.status === "PENDING" ||
              selectedBooking.status === "CONFIRMED" ? (
                <Button
                  variant="outline-danger"
                  onClick={handleCancelBooking}
                  disabled={isCancelling}
                >
                  {isCancelling ? (
                    <Spinner size="sm" animation="border" />
                  ) : (
                    "Cancel Booking"
                  )}
                </Button>
              ) : (
                <div></div>
              )}

              {/* Close Button */}
              <Button variant="secondary" onClick={handleCloseModal}>
                Close
              </Button>
            </Modal.Footer>
          </>
        )}
      </Modal>
    </Container>
  );
};

export default Dashboard;
