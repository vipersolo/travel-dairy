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
          accRes.data.filter((a) => a.destination.toString() === id),
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
      <div className="text-center mt-5">
        <Spinner animation="border" />
      </div>
    );
  }

  return (
    <Container>
      <h2 className="mb-4">Plan Your Trip</h2>

      {error && <Alert variant="danger">{error}</Alert>}

      <Row>
        {/* LEFT COLUMN */}
        <Col md={8}>
          <Card className="shadow-sm mb-4">
            <Card.Body>
              <Form onSubmit={handleSubmit}>
                {/* Travel Dates */}
                <h5 className="mb-3">1. Travel Dates</h5>

                <Row className="mb-4">
                  <Col>
                    <Form.Group>
                      <Form.Label>Check-in Date</Form.Label>

                      <Form.Control
                        type="date"
                        value={checkIn}
                        onChange={(e) => setCheckIn(e.target.value)}
                        required
                      />
                    </Form.Group>
                  </Col>

                  <Col>
                    <Form.Group>
                      <Form.Label>Check-out Date</Form.Label>

                      <Form.Control
                        type="date"
                        value={checkOut}
                        onChange={(e) => setCheckOut(e.target.value)}
                        required
                        disabled={isCheckoutLocked}
                      />

                      {isCheckoutLocked && (
                        <Form.Text className="text-muted">
                          Check-out date is automatically calculated from the
                          selected tour package.
                        </Form.Text>
                      )}
                    </Form.Group>
                  </Col>
                </Row>

                {/* Hotels & Packages */}
                <h5 className="mb-3">2. Accommodation & Activities</h5>

                {/* Hotel Selection */}
                <Form.Group className="mb-3">
                  <Form.Label>Select a Hotel</Form.Label>

                  <Form.Select
                    value={selectedAcc}
                    onChange={(e) => {
                      setSelectedAcc(e.target.value);

                      // Clear package
                      setSelectedPkg("");

                      // Unlock checkout
                      setIsCheckoutLocked(false);
                    }}
                  >
                    <option value="">None</option>

                    {accommodations.map((acc) => (
                      <option key={acc.id} value={acc.id}>
                        {acc.name} - ${acc.price_per_night}/night
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>

                {/* Package Selection */}
                <Form.Group className="mb-4">
                  <Form.Label>OR Select a Tour Package</Form.Label>

                  <Form.Select
                    value={selectedPkg}
                    onChange={(e) => {
                      setSelectedPkg(e.target.value);

                      // Clear hotel
                      setSelectedAcc("");
                    }}
                  >
                    <option value="">None</option>

                    {tourPackages.map((pkg) => (
                      <option key={pkg.id} value={pkg.id}>
                        {pkg.title} - ${pkg.total_price} flat
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>

                {/* Submit Button */}
                <Button
                  variant="primary"
                  type="submit"
                  size="lg"
                  className="w-100"
                  disabled={isSubmitting || !estimatedTotal}
                >
                  {isSubmitting ? (
                    <Spinner size="sm" animation="border" />
                  ) : (
                    "Confirm Booking"
                  )}
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>

        {/* RIGHT COLUMN */}
        <Col md={4}>
          <Card
            className="shadow-sm border-primary"
            style={{
              position: "sticky",
              top: "20px",
            }}
          >
            <Card.Header className="bg-primary text-white">
              <h5 className="mb-0">Live Price Summary</h5>
            </Card.Header>

            <Card.Body className="text-center py-5">
              {isEstimating ? (
                <div>
                  <Spinner
                    animation="grow"
                    variant="primary"
                    className="mb-2"
                  />

                  <p className="text-muted">Calculating...</p>
                </div>
              ) : estimatedTotal ? (
                <div>
                  <h1 className="display-4 fw-bold text-success">
                    ${estimatedTotal}
                  </h1>

                  <p className="text-muted mb-0">Total Estimated Cost</p>
                </div>
              ) : (
                <p className="text-muted mb-0">
                  Select your dates and a hotel/package to see the live
                  estimate.
                </p>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default PlanTrip;
