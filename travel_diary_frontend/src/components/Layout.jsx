import Navigation from './Navigation';
import { Container } from 'react-bootstrap';

const Layout = ({ children }) => {
    return (
        <>
            <Navigation />
            <Container fluid className="px-4 py-3">
                {children}
            </Container>
        </>
    );
};

export default Layout;