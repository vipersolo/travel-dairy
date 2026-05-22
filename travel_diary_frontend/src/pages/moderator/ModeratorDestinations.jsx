import { useState, useEffect } from 'react';
import {
    Container,
    Card,
    Table,
    Button,
    Modal,
    Form,
    Spinner,
    Row,
    Col,
    Image,
} from 'react-bootstrap';

import api from '../../services/api';

const ModeratorDestinations = () => {
    const [destinations, setDestinations] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    // Modal State
    const [showModal, setShowModal] = useState(false);

    // Edit State
    const [isEditMode, setIsEditMode] = useState(false);
    const [selectedDestination, setSelectedDestination] = useState(null);

    // Form State
    const [name, setName] = useState('');
    const [country, setCountry] = useState('');
    const [description, setDescription] = useState('');
    const [bestTime, setBestTime] = useState('');
    const [latitude, setLatitude] = useState('');
    const [longitude, setLongitude] = useState('');
    const [image, setImage] = useState(null);

    // UI State
    const [preview, setPreview] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchDestinations();
    }, []);

    const fetchDestinations = async () => {
        try {
            const response = await api.get('travel/destinations/');
            setDestinations(response.data);
        } catch (err) {
            console.error(err);
            setError('Failed to load destinations.');
        } finally {
            setIsLoading(false);
        }
    };

    const resetForm = () => {
        setName('');
        setCountry('');
        setDescription('');
        setBestTime('');
        setLatitude('');
        setLongitude('');
        setImage(null);
        setPreview(null);
        setError('');

        setIsEditMode(false);
        setSelectedDestination(null);
    };

    const handleClose = () => {
        setShowModal(false);
        resetForm();
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];

        if (file) {
            setImage(file);
            setPreview(URL.createObjectURL(file));
        }
    };

    const handleEdit = (destination) => {
        setIsEditMode(true);
        setSelectedDestination(destination);

        setName(destination.name || '');
        setCountry(destination.country || '');
        setDescription(destination.description || '');
        setBestTime(destination.best_time_to_visit || '');
        setLatitude(destination.latitude || '');
        setLongitude(destination.longitude || '');

        setPreview(destination.image || null);
        setImage(null);

        setShowModal(true);
    };

    const handleDelete = async (id) => {
        const confirmDelete = window.confirm(
            'Are you sure you want to delete this destination?'
        );

        if (!confirmDelete) return;

        try {
            await api.delete(`travel/destinations/${id}/`);

            setDestinations((prev) =>
                prev.filter((dest) => dest.id !== id)
            );

        } catch (err) {
            console.error(err);
            alert('Failed to delete destination.');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        setIsSubmitting(true);
        setError('');

        try {
            const formData = new FormData();

            formData.append('name', name);
            formData.append('country', country);
            formData.append('description', description);
            formData.append('best_time_to_visit', bestTime);
            formData.append('latitude', latitude);
            formData.append('longitude', longitude);

            if (image) {
                formData.append('image', image);
            }

            if (isEditMode && selectedDestination) {
                await api.put(
                    `travel/destinations/${selectedDestination.id}/`,
                    formData,
                    {
                        headers: {
                            'Content-Type': 'multipart/form-data',
                        },
                    }
                );
            } else {
                await api.post(
                    'travel/destinations/',
                    formData,
                    {
                        headers: {
                            'Content-Type': 'multipart/form-data',
                        },
                    }
                );
            }

            fetchDestinations();
            handleClose();

        } catch (err) {
            console.error(err);

            if (err.response?.data) {
                console.log(err.response.data);
            }

            setError(
                `Failed to ${
                    isEditMode ? 'update' : 'create'
                } destination.`
            );

        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <div className="text-center mt-5">
                <Spinner animation="border" />
            </div>
        );
    }

    return (
        <Container fluid className="px-0">
            {/* Header */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2 className="fw-bold mb-1">
                        Master Destinations
                    </h2>

                    <p className="text-muted mb-0">
                        Manage all available travel destinations
                    </p>
                </div>

                <Button
                    variant="primary"
                    onClick={() => {
                        resetForm();
                        setShowModal(true);
                    }}
                >
                    + Add Destination
                </Button>
            </div>

            {/* Table */}
            <Card className="border-0 shadow-sm">
                <Card.Body className="p-0">
                    <Table responsive hover className="mb-0 align-middle">
                        <thead className="table-light">
                            <tr>
                                <th>Image</th>
                                <th>Destination</th>
                                <th>Country</th>
                                <th>Best Time</th>
                                <th>Latitude</th>
                                <th>Longitude</th>
                                <th>Actions</th>
                            </tr>
                        </thead>

                        <tbody>
                            {destinations.length > 0 ? (
                                destinations.map((dest) => (
                                    <tr key={dest.id}>
                                        <td>
                                            {dest.image ? (
                                                <Image
                                                    src={dest.image}
                                                    alt={dest.name}
                                                    rounded
                                                    style={{
                                                        width: '80px',
                                                        height: '55px',
                                                        objectFit: 'cover',
                                                    }}
                                                />
                                            ) : (
                                                <span className="text-muted small">
                                                    No Image
                                                </span>
                                            )}
                                        </td>

                                        <td>
                                            <strong>{dest.name}</strong>
                                        </td>

                                        <td>{dest.country}</td>

                                        <td>
                                            {dest.best_time_to_visit}
                                        </td>

                                        <td>{dest.latitude}</td>

                                        <td>{dest.longitude}</td>

                                        <td>
                                            <div className="d-flex gap-2">
                                                <Button
                                                    size="sm"
                                                    variant="warning"
                                                    onClick={() =>
                                                        handleEdit(dest)
                                                    }
                                                >
                                                    Edit
                                                </Button>

                                                <Button
                                                    size="sm"
                                                    variant="danger"
                                                    onClick={() =>
                                                        handleDelete(dest.id)
                                                    }
                                                >
                                                    Delete
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td
                                        colSpan="7"
                                        className="text-center py-4 text-muted"
                                    >
                                        No destinations found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </Table>
                </Card.Body>
            </Card>

            {/* Modal */}
            <Modal
                show={showModal}
                onHide={handleClose}
                centered
                size="lg"
            >
                <Modal.Header closeButton>
                    <Modal.Title>
                        {isEditMode
                            ? 'Edit Destination'
                            : 'Create New Destination'}
                    </Modal.Title>
                </Modal.Header>

                <Modal.Body>
                    {error && (
                        <div className="alert alert-danger">
                            {error}
                        </div>
                    )}

                    <Form onSubmit={handleSubmit}>
                        {/* Name & Country */}
                        <Row className="mb-3">
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label>
                                        Destination Name
                                    </Form.Label>

                                    <Form.Control
                                        type="text"
                                        placeholder="Enter destination name"
                                        value={name}
                                        onChange={(e) =>
                                            setName(e.target.value)
                                        }
                                        required
                                    />
                                </Form.Group>
                            </Col>

                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label>Country</Form.Label>

                                    <Form.Control
                                        type="text"
                                        placeholder="Enter country"
                                        value={country}
                                        onChange={(e) =>
                                            setCountry(e.target.value)
                                        }
                                        required
                                    />
                                </Form.Group>
                            </Col>
                        </Row>

                        {/* Description */}
                        <Form.Group className="mb-3">
                            <Form.Label>Description</Form.Label>

                            <Form.Control
                                as="textarea"
                                rows={4}
                                placeholder="Enter destination description"
                                value={description}
                                onChange={(e) =>
                                    setDescription(e.target.value)
                                }
                                required
                            />
                        </Form.Group>

                        {/* Best Time */}
                        <Row className="mb-3">
                            <Col md={12}>
                                <Form.Group>
                                    <Form.Label>
                                        Best Time to Visit
                                    </Form.Label>

                                    <Form.Control
                                        type="text"
                                        placeholder="Example: October to February"
                                        value={bestTime}
                                        onChange={(e) =>
                                            setBestTime(e.target.value)
                                        }
                                        required
                                    />
                                </Form.Group>
                            </Col>
                        </Row>

                        {/* Latitude & Longitude */}
                        <Row className="mb-3">
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label>Latitude</Form.Label>

                                    <Form.Control
                                        type="number"
                                        step="any"
                                        placeholder="Example: 11.2588"
                                        value={latitude}
                                        onChange={(e) =>
                                            setLatitude(e.target.value)
                                        }
                                        required
                                    />
                                </Form.Group>
                            </Col>

                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label>Longitude</Form.Label>

                                    <Form.Control
                                        type="number"
                                        step="any"
                                        placeholder="Example: 75.7804"
                                        value={longitude}
                                        onChange={(e) =>
                                            setLongitude(e.target.value)
                                        }
                                        required
                                    />
                                </Form.Group>
                            </Col>
                        </Row>

                        {/* Image Upload */}
                        <Form.Group className="mb-4">
                            <Form.Label>
                                Destination Image
                            </Form.Label>

                            <Form.Control
                                type="file"
                                accept="image/*"
                                onChange={handleImageChange}
                            />

                            {preview && (
                                <div className="mt-3 text-center">
                                    <Image
                                        src={preview}
                                        alt="Preview"
                                        rounded
                                        fluid
                                        style={{
                                            maxHeight: '220px',
                                            objectFit: 'cover',
                                        }}
                                    />
                                </div>
                            )}
                        </Form.Group>

                        {/* Submit */}
                        <Button
                            type="submit"
                            variant="primary"
                            className="w-100"
                            disabled={isSubmitting}
                        >
                            {isSubmitting
                                ? isEditMode
                                    ? 'Updating Destination...'
                                    : 'Saving Destination...'
                                : isEditMode
                                ? 'Update Destination'
                                : 'Save Destination'}
                        </Button>
                    </Form>
                </Modal.Body>
            </Modal>
        </Container>
    );
};

export default ModeratorDestinations;