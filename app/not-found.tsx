import { Metadata } from 'next';
import { NotFoundPage } from '../components/NotFoundPage';

export const metadata: Metadata = {
    title: "Page Not Found | IntraWeb Technologies",
    description: "The page you're looking for doesn't exist or has been moved."
};

export default function NotFound() {
    return <NotFoundPage />;
}
