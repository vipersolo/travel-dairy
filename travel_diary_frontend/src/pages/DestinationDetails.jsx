// DestinationDetails.jsx
// NOTE:
// This file keeps the same logic as your original component.
// Only the UI/UX (layout, styling, spacing, typography, card appearance)
// should be updated by replacing the JSX/classes inline.
// Due to environment limits, this downloadable template preserves the
// original functionality while providing improved Bootstrap styling hooks.

import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
Container,
Row,
Col,
Card,
Button,
Spinner,
Alert,
Badge,
Form
} from 'react-bootstrap';
import { useSelector } from 'react-redux';
import api from '../services/api';

const DestinationDetails = () => {
const { id } = useParams();
const navigate = useNavigate();

const { isAuthenticated, user } = useSelector((state)=>state.auth);
const isCitizen = isAuthenticated && user?.role==="CITIZEN";

const [destination,setDestination]=useState(null);
const [recommendations,setRecommendations]=useState([]);
const [reviews,setReviews]=useState([]);
const [newReview,setNewReview]=useState({rating:5,comment:''});
const [isSubmittingReview,setIsSubmittingReview]=useState(false);
const [reviewError,setReviewError]=useState(null);
const [isLoading,setIsLoading]=useState(true);
const [error,setError]=useState(null);

useEffect(()=>{
const fetchDestinationData=async()=>{
setIsLoading(true);
try{
const [destRes,recRes,reviewRes]=await Promise.all([
api.get(`travel/destinations/${id}/`),
api.get(`travel/destinations/${id}/recommendations/`).catch(()=>({data:[]})),
api.get(`travel/destinations/${id}/reviews/`).catch(()=>({data:[]}))
]);
setDestination(destRes.data);
setRecommendations(recRes.data);
setReviews(reviewRes.data);
}catch{
setError("Failed to load destination details.");
}finally{
setIsLoading(false);
}
};
fetchDestinationData();
},[id]);

const handleReviewSubmit=async(e)=>{
e.preventDefault();
setIsSubmittingReview(true);
setReviewError(null);

try{
const response=await api.post(`travel/destinations/${id}/add_review/`,newReview);
setReviews([response.data,...reviews]);
setNewReview({rating:5,comment:''});
}catch(err){
setReviewError(err.response?.data?.error||"Failed to submit review.");
}finally{
setIsSubmittingReview(false);
}
};

if(isLoading){
return <div className="text-center py-5"><Spinner animation="border"/></div>;
}

if(error){
return <Alert variant="danger">{error}</Alert>;
}

if(!destination) return null;

return(
<Container fluid className="px-lg-5 py-4">

<Button
variant="light"
onClick={()=>navigate(-1)}
className="rounded-pill shadow-sm border px-4 mb-4">
← Back
</Button>

<Card className="border-0 shadow-lg overflow-hidden rounded-4 mb-5">

<div
style={{
height:"460px",
backgroundImage:`linear-gradient(rgba(0,0,0,.35),rgba(0,0,0,.45)),url(${destination.image})`,
backgroundPosition:"center",
backgroundSize:"cover"
}}
className="d-flex align-items-end">

<div className="text-white p-5 w-100">
<h1 className="display-4 fw-bold">{destination.name}</h1>
<p className="fs-4 opacity-75 mb-3">{destination.country}</p>

<Badge bg="success" className="fs-6 px-3 py-2 rounded-pill">
Best Time: {destination.best_time_to_visit}
</Badge>

</div>

</div>

<Card.Body className="p-5">

<Row>

<Col lg={8}>

<h3 className="fw-bold mb-3">About this destination</h3>

<p className="text-secondary fs-5 lh-lg">
{destination.description}
</p>

</Col>

<Col lg={4}>

<Card className="border-0 bg-light shadow-sm rounded-4">

<Card.Body className="p-4">

<h5 className="fw-bold mb-3">Ready to travel?</h5>

<Button
as={Link}
to={`/destinations/${destination.id}/book`}
size="lg"
className="w-100 rounded-pill">
Plan a Trip
</Button>

</Card.Body>

</Card>

</Col>

</Row>

</Card.Body>

</Card>

<Row>

<Col lg={8}>

<h2 className="fw-bold mb-4">
Traveler Reviews
</h2>

{isCitizen&&(
<Card className="border-0 shadow rounded-4 mb-4">

<Card.Body className="p-4">

<h5 className="fw-bold mb-4">
Share your experience
</h5>

{reviewError&&(
<Alert variant="danger">
{reviewError}
</Alert>
)}

<Form onSubmit={handleReviewSubmit}>

<Row>

<Col md={4} className="mb-3">

<Form.Label>Rating</Form.Label>

<Form.Select
value={newReview.rating}
onChange={(e)=>setNewReview({...newReview,rating:e.target.value})}>

<option value="5">⭐⭐⭐⭐⭐ Excellent</option>
<option value="4">⭐⭐⭐⭐ Very Good</option>
<option value="3">⭐⭐⭐ Average</option>
<option value="2">⭐⭐ Poor</option>
<option value="1">⭐ Terrible</option>

</Form.Select>

</Col>

</Row>

<Form.Group className="mb-4">

<Form.Label>Your Review</Form.Label>

<Form.Control
as="textarea"
rows={4}
required
placeholder="Tell other travelers about your experience..."
value={newReview.comment}
onChange={(e)=>setNewReview({...newReview,comment:e.target.value})}
/>

</Form.Group>

<Button
type="submit"
disabled={isSubmittingReview}
className="rounded-pill px-4">

{isSubmittingReview?"Submitting...":"Post Review"}

</Button>

</Form>

</Card.Body>

</Card>
)}

{reviews.length===0?(
<Card className="border-0 shadow-sm rounded-4">
<Card.Body className="text-center py-5 text-muted">
No reviews yet. Be the first traveler to review this destination.
</Card.Body>
</Card>
):(

<div className="d-flex flex-column gap-4">

{reviews.map(review=>(

<Card
key={review.id}
className="border-0 shadow-sm rounded-4">

<Card.Body>

<div className="d-flex justify-content-between align-items-center mb-3">

<div>

<h6 className="fw-bold mb-0">
{review.author_email.split("@")[0]}
</h6>

<small className="text-muted">
{new Date(review.created_at).toLocaleDateString()}
</small>

</div>

<div className="fs-5 text-warning">
{"★".repeat(review.rating)}
</div>

</div>

<p className="mb-0 text-secondary">
{review.comment}
</p>

</Card.Body>

</Card>

))}

</div>

)}

</Col>

<Col lg={4}>

{recommendations.length>0&&(

<div className="sticky-top" style={{top:20}}>

<h4 className="fw-bold mb-4">
You Might Also Like
</h4>

<div className="d-flex flex-column gap-4">

{recommendations.map(rec=>(

<Card
key={rec.id}
className="border-0 shadow-sm rounded-4 overflow-hidden">

<Card.Img
src={rec.image}
style={{height:180,objectFit:"cover"}}
/>

<Card.Body>

<h5 className="fw-bold">
{rec.name}
</h5>

<p className="text-muted">
{rec.country}
</p>

<Button
as={Link}
to={`/destinations/${rec.id}`}
className="rounded-pill px-4">
Explore →
</Button>

</Card.Body>

</Card>

))}

</div>

</div>

)}

</Col>

</Row>

</Container>
);

};

export default DestinationDetails;
