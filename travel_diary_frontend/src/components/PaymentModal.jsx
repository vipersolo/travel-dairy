import { useState, useEffect } from 'react';
import { Modal, Button, Spinner, Alert } from 'react-bootstrap';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import api from '../services/api';

// Put your public test key here
const stripePublicKey = import.meta.env.VITE_STRIPE_PUBLIC_KEY || "pk_test_51TYlajCZYVfTY1VlZx8q0jusnQvyd7rl2K6KNp3x8IVaz9GkvnYjgc8wStCLNzIIAqzxQnVqHByXPfTTDbZFuVsU000WkpffSF";
const stripePromise = loadStripe(stripePublicKey);

const CheckoutForm = ({ booking, onSuccess }) => {
    const stripe = useStripe();
    const elements = useElements();
    const [clientSecret, setClientSecret] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        // Ask Django for the secure payment secret
        api.post(`travel/bookings/${booking.id}/create_payment_intent/`)
            .then(res => setClientSecret(res.data.client_secret))
            .catch(err => setError("Failed to initialize payment."));
    }, [booking.id]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!stripe || !elements || !clientSecret) return;

        setIsProcessing(true);
        
        // 1. Send credit card data securely to Stripe
        const result = await stripe.confirmCardPayment(clientSecret, {
            payment_method: { card: elements.getElement(CardElement) }
        });

        if (result.error) {
            setError(result.error.message);
            setIsProcessing(false);
        } else if (result.paymentIntent.status === 'succeeded') {
            // 2. Tell Django the payment succeeded
            await api.post(`travel/bookings/${booking.id}/confirm_payment/`);
            onSuccess();
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            {error && <Alert variant="danger">{error}</Alert>}
            <div className="p-3 border rounded mb-4 bg-light">
                <CardElement options={{ style: { base: { fontSize: '16px' } } }} />
            </div>
            <Button type="submit" variant="success" className="w-100" disabled={!stripe || isProcessing}>
                {isProcessing ? <Spinner size="sm" animation="border" /> : `Pay $${booking.total_amount}`}
            </Button>
        </form>
    );
};

const PaymentModal = ({ show, onHide, booking, onPaymentSuccess }) => {
    return (
        <Modal show={show} onHide={onHide} centered>
            <Modal.Header closeButton>
                <Modal.Title>Secure Checkout</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <p className="text-muted">You are paying for Order #{booking?.id}</p>
                {booking && (
                    <Elements stripe={stripePromise}>
                        <CheckoutForm booking={booking} onSuccess={onPaymentSuccess} />
                    </Elements>
                )}
            </Modal.Body>
        </Modal>
    );
};

export default PaymentModal;