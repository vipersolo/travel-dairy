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
} from "react-bootstrap";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import api from "../../services/api";

const ManagerDashboard = () => {
  const { user } = useSelector((state) => state.auth);

  const [sales, setSales] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchManagerSales = async () => {
      try {
        const response = await api.get("travel/bookings/");
        setSales(response.data);
      } catch (err) {
        setError("Failed to load your business data.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchManagerSales();
  }, []);

  const handleStatusUpdate = async (bookingId, newStatus) => {
    try {
      const response = await api.post(
        `travel/bookings/${bookingId}/update_status/`,
        {
          status: newStatus,
        }
      );

      // Update UI instantly
      setSales((prevSales) =>
        prevSales.map((sale) =>
          sale.id === bookingId ? response.data : sale
        )
      );
    } catch (err) {
      alert(
        err.response?.data?.error ||
          "Failed to update status. Please try again."
      );
    }
  };

  // Revenue from confirmed + completed bookings
  const totalRevenue = sales
    .filter(
      (s) => s.status === "CONFIRMED" || s.status === "COMPLETED"
    )
    .reduce((sum, sale) => sum + parseFloat(sale.total_amount), 0);

  // Pending bookings count
  const pendingBookingsCount = sales.filter(
    (s) => s.status === "PENDING"
  ).length;

  const getStatusBadge = (status) => {
    switch (status) {
      case "CONFIRMED":
        return <Badge bg="success">Confirmed</Badge>;

      case "PENDING":
        return (
          <Badge bg="warning" text="dark">
            Action Required
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

  if (isLoading) {
    return (
      <Spinner
        animation="border"
        className="d-block mx-auto mt-5"
      />
    );
  }

  return (
    <Container fluid className="px-0">
      <h2 className="mb-4">Business Performance Overview</h2>

      {error && <Alert variant="danger">{error}</Alert>}

      {/* KPI Cards */}
      <Row className="mb-5 g-4">
        <Col md={4}>
          <Card className="shadow-sm border-0 border-start border-primary border-4 h-100">
            <Card.Body className="py-4">
              <h6 className="text-muted text-uppercase fw-bold mb-2">
                Total Revenue
              </h6>

              <h2 className="display-6 fw-bold text-dark">
                ${totalRevenue.toFixed(2)}
              </h2>
            </Card.Body>
          </Card>
        </Col>

        <Col md={4}>
          <Card className="shadow-sm border-0 border-start border-success border-4 h-100">
            <Card.Body className="py-4">
              <h6 className="text-muted text-uppercase fw-bold mb-2">
                Total Bookings Sold
              </h6>

              <h2 className="display-6 fw-bold text-dark">
                {
                  sales.filter(
                    (sale) => sale.status === "COMPLETED"
                  ).length
                }
              </h2>
            </Card.Body>
          </Card>
        </Col>

        <Col md={4}>
          <Card className="shadow-sm border-0 border-start border-warning border-4 h-100">
            <Card.Body className="py-4">
              <h6 className="text-muted text-uppercase fw-bold mb-2">
                Pending Reservations
              </h6>

              <h2 className="display-6 fw-bold text-dark">
                {pendingBookingsCount}
              </h2>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4 className="mb-0">Recent Reservations Ledger</h4>

        <div>
          <Button
            as={Link}
            to="/manager/accommodations"
            variant="outline-secondary"
            size="sm"
            className="me-2"
          >
            Manage Hotels
          </Button>

          <Button
            as={Link}
            to="/manager/packages"
            variant="outline-secondary"
            size="sm"
          >
            Manage Packages
          </Button>
        </div>
      </div>

      {/* Table */}
      <Card className="shadow-sm border-0">
        <Table responsive hover className="mb-0 align-middle">
          <thead className="bg-light">
            <tr>
              <th>Ref #</th>
              <th>Customer Info</th>
              <th>Product Sold</th>
              <th>Dates</th>
              <th>Revenue</th>
              <th>Status</th>
              <th className="text-end">Actions</th>
            </tr>
          </thead>

          <tbody>
            {sales.map((sale) => (
              <tr key={sale.id}>
                {/* Ref ID */}
                <td>
                  <strong>
                    #{sale.id.toString().padStart(4, "0")}
                  </strong>
                </td>

                {/* Customer */}
                <td>Customer #{sale.citizen}</td>

                {/* Product */}
                <td>
                  {sale.accommodation_name ? (
                    <>
                      <Badge bg="secondary" className="me-1">
                        Hotel
                      </Badge>

                      {sale.accommodation_name}
                    </>
                  ) : (
                    <>
                      <Badge bg="dark" className="me-1">
                        Tour
                      </Badge>

                      {sale.tour_package_name}
                    </>
                  )}
                </td>

                {/* Dates */}
                <td>
                  <small>
                    {sale.check_in_date} to{" "}
                    {sale.check_out_date}
                  </small>
                </td>

                {/* Revenue */}
                <td className="text-success fw-bold">
                  $
                  {parseFloat(sale.total_amount).toFixed(2)}
                </td>

                {/* Status + Payment */}
                <td>
                  <div className="d-flex align-items-center flex-wrap gap-2">
                    {/* Booking Status */}
                    {getStatusBadge(sale.status)}

                    {/* Payment Status */}
                    {sale.is_paid ? (
                      <Badge bg="success">
                        Paid
                      </Badge>
                    ) : (
                      <Badge bg="warning" text="dark">
                        Unpaid
                      </Badge>
                    )}
                  </div>
                </td>

                {/* Actions */}
                <td className="text-end">
                  <div
                    className="d-flex gap-2 justify-content-end align-items-center"
                    style={{ minHeight: "31px" }}
                  >
                    {/* Pending */}
                    {sale.status === "PENDING" && (
                      <>
                        <Button
                          variant="outline-success"
                          size="sm"
                          onClick={() =>
                            handleStatusUpdate(
                              sale.id,
                              "CONFIRMED"
                            )
                          }
                        >
                          Confirm
                        </Button>

                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() =>
                            handleStatusUpdate(
                              sale.id,
                              "CANCELLED"
                            )
                          }
                        >
                          Cancel
                        </Button>
                      </>
                    )}

                    {/* Confirmed */}
                    {sale.status === "CONFIRMED" && (
                      <>
                        <Button
                          variant="outline-info"
                          size="sm"
                          onClick={() =>
                            handleStatusUpdate(
                              sale.id,
                              "COMPLETED"
                            )
                          }
                        >
                          Complete
                        </Button>

                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() =>
                            handleStatusUpdate(
                              sale.id,
                              "CANCELLED"
                            )
                          }
                        >
                          Cancel
                        </Button>
                      </>
                    )}

                    {/* Final States */}
                    {(sale.status === "COMPLETED" ||
                      sale.status === "CANCELLED") && (
                      <span className="text-muted small fst-italic">
                        Resolved
                      </span>
                    )}
                  </div>
                </td>
              </tr>
            ))}

            {/* Empty State */}
            {sales.length === 0 && (
              <tr>
                <td
                  colSpan="7"
                  className="text-center py-5 text-muted"
                >
                  No sales yet. Make sure your inventory is
                  set to "Active" so travelers can book it!
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      </Card>
    </Container>
  );
};

export default ManagerDashboard;