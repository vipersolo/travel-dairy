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

    if (isLoading) return <Spinner animation="border" className="d-block mx-auto mt-5" />;

    return (
        <div>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>My Tour Packages</h2>
                <Button variant="primary" onClick={() => handleShowModal()}>+ Add New Package</Button>
            </div>

            {error && <Alert variant="danger">{error}</Alert>}

            <Card className="shadow-sm border-0">
                <Table responsive hover className="mb-0">
                    <thead className="bg-light">
                        <tr>
                            <th>Package Title</th>
                            <th>Destination</th>
                            <th>Duration (Days)</th>
                            <th>Total Price</th>
                            <th>Status</th>
                            <th className="text-end">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {packages.map(pkg => (
                            <tr key={pkg.id} className="align-middle">
                                <td><strong>{pkg.title}</strong></td>
                                <td>{pkg.destination_name}</td>
                                <td>{pkg.duration_days} Days</td>
                                <td>${parseFloat(pkg.total_price).toFixed(2)}</td>
                                <td>
                                    {pkg.is_active ? <Badge bg="success">Active</Badge> : <Badge bg="secondary">Inactive</Badge>}
                                </td>
                                <td className="text-end">
                                    <Button variant="outline-primary" size="sm" className="me-2" onClick={() => handleShowModal(pkg)}>
                                        Edit
                                    </Button>
                                    <Button variant="outline-danger" size="sm" onClick={() => handleDelete(pkg.id)}>
                                        Delete
                                    </Button>
                                </td>
                            </tr>
                        ))}
                        {packages.length === 0 && (
                            <tr>
                                <td colSpan="6" className="text-center py-4 text-muted">
                                    No tour packages found. Create your first package to start receiving bookings.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </Table>
            </Card>

            {/* Unified Create/Edit Modal */}
            <Modal show={showModal} onHide={handleCloseModal} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>{editingId ? 'Edit Package' : 'Add New Package'}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={handleSubmit}>
                        <Row className="mb-3">
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label>Package Title</Form.Label>
                                    <Form.Control type="text" name="title" value={formData.title} onChange={handleChange} required />
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
                            <Form.Label>Description / Itinerary</Form.Label>
                            <Form.Control as="textarea" rows={4} name="description" value={formData.description} onChange={handleChange} required />
                        </Form.Group>

                        <Row className="mb-4">
                            <Col md={4}>
                                <Form.Group>
                                    <Form.Label>Duration (Days)</Form.Label>
                                    <Form.Control type="number" min="1" step="1" name="duration_days" value={formData.duration_days} onChange={handleChange} required />
                                </Form.Group>
                            </Col>
                            <Col md={4}>
                                <Form.Group>
                                    <Form.Label>Total Flat Price ($)</Form.Label>
                                    <Form.Control type="number" min="0" step="0.01" name="total_price" value={formData.total_price} onChange={handleChange} required />
                                </Form.Group>
                            </Col>
                            <Col md={4} className="d-flex align-items-end pb-2">
                                <Form.Check type="checkbox" id="pkg_is_active" name="is_active" label="Listing is Active" checked={formData.is_active} onChange={handleChange} />
                            </Col>
                        </Row>

                        <div className="d-flex justify-content-end gap-2">
                            <Button variant="secondary" onClick={handleCloseModal}>Cancel</Button>
                            <Button variant="primary" type="submit" disabled={isSubmitting}>
                                {isSubmitting ? <Spinner size="sm" animation="border" /> : 'Save Package'}
                            </Button>
                        </div>
                    </Form>
                </Modal.Body>
            </Modal>
        </div>
    );
};

export default ManagerPackages;