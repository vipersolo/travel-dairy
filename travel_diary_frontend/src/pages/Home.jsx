import { Container, Row, Col, Button, Card } from "react-bootstrap";
import { Link } from "react-router-dom";

const featureCardStyle = {
  border: "none",
  borderRadius: "22px",
  background: "rgba(255,255,255,0.92)",
  backdropFilter: "blur(10px)",
  boxShadow: "0 15px 40px rgba(0,0,0,0.08)",
  transition: "all .35s ease",
};

const Home = () => {
  return (
    <div className="home-page">
      {/* Hero */}
      <section
        className="d-flex align-items-center text-white position-relative overflow-hidden"
        style={{
          minHeight: "82vh",
          marginTop: "-24px",
          marginBottom: "5rem",
          borderRadius: "0 0 40px 40px",
          backgroundImage:
            "linear-gradient(135deg, rgba(15,23,42,.82), rgba(37,99,235,.65)), url(https://source.unsplash.com/1600x900/?travel,landscape)",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <Container className="text-center">
          <span
            className="px-3 py-2 rounded-pill fw-semibold"
            style={{
              background: "rgba(255,255,255,.15)",
              backdropFilter: "blur(8px)",
            }}
          >
            ✈️ AI Powered Travel Planning
          </span>

          <h1
            className="display-2 fw-bold mt-4"
            style={{ lineHeight: 1.1 }}
          >
            Discover Your Next
            <br />
            Dream Destination
          </h1>

          <p
            className="lead mx-auto mt-4 mb-5"
            style={{
              maxWidth: "760px",
              fontSize: "1.25rem",
              opacity: ".92",
            }}
          >
            Plan, budget and book unforgettable journeys with intelligent
            recommendations, real-time estimates and secure booking—all from
            one beautiful platform.
          </p>

          <div className="d-flex justify-content-center gap-3 flex-wrap">
            <Button
              as={Link}
              to="/destinations"
              size="lg"
              className="rounded-pill px-5 py-3 fw-bold border-0"
              style={{
                background:
                  "linear-gradient(135deg,#4f46e5,#2563eb)",
                boxShadow: "0 12px 30px rgba(37,99,235,.35)",
              }}
            >
              Explore Destinations
            </Button>

            <Button
              as={Link}
              to="/login"
              variant="light"
              size="lg"
              className="rounded-pill px-5 py-3 fw-bold"
            >
              Sign In
            </Button>
          </div>
        </Container>
      </section>

      {/* Features */}
      <Container className="py-5">
        <div className="text-center mb-5">
          <h2 className="fw-bold display-5">Why Choose Travel Diary?</h2>
          <p className="text-secondary fs-5">
            Everything you need for a seamless travel experience.
          </p>
        </div>

        <Row className="g-4">
          {[
            {
              icon: "🤖",
              title: "AI Recommendations",
              text:
                "Smart destination suggestions tailored to your interests and travel style.",
            },
            {
              icon: "💰",
              title: "Live Budget Estimation",
              text:
                "Instantly calculate trip costs with accurate real-time estimates.",
            },
            {
              icon: "🏨",
              title: "Secure Booking",
              text:
                "Book trusted accommodations and curated tour packages with confidence.",
            },
          ].map((item) => (
            <Col md={4} key={item.title}>
              <Card
                className="h-100 text-center p-4"
                style={featureCardStyle}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform =
                    "translateY(-10px)";
                  e.currentTarget.style.boxShadow =
                    "0 25px 50px rgba(37,99,235,.15)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow =
                    "0 15px 40px rgba(0,0,0,.08)";
                }}
              >
                <Card.Body>
                  <div className="display-3 mb-4">{item.icon}</div>
                  <Card.Title className="fw-bold fs-3">
                    {item.title}
                  </Card.Title>
                  <Card.Text className="text-secondary mt-3">
                    {item.text}
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </Container>

      {/* CTA */}
      <Container className="pb-5">
        <div
          className="text-center text-white p-5"
          style={{
            borderRadius: "28px",
            background:
              "linear-gradient(135deg,#1e3a8a,#2563eb,#4f46e5)",
            boxShadow: "0 20px 50px rgba(37,99,235,.25)",
          }}
        >
          <h2 className="fw-bold mb-3">
            Ready for Your Next Adventure?
          </h2>

          <p
            className="mx-auto mb-4"
            style={{ maxWidth: "650px", opacity: ".9" }}
          >
            Join thousands of travelers using Travel Diary to discover,
            organize and experience unforgettable journeys.
          </p>

          <div className="d-flex justify-content-center gap-3 flex-wrap">
            <Button
              as={Link}
              to="/destinations"
              variant="light"
              size="lg"
              className="rounded-pill px-4 fw-bold"
            >
              Browse Destinations
            </Button>

            <Button
              as={Link}
              to="/login"
              variant="outline-light"
              size="lg"
              className="rounded-pill px-4 fw-bold"
            >
              Sign In
            </Button>
          </div>
        </div>
      </Container>
    </div>
  );
};

export default Home;
