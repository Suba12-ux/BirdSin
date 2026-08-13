import { useNavigate } from 'react-router-dom';
import { NewsForm } from '../components/NewsForm';

/**
 * NewNews — отдельная страница для создания новости.
 * После публикации возвращаемся на главную (ленту новостей).
 */
export function NewNews() {
  const navigate = useNavigate();

  const handleCreated = () => {
    navigate('/');
  };

  return (
    <div className="page news-page">
      <div className="page__container page__container--wide">
        <h1 className="page__title">Новая новость</h1>
        <p className="page__subtitle">
          Расскажите, что у вас происходит
        </p>

        <div className="glass-card">
          <NewsForm onCreated={handleCreated} />
        </div>
      </div>
    </div>
  );
}
