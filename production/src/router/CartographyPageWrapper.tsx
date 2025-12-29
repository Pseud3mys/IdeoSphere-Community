import { CartographyPage } from '../components/CartographyPage';
import { useNavigate } from 'react-router-dom';

/**
 * Wrapper pour CartographyPage avec navigation
 * Suit le pattern standard de l'app
 */
export function CartographyPageWrapper() {
  const navigate = useNavigate();
  
  const handleNavigateBack = () => {
    navigate('/');
  };
  
  return (
    <CartographyPage
      onNavigateBack={handleNavigateBack}
    />
  );
}
