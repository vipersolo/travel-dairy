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

    if (isLoading) return <Spinner animation="border" className="d-block mx-auto mt-5" />;

    return (
        <Container fluid className="px-0">
            <h2 className="mb-4">Business Verification Queue</h2>
            <p className="text-muted mb-4">
                Review newly registered business accounts. Managers cannot list inventory until they are verified.
            </p>

            {error && <Alert variant="danger">{error}</Alert>}

            <Card className="shadow-sm border-0">
                <Table responsive hover className="mb-0">
                    <thead className="bg-light">
                        <tr>
                            <th>ID</th>
                            <th>Company Name</th>
                            <th>Manager Email</th>
                            <th>Registration Date</th>
                            <th>Current Status</th>
                            <th className="text-end">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {managers.map((manager) => (
                            <tr key={manager.id} className="align-middle">
                                <td><small className="text-muted">#{manager.id}</small></td>
                                <td><strong>{manager.company_name}</strong></td>
                                <td>{manager.email}</td>
                                <td>
                                    {new Date(manager.date_joined).toLocaleDateString()}
                                </td>
                                <td>
                                    {manager.is_verified ? (
                                        <Badge bg="success">Verified</Badge>
                                    ) : (
                                        <Badge bg="warning" text="dark">Pending Review</Badge>
                                    )}
                                </td>
                                <td className="text-end">
                                    <Button 
                                        variant={manager.is_verified ? "outline-danger" : "outline-success"} 
                                        size="sm"
                                        onClick={() => handleToggleVerification(manager.id)}
                                        disabled={processingId === manager.id}
                                    >
                                        {processingId === manager.id ? (
                                            <Spinner size="sm" animation="border" />
                                        ) : manager.is_verified ? (
                                            'Revoke Access'
                                        ) : (
                                            'Approve Business'
                                        )}
                                    </Button>
                                </td>
                            </tr>
                        ))}

                        {managers.length === 0 && (
                            <tr>
                                <td colSpan="6" className="text-center py-5 text-muted">
                                    No manager accounts found in the system.
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