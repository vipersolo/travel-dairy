import { useState, useEffect } from 'react';
import { Row, Col, Card, Table, Button, Modal, Form, Spinner, Alert, Badge } from 'react-bootstrap';
import api from '../../services/api';

const ManagerPackages = () => {
    const [packages, setPackages] = useState([]);
    const [destinations, setDestinations] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // Modal & Form State
    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState(null); 
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const [formData, setFormData] = useState({
        title: '',
        destination: '',
        description: '',
        duration_days: '',
        total_price: '',
        is_active: true
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetching ONLY this manager's packages + the global destinations list
                const [pkgRes, destRes] = await Promise.all([
                    api.get('travel/tour-packages/?my_listings=true'),
                    api.get('travel/destinations/')
                ]);
                setPackages(pkgRes.data);
                setDestinations(destRes.data);
            } catch (err) {
                setError('Failed to load your tour packages.');
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleShowModal = (pkg = null) => {
        if (pkg) {
            setEditingId(pkg.id);
            setFormData({
                title: pkg.title,
                destination: pkg.destination,
                description: pkg.description,
                duration_days: pkg.duration_days,
                total_price: pkg.total_price,
                is_active: pkg.is_active
            });
        } else {
            setEditingId(null);
            setFormData({ title: '', destination: '', description: '', duration_days: '', total_price: '', is_active: true });
        }
        setShowModal(true);
    };

    const handleCloseModal = () => setShowModal(false);

    const handleChange = (e) => {
        const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
        setFormData({ ...formData, [e.target.name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);

        try {
            if (editingId) {
                const response = await api.put(`travel/tour-packages/${editingId}/`, formData);
                setPackages(packages.map(p => p.id === editingId ? response.data : p));
            } else {
                const response = await api.post('travel/tour-packages/', formData);
                setPackages([...packages, response.data]);
            }
            handleCloseModal();
        } catch (err) {
            setError(err.response?.data?.detail || 'Failed to save tour package.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this package? This cannot be undone.')) return;
        
        try {
            await api.delete(`travel/tour-packages/${id}/`);
            setPackages(packages.filter(p => p.id !== id));
        } catch (err) {
            alert('Failed to delete package. It may have active bookings.');
        }
    };

    // Improved Full-Screen Loading State
    if (isLoading) return (
        <div className="d-flex flex-column justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
            <Spinner animation="border" variant="primary" className="mb-3" />
            <h5 className="text-muted">Loading your tour packages...</h5>
        </div>
    );

    return (
        <div className="py-3">
            {/* Header Section */}
            <div className="d-flex justify-content-between align-items-end mb-4">
                <div>
                    <h2 className="fw-bold mb-1">My Tour Packages</h2>
                    <p className="text-muted mb-0">Manage your guided tours, itineraries, and pricing.</p>
                </div>
                <Button variant="primary" className="px-4 py-2 rounded-pill shadow-sm fw-medium" onClick={() => handleShowModal()}>
                    + Add New Package
                </Button>
            </div>

            {error && <Alert variant="danger" className="shadow-sm rounded-3">{error}</Alert>}

            {/* Main Table Card */}
            <Card className="shadow-sm border-0 rounded-4 overflow-hidden">
                <Table responsive hover className="mb-0 align-middle">
                    <thead className="bg-light text-secondary border-bottom">
                        <tr>
                            <th className="py-3 px-4 fw-semibold border-0">Package Title</th>
                            <th className="py-3 fw-semibold border-0">Destination</th>
                            <th className="py-3 fw-semibold border-0">Duration</th>
                            <th className="py-3 fw-semibold border-0">Total Price</th>
                            <th className="py-3 fw-semibold border-0">Status</th>
                            <th className="py-3 px-4 text-end fw-semibold border-0">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {packages.map(pkg => (
                            <tr key={pkg.id}>
                                <td className="px-4">
                                    <span className="fw-bold text-dark fs-6">{pkg.title}</span>
                                </td>
                                <td>
                                    <span className="text-muted">📍 {pkg.destination_name}</span>
                                </td>
                                <td>
                                    <span className="fw-medium">{pkg.duration_days} Days</span>
                                </td>
                                <td>
                                    <span className="fw-semibold text-success">${parseFloat(pkg.total_price).toFixed(2)}</span>
                                </td>
                                <td>
                                    {pkg.is_active ? 
                                        <Badge bg="success" className="px-3 py-2 rounded-pill fw-medium">Active</Badge> : 
                                        <Badge bg="secondary" className="px-3 py-2 rounded-pill fw-medium">Inactive</Badge>
                                    }
                                </td>
                                <td className="px-4 text-end">
                                    <Button variant="outline-primary" size="sm" className="me-2 rounded-3 px-3" onClick={() => handleShowModal(pkg)}>
                                        Edit
                                    </Button>
                                    <Button variant="outline-danger" size="sm" className="rounded-3 px-3" onClick={() => handleDelete(pkg.id)}>
                                        Delete
                                    </Button>
                                </td>
                            </tr>
                        ))}
                        {packages.length === 0 && (
                            <tr>
                                <td colSpan="6" className="text-center py-5">
                                    <div className="text-muted">
                                        <div className="fs-1 mb-3">✈️</div>
                                        <h5 className="fw-semibold text-dark">No tour packages found</h5>
                                        <p>Create your first package to start receiving bookings.</p>
                                        <Button variant="outline-primary" className="mt-2 rounded-pill px-4" onClick={() => handleShowModal()}>
                                            Create Package Now
                                        </Button>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </Table>
            </Card>

            {/* Unified Create/Edit Modal */}
            <Modal show={showModal} onHide={handleCloseModal} size="lg" centered backdrop="static">
                <Modal.Header closeButton className="bg-light border-bottom-0 pb-3">
                    <Modal.Title className="fw-bold">
                        {editingId ? 'Edit Package Details' : 'Add New Package'}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body className="px-4 pt-2 pb-4">
                    <Form onSubmit={handleSubmit}>
                        <Row className="mb-3">
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label className="fw-medium text-secondary">Package Title</Form.Label>
                                    <Form.Control 
                                        type="text" 
                                        name="title" 
                                        placeholder="e.g. 7-Day Alpine Retreat" 
                                        value={formData.title} 
                                        onChange={handleChange} 
                                        required 
                                        className="shadow-none rounded-3 py-2"
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label className="fw-medium text-secondary">Destination Location</Form.Label>
                                    <Form.Select 
                                        name="destination" 
                                        value={formData.destination} 
                                        onChange={handleChange} 
                                        required
                                        className="shadow-none rounded-3 py-2"
                                    >
                                        <option value="">Select a City...</option>
                                        {destinations.map(dest => (
                                            <option key={dest.id} value={dest.id}>{dest.name}, {dest.country}</option>
                                        ))}
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                        </Row>

                        <Form.Group className="mb-4">
                            <Form.Label className="fw-medium text-secondary">Description / Itinerary</Form.Label>
                            <Form.Control 
                                as="textarea" 
                                rows={4} 
                                name="description" 
                                placeholder="Outline the daily schedule, inclusions, and key highlights..." 
                                value={formData.description} 
                                onChange={handleChange} 
                                required 
                                className="shadow-none rounded-3"
                            />
                        </Form.Group>

                        <Row className="mb-4 align-items-center bg-light p-3 rounded-4 mx-0">
                            <Col md={4}>
                                <Form.Group>
                                    <Form.Label className="fw-medium text-secondary">Duration (Days)</Form.Label>
                                    <Form.Control 
                                        type="number" 
                                        min="1" 
                                        step="1" 
                                        name="duration_days" 
                                        placeholder="e.g. 5" 
                                        value={formData.duration_days} 
                                        onChange={handleChange} 
                                        required 
                                        className="shadow-none rounded-3"
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={4}>
                                <Form.Group>
                                    <Form.Label className="fw-medium text-secondary">Total Flat Price ($)</Form.Label>
                                    <Form.Control 
                                        type="number" 
                                        min="0" 
                                        step="0.01" 
                                        name="total_price" 
                                        placeholder="0.00" 
                                        value={formData.total_price} 
                                        onChange={handleChange} 
                                        required 
                                        className="shadow-none rounded-3"
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={4} className="d-flex justify-content-md-end mt-3 mt-md-0 pt-md-4">
                                <Form.Check 
                                    type="switch" 
                                    id="pkg_is_active" 
                                    name="is_active" 
                                    label="Listing is Active" 
                                    checked={formData.is_active} 
                                    onChange={handleChange}
                                    className="fw-medium text-dark"
                                />
                            </Col>
                        </Row>

                        <div className="d-flex justify-content-end gap-3 mt-4 border-top pt-3">
                            <Button variant="light" className="px-4 rounded-pill fw-medium" onClick={handleCloseModal}>
                                Cancel
                            </Button>
                            <Button variant="primary" type="submit" disabled={isSubmitting} className="px-4 rounded-pill fw-medium shadow-sm">
                                {isSubmitting ? (
                                    <><Spinner size="sm" animation="border" className="me-2" /> Saving...</>
                                ) : 'Save Package'}
                            </Button>
                        </div>
                    </Form>
                </Modal.Body>
            </Modal>
        </div>
    );
};

export default ManagerPackages;