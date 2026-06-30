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
        return <Badge pill bg="success" className="px-3 py-2 shadow-sm">Confirmed</Badge>;

      case "PENDING":
        return (
          <Badge pill bg="warning" text="dark" className="px-3 py-2 shadow-sm">
            Action Required
          </Badge>
        );

      case "CANCELLED":
        return <Badge pill bg="danger" className="px-3 py-2 shadow-sm">Cancelled</Badge>;

      case "COMPLETED":
        return <Badge pill bg="info" className="px-3 py-2 shadow-sm">Completed</Badge>;

      default:
        return <Badge pill bg="secondary" className="px-3 py-2 shadow-sm">{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="d-flex flex-column justify-content-center align-items-center" style={{ minHeight: "60vh" }}>
        <Spinner animation="grow" variant="primary" className="mb-3" />
        <h5 className="text-muted">Loading business data...</h5>
      </div>
    );
  }

  return (
    <Container fluid className="py-4 px-3 px-md-4">
      {/* Header Section */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-5">
        <div>
          <h2 className="fw-bold mb-1">Business Performance</h2>
          <p className="text-muted mb-0">Overview of your recent sales and active reservations.</p>
        </div>
      </div>

      {error && <Alert variant="danger" className="rounded-3 shadow-sm">{error}</Alert>}

      {/* KPI Cards */}
      <Row className="mb-5 g-4">
        <Col md={4}>
          <Card className="shadow-sm border-0 rounded-4 bg-white h-100">
            <Card.Body className="p-4 d-flex align-items-center">
              <div className="bg-primary bg-opacity-10 text-primary p-3 rounded-circle me-4">
                <span className="fs-3">💵</span>
              </div>
              <div>
                <h6 className="text-muted text-uppercase fw-bold mb-1" style={{ fontSize: '0.85rem', letterSpacing: '0.5px' }}>
                  Total Revenue
                </h6>
                <h2 className="fw-bolder text-dark mb-0">
                  ${totalRevenue.toFixed(2)}
                </h2>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={4}>
          <Card className="shadow-sm border-0 rounded-4 bg-white h-100">
            <Card.Body className="p-4 d-flex align-items-center">
              <div className="bg-success bg-opacity-10 text-success p-3 rounded-circle me-4">
                <span className="fs-3">📈</span>
              </div>
              <div>
                <h6 className="text-muted text-uppercase fw-bold mb-1" style={{ fontSize: '0.85rem', letterSpacing: '0.5px' }}>
                  Bookings Sold
                </h6>
                <h2 className="fw-bolder text-dark mb-0">
                  {
                    sales.filter(
                      (sale) => sale.status === "COMPLETED"
                    ).length
                  }
                </h2>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={4}>
          <Card className="shadow-sm border-0 rounded-4 bg-white h-100">
            <Card.Body className="p-4 d-flex align-items-center">
              <div className="bg-warning bg-opacity-10 text-warning p-3 rounded-circle me-4">
                <span className="fs-3">⏳</span>
              </div>
              <div>
                <h6 className="text-muted text-uppercase fw-bold mb-1" style={{ fontSize: '0.85rem', letterSpacing: '0.5px' }}>
                  Pending Reservations
                </h6>
                <h2 className="fw-bolder text-dark mb-0">
                  {pendingBookingsCount}
                </h2>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Table Header Controls */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4">
        <h4 className="fw-bold mb-3 mb-md-0">Recent Reservations Ledger</h4>

        <div className="d-flex gap-2">
          <Button
            as={Link}
            to="/manager/accommodations"
            variant="light"
            className="border shadow-sm rounded-pill px-3 fw-semibold text-secondary"
          >
            🏨 Manage Hotels
          </Button>

          <Button
            as={Link}
            to="/manager/packages"
            variant="light"
            className="border shadow-sm rounded-pill px-3 fw-semibold text-secondary"
          >
            🎒 Manage Packages
          </Button>
        </div>
      </div>

      {/* Table */}
      <Card className="shadow-sm border-0 rounded-4 overflow-hidden">
        <Table responsive hover className="mb-0 align-middle text-nowrap">
          <thead className="bg-light text-muted" style={{ fontSize: '0.85rem' }}>
            <tr className="text-uppercase">
              <th className="py-3 ps-4 border-0">Ref #</th>
              <th className="py-3 border-0">Customer Info</th>
              <th className="py-3 border-0">Product Sold</th>
              <th className="py-3 border-0">Dates</th>
              <th className="py-3 border-0">Revenue</th>
              <th className="py-3 border-0">Status</th>
              <th className="py-3 pe-4 border-0 text-end">Actions</th>
            </tr>
          </thead>

          <tbody className="border-top-0">
            {sales.map((sale) => (
              <tr key={sale.id} className="bg-white">
                {/* Ref ID */}
                <td className="py-3 ps-4">
                  <strong className="text-primary">
                    #{sale.id.toString().padStart(4, "0")}
                  </strong>
                </td>

                {/* Customer Info Section */}
                <td className="py-3">
                  {sale.citizen_details ? (
                    <div className="d-flex align-items-center">
                      <div className="bg-light text-secondary rounded-circle d-flex justify-content-center align-items-center me-3 shadow-sm" style={{ width: '40px', height: '40px', fontSize: '1.2rem' }}>
                        👤
                      </div>
                      <div>
                        <div className="fw-bold text-dark">
                          {sale.citizen_details.first_name} {sale.citizen_details.last_name}
                        </div>
                        {sale.citizen_details.phone_number ? (
                          <small className="text-muted">
                            📞 {sale.citizen_details.phone_number}
                          </small>
                        ) : (
                          <small className="text-muted fst-italic">No phone provided</small>
                        )}
                      </div>
                    </div>
                  ) : (
                    <span className="text-muted">Customer #{sale.citizen}</span>
                  )}
                </td>

                {/* Product */}
                <td className="py-3">
                  {sale.accommodation_name ? (
                    <div>
                      <Badge bg="secondary" className="me-2 rounded-pill">Hotel</Badge>
                      <span className="fw-semibold text-dark">{sale.accommodation_name}</span>
                    </div>
                  ) : (
                    <div>
                      <Badge bg="dark" className="me-2 rounded-pill">Tour</Badge>
                      <span className="fw-semibold text-dark">{sale.tour_package_name}</span>
                    </div>
                  )}
                </td>

                {/* Dates */}
                <td className="py-3 text-muted">
                  <div><small className="fw-semibold">In:</small> {sale.check_in_date}</div>
                  <div><small className="fw-semibold">Out:</small> {sale.check_out_date}</div>
                </td>

                {/* Revenue */}
                <td className="py-3 text-success fw-bold fs-6">
                  ${parseFloat(sale.total_amount).toFixed(2)}
                </td>

                {/* Status + Payment */}
                <td className="py-3">
                  <div className="d-flex align-items-center gap-2">
                    {getStatusBadge(sale.status)}

                    {sale.is_paid ? (
                      <Badge pill bg="success" className="px-3 py-2 shadow-sm">Paid</Badge>
                    ) : (
                      <Badge pill bg="warning" text="dark" className="px-3 py-2 shadow-sm">Unpaid</Badge>
                    )}
                  </div>
                </td>

                {/* Actions */}
                <td className="py-3 pe-4 text-end">
                  <div className="d-flex gap-2 justify-content-end align-items-center">
                    {/* Pending */}
                    {sale.status === "PENDING" && (
                      <>
                        <Button
                          variant="success"
                          size="sm"
                          className="rounded-pill px-3 shadow-sm fw-semibold"
                          onClick={() => handleStatusUpdate(sale.id, "CONFIRMED")}
                        >
                          ✓ Confirm
                        </Button>

                        <Button
                          variant="outline-danger"
                          size="sm"
                          className="rounded-pill px-3 shadow-sm fw-semibold"
                          onClick={() => handleStatusUpdate(sale.id, "CANCELLED")}
                        >
                          ✕ Cancel
                        </Button>
                      </>
                    )}

                    {/* Confirmed */}
                    {sale.status === "CONFIRMED" && (
                      <>
                        <Button
                          variant="info"
                          size="sm"
                          className="rounded-pill px-3 shadow-sm fw-semibold text-white"
                          onClick={() => handleStatusUpdate(sale.id, "COMPLETED")}
                        >
                          ★ Complete
                        </Button>

                        <Button
                          variant="outline-danger"
                          size="sm"
                          className="rounded-pill px-3 shadow-sm fw-semibold"
                          onClick={() => handleStatusUpdate(sale.id, "CANCELLED")}
                        >
                          ✕ Cancel
                        </Button>
                      </>
                    )}

                    {/* Final States */}
                    {(sale.status === "COMPLETED" ||
                      sale.status === "CANCELLED") && (
                      <Badge bg="light" text="muted" className="border px-3 py-2 rounded-pill">
                        Locked
                      </Badge>
                    )}
                  </div>
                </td>
              </tr>
            ))}

            {/* Empty State */}
            {sales.length === 0 && (
              <tr>
                <td colSpan="7" className="text-center py-5">
                  <div className="py-4">
                    <span className="display-4 d-block mb-3">📋</span>
                    <h5 className="text-dark fw-bold">No sales data yet</h5>
                    <p className="text-muted">Make sure your inventory is set to "Active" so travelers can book it!</p>
                  </div>
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