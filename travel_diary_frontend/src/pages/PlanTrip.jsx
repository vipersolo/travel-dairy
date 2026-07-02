import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
  Spinner,
  Alert,
  Badge,
  ListGroup,
} from "react-bootstrap";
import api from "../services/api";

const PlanTrip = () => {
  const { id } = useParams(); // Destination ID from the URL
  const navigate = useNavigate();

  // --- State: Inventory Data ---
  const [accommodations, setAccommodations] = useState([]);
  const [tourPackages, setTourPackages] = useState([]);
  const [isPageLoading, setIsPageLoading] = useState(true);

  // --- State: Form Inputs ---
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [selectedAcc, setSelectedAcc] = useState("");
  const [selectedPkg, setSelectedPkg] = useState("");

  // NEW: Lock checkout when package selected
  const [isCheckoutLocked, setIsCheckoutLocked] = useState(false);

  // --- State: Live Estimation & Submission ---
  const [estimatedTotal, setEstimatedTotal] = useState(null);
  const [isEstimating, setIsEstimating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // 1. Fetch available hotels and packages for this destination
  useEffect(() => {
    const fetchInventory = async () => {
      try {
        const [accRes, pkgRes] = await Promise.all([
          api.get("travel/accommodations/"),
          api.get("travel/tour-packages/"),
        ]);

        // Filter inventory for current destination
        setAccommodations(
          accRes.data.filter((a) => a.destination.toString() === id && a.is_active === true),
        );

        setTourPackages(
          pkgRes.data.filter((p) => p.destination.toString() === id),
        );
      } catch (err) {
        setError("Failed to load available hotels and packages.");
      } finally {
        setIsPageLoading(false);
      }
    };

    fetchInventory();
  }, [id]);

  // 2. Auto-calculate checkout date when package selected
  useEffect(() => {
    // If no package selected, unlock checkout
    if (!selectedPkg || !checkIn) {
      setIsCheckoutLocked(false);
      return;
    }

    const selectedPackage = tourPackages.find(
      (pkg) => pkg.id.toString() === selectedPkg.toString(),
    );

    // IMPORTANT:
    // Your backend package model should contain:
    // duration_days
    if (selectedPackage?.duration_days) {
      const checkInDate = new Date(checkIn);

      // Clone date
      const calculatedCheckout = new Date(checkInDate);

      // Add duration
      calculatedCheckout.setDate(
        calculatedCheckout.getDate() + selectedPackage.duration_days,
      );

      // Format YYYY-MM-DD
      const formattedDate = calculatedCheckout.toISOString().split("T")[0];

      setCheckOut(formattedDate);

      // Lock checkout editing
      setIsCheckoutLocked(true);
    }
  }, [selectedPkg, checkIn, tourPackages]);

  // 3. Reactive Price Estimator
  useEffect(() => {
    const fetchEstimate = async () => {
      // Only estimate if valid data exists
      if (checkIn && checkOut && (selectedAcc || selectedPkg)) {
        // Validate dates
        if (new Date(checkIn) >= new Date(checkOut)) {
          setEstimatedTotal(null);
          return;
        }

        setIsEstimating(true);

        try {
          const payload = {
            check_in_date: checkIn,
            check_out_date: checkOut,
            accommodation_id: selectedAcc || null,
            tour_package_id: selectedPkg || null,
          };

          const response = await api.post(
            "travel/bookings/estimate_budget/",
            payload,
          );

          setEstimatedTotal(response.data.estimated_total);
        } catch (err) {
          setEstimatedTotal(null);
        } finally {
          setIsEstimating(false);
        }
      } else {
        setEstimatedTotal(null);
      }
    };

    // Debounce API requests
    const timeoutId = setTimeout(() => {
      fetchEstimate();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [checkIn, checkOut, selectedAcc, selectedPkg]);

  // 4. Final Booking Submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedAcc && !selectedPkg) {
      setError("You must select either a hotel or a tour package.");
      return;
    }

    if (new Date(checkIn) >= new Date(checkOut)) {
      setError("Check-out date must be after check-in date.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await api.post("travel/bookings/", {
        check_in_date: checkIn,
        check_out_date: checkOut,
        accommodation: selectedAcc || null,
        tour_package: selectedPkg || null,
      });

      // Redirect after booking
      navigate("/dashboard");
    } catch (err) {
      setError("Failed to create booking. Please try again.");
      setIsSubmitting(false);
    }
  };

  if (isPageLoading) {
    return (
      <div className="d-flex flex-column align-items-center justify-content-center min-vh-50 py-5">
        <Spinner animation="border" variant="primary" />
        <p className="text-muted mt-3">Loading trip options...</p>
      </div>
    );
  }

  return (
    <Container className="py-4">
      {/* Header */}
      <div className="mb-4">
        <h2 className="fw-bold mb-1">Plan Your Trip</h2>
        <p className="text-muted">Customize your travel experience below</p>
      </div>

      {error && (
        <Alert variant="danger" dismissible onClose={() => setError(null)} className="shadow-sm">
          {error}
        </Alert>
      )}

      <Row className="g-4">
        {/* LEFT COLUMN */}
        <Col lg={8}>
          <Card className="shadow-sm border-0">
            <Card.Body className="p-4">
              <Form onSubmit={handleSubmit}>
                {/* Travel Dates */}
                <div className="mb-4">
                  <div className="d-flex align-items-center gap-2 mb-3">
                    <Badge bg="primary" className="rounded-circle" style={{ width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      1
                    </Badge>
                    <h5 className="mb-0 fw-semibold">Travel Dates</h5>
                  </div>

                  <Row className="g-3">
                    <Col md={6}>
                      <Form.Group>
                        <Form.Label className="fw-medium text-secondary small text-uppercase">
                          Check-in Date
                        </Form.Label>
                        <Form.Control
                          type="date"
                          value={checkIn}
                          onChange={(e) => setCheckIn(e.target.value)}
                          required
                          className="py-2"
                        />
                      </Form.Group>
                    </Col>

                    <Col md={6}>
                      <Form.Group>
                        <Form.Label className="fw-medium text-secondary small text-uppercase">
                          Check-out Date
                        </Form.Label>
                        <Form.Control
                          type="date"
                          value={checkOut}
                          onChange={(e) => setCheckOut(e.target.value)}
                          required
                          disabled={isCheckoutLocked}
                          className={isCheckoutLocked ? "bg-light" : ""}
                        />
                        {isCheckoutLocked && (
                          <Form.Text className="text-muted small">
                            <i className="bi bi-info-circle me-1"></i>
                            Auto-calculated from tour package duration
                          </Form.Text>
                        )}
                      </Form.Group>
                    </Col>
                  </Row>
                </div>

                <hr className="my-4 opacity-25" />

                {/* Hotels & Packages */}
                <div className="mb-4">
                  <div className="d-flex align-items-center gap-2 mb-3">
                    <Badge bg="primary" className="rounded-circle" style={{ width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      2
                    </Badge>
                    <h5 className="mb-0 fw-semibold">Accommodation & Activities</h5>
                  </div>

                  {/* Hotel Selection */}
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-medium">Select a Hotel</Form.Label>
                    <Form.Select
                      value={selectedAcc}
                      onChange={(e) => {
                        setSelectedAcc(e.target.value);
                        setSelectedPkg("");
                        setIsCheckoutLocked(false);
                      }}
                      className="py-2"
                    >
                      <option value="">None — I'll arrange my own stay</option>
                      {accommodations.map((acc) => (
                        <option key={acc.id} value={acc.id}>
                          {acc.name} — ${acc.price_per_night}/night
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>

                  <div className="text-center my-3">
                    <Badge bg="secondary" className="px-3 py-1 rounded-pill text-uppercase small fw-semibold opacity-75">
                      OR
                    </Badge>
                  </div>

                  {/* Package Selection */}
                  <Form.Group className="mb-4">
                    <Form.Label className="fw-medium">Select a Tour Package</Form.Label>
                    <Form.Select
                      value={selectedPkg}
                      onChange={(e) => {
                        setSelectedPkg(e.target.value);
                        setSelectedAcc("");
                      }}
                      className="py-2"
                    >
                      <option value="">None — I'll plan my own activities</option>
                      {tourPackages.map((pkg) => (
                        <option key={pkg.id} value={pkg.id}>
                          {pkg.title} — ${pkg.total_price} flat
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </div>

                {/* Submit Button */}
                <Button
                  variant="primary"
                  type="submit"
                  size="lg"
                  className="w-100 rounded-3 fw-semibold py-3"
                  disabled={isSubmitting || !estimatedTotal}
                >
                  {isSubmitting ? (
                    <>
                      <Spinner size="sm" animation="border" className="me-2" />
                      Processing...
                    </>
                  ) : (
                    "Confirm Booking"
                  )}
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>

        {/* RIGHT COLUMN */}
        <Col lg={4}>
          <div style={{ position: "sticky", top: "24px" }}>
            <Card className="shadow-sm border-0 overflow-hidden">
              <Card.Header className="bg-primary text-white border-0 py-3">
                <h5 className="mb-0 fw-semibold">
                  <span role="img" aria-label="receipt" className="me-2">🧾</span>
                  Price Summary
                </h5>
              </Card.Header>

              <Card.Body className="p-4">
                {isEstimating ? (
                  <div className="text-center py-4">
                    <Spinner animation="border" variant="primary" className="mb-3" />
                    <p className="text-muted mb-0">Calculating your estimate...</p>
                  </div>
                ) : estimatedTotal ? (
                  <div className="text-center py-2">
                    <p className="text-muted small text-uppercase fw-semibold mb-2">
                      Estimated Total
                    </p>
                    <h1 className="display-4 fw-bold text-success mb-2">
                      ${estimatedTotal}
                    </h1>
                    <Badge bg="success" className="rounded-pill px-3 py-2">
                      Ready to Book
                    </Badge>

                    <ListGroup variant="flush" className="mt-4 text-start small">
                      <ListGroup.Item className="px-0 py-2 d-flex justify-content-between border-0 border-bottom">
                        <span className="text-muted">Check-in</span>
                        <span className="fw-medium">{checkIn || '—'}</span>
                      </ListGroup.Item>
                      <ListGroup.Item className="px-0 py-2 d-flex justify-content-between border-0 border-bottom">
                        <span className="text-muted">Check-out</span>
                        <span className="fw-medium">{checkOut || '—'}</span>
                      </ListGroup.Item>
                      <ListGroup.Item className="px-0 py-2 d-flex justify-content-between border-0">
                        <span className="text-muted">Selection</span>
                        <span className="fw-medium">
                          {selectedAcc ? 'Hotel' : selectedPkg ? 'Tour Package' : '—'}
                        </span>
                      </ListGroup.Item>
                    </ListGroup>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <div className="mb-3">
                      <span role="img" aria-label="calendar" style={{ fontSize: '2.5rem' }}>📅</span>
                    </div>
                    <p className="text-muted mb-0">
                      Select your dates and choose a hotel or tour package to see your live estimate.
                    </p>
                  </div>
                )}
              </Card.Body>
            </Card>

            {/* Trust indicators */}
            <div className="mt-3 text-center">
              <small className="text-muted">
                <span role="img" aria-label="shield" className="me-1">🔒</span>
                Secure booking • Free cancellation
              </small>
            </div>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default PlanTrip;