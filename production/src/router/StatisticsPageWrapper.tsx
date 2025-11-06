import { StatisticsPage } from '../components/StatisticsPage';
import { useNavigate } from 'react-router-dom';

/**
 * Wrapper pour StatisticsPage avec navigation
 * Suit le pattern standard de l'app
 */
export function StatisticsPageWrapper() {
  const navigate = useNavigate();
  
  const handleNavigateBack = () => {
    navigate('/');
  };
  
  return (
    <StatisticsPage
      onNavigateBack={handleNavigateBack}
    />
  );
}
