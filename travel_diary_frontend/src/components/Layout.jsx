import Navigation from './Navigation';
import { Container } from 'react-bootstrap';

const Layout = ({ children }) => {
    return (
        <>
            <Navigation />
            <Container>
                {children}
            </Container>
        </>
    );
};

export default Layout;