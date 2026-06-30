import { useState, useEffect } from 'react';
import { Row, Col, Card, Table, Button, Modal, Form, Spinner, Alert, Badge } from 'react-bootstrap';
import api from '../../services/api';

const ManagerAccommodations = () => {
    const [accommodations, setAccommodations] = useState([]);
    const [destinations, setDestinations] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // Modal & Form State
    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState(null); // Null means "Create Mode", an ID means "Edit Mode"
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const [formData, setFormData] = useState({
        name: '',
        destination: '',
        address: '',
        price_per_night: '',
        star_rating: 3,
        is_active: true
    });

    // Fetch initial data
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [accRes, destRes] = await Promise.all([
                    api.get('travel/accommodations/?my_listings=true'),
                    api.get('travel/destinations/')
                ]);
                setAccommodations(accRes.data);
                setDestinations(destRes.data);
            } catch (err) {
                setError('Failed to load your accommodations.');
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);

    // Form Handlers
    const handleShowModal = (acc = null) => {
        if (acc) {
            // Edit Mode: Populate the form
            setEditingId(acc.id);
            setFormData({
                name: acc.name,
                destination: acc.destination,
                address: acc.address,
                price_per_night: acc.price_per_night,
                star_rating: acc.star_rating,
                is_active: acc.is_active
            });
        } else {
            // Create Mode: Clear the form
            setEditingId(null);
            setFormData({ name: '', destination: '', address: '', price_per_night: '', star_rating: 3, is_active: true });
        }
        setShowModal(true);
    };

    const handleCloseModal = () => setShowModal(false);

    const handleChange = (e) => {
        const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
        setFormData({ ...formData, [e.target.name]: value });
    };

    // Unified Submit Handler (Handles both POST and PUT)
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);

        try {
            if (editingId) {
                // UPDATE existing record
                const response = await api.put(`travel/accommodations/${editingId}/`, formData);
                setAccommodations(accommodations.map(a => a.id === editingId ? response.data : a));
            } else {
                // CREATE new record
                const response = await api.post('travel/accommodations/', formData);
                setAccommodations([...accommodations, response.data]);
            }
            handleCloseModal();
        } catch (err) {
            setError(err.response?.data?.detail || 'Failed to save accommodation.');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Delete Handler
    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this property? This cannot be undone.')) return;
        
        try {
            await api.delete(`travel/accommodations/${id}/`);
            setAccommodations(accommodations.filter(a => a.id !== id));
        } catch (err) {
            alert('Failed to delete property. It may have active bookings.');
        }
    };

    // Improved Full-Screen Loading State
    if (isLoading) return (
        <div className="d-flex flex-column justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
            <Spinner animation="border" variant="primary" className="mb-3" />
            <h5 className="text-muted">Loading your inventory...</h5>
        </div>
    );

    return (
        <div className="py-3">
            {/* Header Section */}
            <div className="d-flex justify-content-between align-items-end mb-4">
                <div>
                    <h2 className="fw-bold mb-1">My Hotel Inventory</h2>
                    <p className="text-muted mb-0">Manage your property listings, pricing, and details.</p>
                </div>
                <Button variant="primary" className="px-4 py-2 rounded-pill shadow-sm fw-medium" onClick={() => handleShowModal()}>
                    + Add New Hotel
                </Button>
            </div>

            {error && <Alert variant="danger" className="shadow-sm rounded-3">{error}</Alert>}

            {/* Main Table Card */}
            <Card className="shadow-sm border-0 rounded-4 overflow-hidden">
                <Table responsive hover className="mb-0 align-middle">
                    <thead className="bg-light text-secondary border-bottom">
                        <tr>
                            <th className="py-3 px-4 fw-semibold border-0">Property Name</th>
                            <th className="py-3 fw-semibold border-0">Destination</th>
                            <th className="py-3 fw-semibold border-0">Price / Night</th>
                            <th className="py-3 fw-semibold border-0">Rating</th>
                            <th className="py-3 fw-semibold border-0">Status</th>
                            <th className="py-3 px-4 text-end fw-semibold border-0">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {accommodations.map(acc => (
                            <tr key={acc.id}>
                                <td className="px-4">
                                    <span className="fw-bold text-dark fs-6">{acc.name}</span>
                                </td>
                                <td>
                                    <span className="text-muted">📍 {acc.destination_name}</span>
                                </td>
                                <td>
                                    <span className="fw-semibold text-success">${parseFloat(acc.price_per_night).toFixed(2)}</span>
                                </td>
                                <td>
                                    <span className="text-warning fs-5">{'★'.repeat(acc.star_rating)}</span>
                                    <span className="text-light fs-5">{'★'.repeat(5 - acc.star_rating)}</span>
                                </td>
                                <td>
                                    {acc.is_active ? 
                                        <Badge bg="success" className="px-3 py-2 rounded-pill fw-medium">Active</Badge> : 
                                        <Badge bg="secondary" className="px-3 py-2 rounded-pill fw-medium">Inactive</Badge>
                                    }
                                </td>
                                <td className="px-4 text-end">
                                    <Button variant="outline-primary" size="sm" className="me-2 rounded-3 px-3" onClick={() => handleShowModal(acc)}>
                                        Edit
                                    </Button>
                                    <Button variant="outline-danger" size="sm" className="rounded-3 px-3" onClick={() => handleDelete(acc.id)}>
                                        Delete
                                    </Button>
                                </td>
                            </tr>
                        ))}
                        {accommodations.length === 0 && (
                            <tr>
                                <td colSpan="6" className="text-center py-5">
                                    <div className="text-muted">
                                        <div className="fs-1 mb-3">🏨</div>
                                        <h5 className="fw-semibold text-dark">No properties found</h5>
                                        <p>Add your first hotel to start receiving bookings.</p>
                                        <Button variant="outline-primary" className="mt-2 rounded-pill px-4" onClick={() => handleShowModal()}>
                                            Add Property Now
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
                        {editingId ? 'Edit Property Details' : 'Add New Property'}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body className="px-4 pt-2 pb-4">
                    <Form onSubmit={handleSubmit}>
                        <Row className="mb-3">
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label className="fw-medium text-secondary">Property Name</Form.Label>
                                    <Form.Control 
                                        type="text" 
                                        name="name" 
                                        placeholder="e.g. Oceanview Resort" 
                                        value={formData.name} 
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
                            <Form.Label className="fw-medium text-secondary">Full Address</Form.Label>
                            <Form.Control 
                                as="textarea" 
                                rows={2} 
                                name="address" 
                                placeholder="Street address, neighborhood, zip code..." 
                                value={formData.address} 
                                onChange={handleChange} 
                                required 
                                className="shadow-none rounded-3"
                            />
                        </Form.Group>

                        <Row className="mb-4 align-items-center bg-light p-3 rounded-4 mx-0">
                            <Col md={4}>
                                <Form.Group>
                                    <Form.Label className="fw-medium text-secondary">Price per Night ($)</Form.Label>
                                    <Form.Control 
                                        type="number" 
                                        step="0.01" 
                                        name="price_per_night" 
                                        placeholder="0.00" 
                                        value={formData.price_per_night} 
                                        onChange={handleChange} 
                                        required 
                                        className="shadow-none rounded-3"
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={4}>
                                <Form.Group>
                                    <Form.Label className="fw-medium text-secondary">Star Rating</Form.Label>
                                    <Form.Select 
                                        name="star_rating" 
                                        value={formData.star_rating} 
                                        onChange={handleChange}
                                        className="shadow-none rounded-3"
                                    >
                                        {[1, 2, 3, 4, 5].map(num => <option key={num} value={num}>{num} Stars</option>)}
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                            <Col md={4} className="d-flex justify-content-md-end mt-3 mt-md-0 pt-md-4">
                                <Form.Check 
                                    type="switch" 
                                    id="is_active" 
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
                                ) : 'Save Property'}
                            </Button>
                        </div>
                    </Form>
                </Modal.Body>
            </Modal>
        </div>
    );
};

export default ManagerAccommodations;