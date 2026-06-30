import { useState, useEffect } from 'react';
import { Container, Card, Table, Badge, Button, Spinner, Alert } from 'react-bootstrap';
import api from '../../services/api';

const ModeratorVerification = () => {
    const [managers, setManagers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [processingId, setProcessingId] = useState(null);

    useEffect(() => {
        const fetchManagers = async () => {
            try {
                // Hitting the new secure Moderator endpoint
                const response = await api.get('users/moderator/managers/');
                setManagers(response.data);
            } catch (err) {
                setError('Failed to load business accounts.');
            } finally {
                setIsLoading(false);
            }
        };
        fetchManagers();
    }, []);

    const handleToggleVerification = async (managerId) => {
        setProcessingId(managerId);
        try {
            const response = await api.post(`users/moderator/managers/${managerId}/toggle_verification/`);
            
            // Optimistic UI Update: Flip the state in the local array immediately
            setManagers(managers.map(manager => 
                manager.id === managerId 
                    ? { ...manager, is_verified: response.data.is_verified } 
                    : manager
            ));
        } catch (err) {
            alert('Failed to update verification status. Please try again.');
        } finally {
            setProcessingId(null);
        }
    };

    // Improved Loading State
    if (isLoading) {
        return (
            <Container fluid className="d-flex flex-column justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
                <Spinner animation="border" variant="primary" className="mb-3" />
                <h5 className="text-muted fw-normal">Loading business queue...</h5>
            </Container>
        );
    }

    return (
        <Container fluid className="px-4 py-4">
            {/* Header Section */}
            <div className="mb-4">
                <h2 className="fw-bold mb-1">Business Verification Queue</h2>
                <p className="text-secondary">
                    Review newly registered business accounts. Managers cannot list inventory until they are verified.
                </p>
            </div>

            {/* Error Handling */}
            {error && (
                <Alert variant="danger" className="shadow-sm rounded-3">
                    <strong>Error:</strong> {error}
                </Alert>
            )}

            {/* Main Content Card */}
            <Card className="shadow-sm border-0 rounded-3 overflow-hidden">
                <Table responsive hover className="mb-0">
                    <thead className="bg-light border-bottom">
                        <tr>
                            <th className="text-uppercase text-secondary fw-semibold py-3" style={{ fontSize: '0.85rem' }}>ID</th>
                            <th className="text-uppercase text-secondary fw-semibold py-3" style={{ fontSize: '0.85rem' }}>Company Name</th>
                            <th className="text-uppercase text-secondary fw-semibold py-3" style={{ fontSize: '0.85rem' }}>Manager Email</th>
                            <th className="text-uppercase text-secondary fw-semibold py-3" style={{ fontSize: '0.85rem' }}>Registration Date</th>
                            <th className="text-uppercase text-secondary fw-semibold py-3" style={{ fontSize: '0.85rem' }}>Status</th>
                            <th className="text-uppercase text-secondary fw-semibold py-3 text-end" style={{ fontSize: '0.85rem' }}>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {managers.map((manager) => (
                            <tr key={manager.id} className="align-middle">
                                <td className="py-3">
                                    <span className="text-secondary fw-medium">#{manager.id}</span>
                                </td>
                                <td className="py-3">
                                    <strong className="text-dark">{manager.company_name}</strong>
                                </td>
                                <td className="py-3 text-muted">
                                    {manager.email}
                                </td>
                                <td className="py-3 text-muted">
                                    {new Date(manager.date_joined).toLocaleDateString(undefined, {
                                        year: 'numeric',
                                        month: 'short',
                                        day: 'numeric'
                                    })}
                                </td>
                                <td className="py-3">
                                    {manager.is_verified ? (
                                        <Badge bg="success" pill className="px-3 py-2 fw-normal">Verified</Badge>
                                    ) : (
                                        <Badge bg="warning" text="dark" pill className="px-3 py-2 fw-normal">Pending Review</Badge>
                                    )}
                                </td>
                                <td className="py-3 text-end">
                                    <Button 
                                        variant={manager.is_verified ? "outline-danger" : "primary"} 
                                        size="sm"
                                        className="rounded-pill px-3"
                                        style={{ minWidth: '130px' }}
                                        onClick={() => handleToggleVerification(manager.id)}
                                        disabled={processingId === manager.id}
                                    >
                                        {processingId === manager.id ? (
                                            <>
                                                <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2" />
                                                Processing...
                                            </>
                                        ) : manager.is_verified ? (
                                            'Revoke Access'
                                        ) : (
                                            'Approve Business'
                                        )}
                                    </Button>
                                </td>
                            </tr>
                        ))}

                        {/* Improved Empty State */}
                        {managers.length === 0 && (
                            <tr>
                                <td colSpan="6" className="text-center py-5">
                                    <div className="d-flex flex-column align-items-center justify-content-center text-muted">
                                        <div className="fs-1 mb-2">📥</div>
                                        <h5 className="fw-normal mb-1">Queue is Empty</h5>
                                        <p className="mb-0 text-secondary">No manager accounts found in the system right now.</p>
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

export default ModeratorVerification;