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

    if (isLoading) return <Spinner animation="border" className="d-block mx-auto mt-5" />;

    return (
        <div>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>My Hotel Inventory</h2>
                <Button variant="primary" onClick={() => handleShowModal()}>+ Add New Hotel</Button>
            </div>

            {error && <Alert variant="danger">{error}</Alert>}

            <Card className="shadow-sm border-0">
                <Table responsive hover className="mb-0">
                    <thead className="bg-light">
                        <tr>
                            <th>Property Name</th>
                            <th>Destination</th>
                            <th>Price / Night</th>
                            <th>Rating</th>
                            <th>Status</th>
                            <th className="text-end">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {accommodations.map(acc => (
                            <tr key={acc.id} className="align-middle">
                                <td><strong>{acc.name}</strong></td>
                                <td>{acc.destination_name}</td>
                                <td>${parseFloat(acc.price_per_night).toFixed(2)}</td>
                                <td>{acc.star_rating} ⭐</td>
                                <td>
                                    {acc.is_active ? <Badge bg="success">Active</Badge> : <Badge bg="secondary">Inactive</Badge>}
                                </td>
                                <td className="text-end">
                                    <Button variant="outline-primary" size="sm" className="me-2" onClick={() => handleShowModal(acc)}>
                                        Edit
                                    </Button>
                                    <Button variant="outline-danger" size="sm" onClick={() => handleDelete(acc.id)}>
                                        Delete
                                    </Button>
                                </td>
                            </tr>
                        ))}
                        {accommodations.length === 0 && (
                            <tr>
                                <td colSpan="6" className="text-center py-4 text-muted">
                                    No properties found. Add your first hotel to start receiving bookings.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </Table>
            </Card>

            {/* Unified Create/Edit Modal */}
            <Modal show={showModal} onHide={handleCloseModal} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>{editingId ? 'Edit Property' : 'Add New Property'}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={handleSubmit}>
                        <Row className="mb-3">
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label>Property Name</Form.Label>
                                    <Form.Control type="text" name="name" value={formData.name} onChange={handleChange} required />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label>Destination Location</Form.Label>
                                    <Form.Select name="destination" value={formData.destination} onChange={handleChange} required>
                                        <option value="">Select a City...</option>
                                        {destinations.map(dest => (
                                            <option key={dest.id} value={dest.id}>{dest.name}, {dest.country}</option>
                                        ))}
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                        </Row>

                        <Form.Group className="mb-3">
                            <Form.Label>Full Address</Form.Label>
                            <Form.Control as="textarea" rows={2} name="address" value={formData.address} onChange={handleChange} required />
                        </Form.Group>

                        <Row className="mb-4">
                            <Col md={4}>
                                <Form.Group>
                                    <Form.Label>Price per Night ($)</Form.Label>
                                    <Form.Control type="number" step="0.01" name="price_per_night" value={formData.price_per_night} onChange={handleChange} required />
                                </Form.Group>
                            </Col>
                            <Col md={4}>
                                <Form.Group>
                                    <Form.Label>Star Rating</Form.Label>
                                    <Form.Select name="star_rating" value={formData.star_rating} onChange={handleChange}>
                                        {[1, 2, 3, 4, 5].map(num => <option key={num} value={num}>{num} Stars</option>)}
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                            <Col md={4} className="d-flex align-items-end pb-2">
                                <Form.Check type="checkbox" id="is_active" name="is_active" label="Listing is Active" checked={formData.is_active} onChange={handleChange} />
                            </Col>
                        </Row>

                        <div className="d-flex justify-content-end gap-2">
                            <Button variant="secondary" onClick={handleCloseModal}>Cancel</Button>
                            <Button variant="primary" type="submit" disabled={isSubmitting}>
                                {isSubmitting ? <Spinner size="sm" animation="border" /> : 'Save Property'}
                            </Button>
                        </div>
                    </Form>
                </Modal.Body>
            </Modal>
        </div>
    );
};

export default ManagerAccommodations;