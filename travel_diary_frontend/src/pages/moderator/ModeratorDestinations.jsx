import { useState, useEffect } from 'react';
import { Container, Card, Table, Button, Modal, Form, Spinner, Alert } from 'react-bootstrap';
import api from '../../services/api';

const ModeratorDestinations = () => {
    const [destinations, setDestinations] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    
    // Form State
    const [name, setName] = useState('');
    const [country, setCountry] = useState('');
    const [description, setDescription] = useState('');
    const [bestTime, setBestTime] = useState('');
    const [image, setImage] = useState(null); // Holds the file object
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        fetchDestinations();
    }, []);

    const fetchDestinations = async () => {
        try {
            const response = await api.get('travel/destinations/');
            setDestinations(response.data);
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        // 1. Create a FormData object (Required for Image Uploads)
        const formData = new FormData();
        formData.append('name', name);
        formData.append('country', country);
        formData.append('description', description);
        formData.append('best_time_to_visit', bestTime);
        
        // Only append the image if the user actually selected one
        if (image) {
            formData.append('image', image);
        }

        try {
            // 2. We must override the default JSON headers to multipart/form-data
            await api.post('travel/destinations/', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            
            setShowModal(false);
            fetchDestinations(); // Refresh the list
            
            // Reset form
            setName(''); setCountry(''); setDescription(''); setBestTime(''); setImage(null);
        } catch (err) {
            alert("Failed to create destination. Ensure the name is unique.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) return <Spinner animation="border" className="d-block mx-auto mt-5" />;

    return (
        <Container fluid className="px-0">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>Master Destinations List</h2>
                <Button variant="primary" onClick={() => setShowModal(true)}>+ Add Destination</Button>
            </div>

            <Card className="shadow-sm border-0">
                <Table responsive hover className="mb-0 align-middle">
                    <thead className="bg-light">
                        <tr>
                            <th>Image</th>
                            <th>Destination</th>
                            <th>Country</th>
                            <th>Best Time</th>
                        </tr>
                    </thead>
                    <tbody>
                        {destinations.map((dest) => (
                            <tr key={dest.id}>
                                <td>
                                    {dest.image ? (
                                        <img src={dest.image} alt={dest.name} style={{ width: '60px', height: '40px', objectFit: 'cover', borderRadius: '4px' }} />
                                    ) : (
                                        <span className="text-muted small">No Image</span>
                                    )}
                                </td>
                                <td><strong>{dest.name}</strong></td>
                                <td>{dest.country}</td>
                                <td>{dest.best_time_to_visit}</td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            </Card>

            {/* Create Destination Modal */}
            <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>Create New Destination</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={handleSubmit}>
                        <div className="row mb-3">
                            <div className="col-md-6">
                                <Form.Group>
                                    <Form.Label>City / Region Name</Form.Label>
                                    <Form.Control type="text" required value={name} onChange={e => setName(e.target.value)} />
                                </Form.Group>
                            </div>
                            <div className="col-md-6">
                                <Form.Group>
                                    <Form.Label>Country</Form.Label>
                                    <Form.Control type="text" required value={country} onChange={e => setCountry(e.target.value)} />
                                </Form.Group>
                            </div>
                        </div>

                        <Form.Group className="mb-3">
                            <Form.Label>Description</Form.Label>
                            <Form.Control as="textarea" rows={3} required value={description} onChange={e => setDescription(e.target.value)} />
                        </Form.Group>

                        <div className="row mb-4">
                            <div className="col-md-6">
                                <Form.Group>
                                    <Form.Label>Best Time to Visit</Form.Label>
                                    <Form.Control type="text" placeholder="e.g., May to September" required value={bestTime} onChange={e => setBestTime(e.target.value)} />
                                </Form.Group>
                            </div>
                            <div className="col-md-6">
                                <Form.Group>
                                    <Form.Label>Hero Image</Form.Label>
                                    {/* Notice type="file" and the onChange event using e.target.files[0] */}
                                    <Form.Control type="file" accept="image/*" onChange={e => setImage(e.target.files[0])} />
                                </Form.Group>
                            </div>
                        </div>

                        <Button type="submit" variant="primary" className="w-100" disabled={isSubmitting}>
                            {isSubmitting ? 'Uploading...' : 'Save Destination'}
                        </Button>
                    </Form>
                </Modal.Body>
            </Modal>
        </Container>
    );
};

export default ModeratorDestinations;