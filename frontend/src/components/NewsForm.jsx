import { useRef, useState } from 'react';
import { newsAPI } from '../api/client';
import { getErrorMessage } from '../utils/errors';

/**
 * NewsForm — форма создания/редактирования новости (название, описание, фото).
 *
 * @param {Function} onCreated — колбэк после успешного создания
 * @param {Object} initialData — данные новости для редактирования (режим edit)
 * @param {Function} onUpdated — колбэк после успешного редактирования
 */
export function NewsForm({ onCreated, initialData = null, onUpdated }) {
  const fileInputRef = useRef(null);
  const isEdit = Boolean(initialData);
  const [title, setTitle] = useState(initialData?.news || '');
  const [text, setText] = useState(initialData?.text_news || '');
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(initialData?.image || null);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    setImage(file || null);
    setImagePreview(file ? URL.createObjectURL(file) : null);
  };

  const resetImage = () => {
    setImage(null);
    // В режиме редактирования возвращаем превью исходного фото
    setImagePreview(initialData?.image || null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !text.trim() || submitting) return;

    setSubmitting(true);
    setError(null);

    const formData = new FormData();
    formData.append('news', title.trim());
    formData.append('text_news', text.trim());
    if (image) formData.append('image', image);

    try {
      if (isEdit) {
        await newsAPI.update(initialData.id, formData);
        onUpdated?.(initialData.id);
      } else {
        await newsAPI.create(formData);
        setTitle('');
        setText('');
        resetImage();
        onCreated?.();
      }
    } catch (err) {
      setError(
        getErrorMessage(err, isEdit ? 'Не удалось сохранить изменения' : 'Не удалось опубликовать новость')
      );
    } finally {
      setSubmitting(false);
    }
  };

  const isSubmitDisabled = submitting || !title.trim() || !text.trim();

  return (
    <form className="form news-form" onSubmit={handleSubmit}>
      <div className="form__group">
        <label className="form__label" htmlFor="news-title">
          Название
        </label>
        <input
          id="news-title"
          className="form__input"
          type="text"
          maxLength={150}
          placeholder="Заголовок новости"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>

      <div className="form__group">
        <label className="form__label" htmlFor="news-text">
          Описание
        </label>
        <textarea
          id="news-text"
          className="form__input"
          rows={4}
          maxLength={450}
          placeholder="О чём хотите рассказать?"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
      </div>

      <div className="form__group">
        <label className="form__label" htmlFor="news-image">
          Фото (необязательно)
        </label>
        <div className="news-form__file-wrap">
          <input
            id="news-image"
            ref={fileInputRef}
            className="visually-hidden news-form__file"
            type="file"
            accept="image/*"
            onChange={handleImageChange}
          />
          <label
            htmlFor="news-image"
            className="btn btn--secondary btn--sm news-form__file-btn"
          >
            {image ? 'Заменить фото' : 'Выбрать фото'}
          </label>
          {image && (
            <span className="news-form__file-name truncate" title={image.name}>
              {image.name}
            </span>
          )}
        </div>
        {imagePreview && (
          <div className="news-form__preview">
            <img src={imagePreview} alt="Превью новости" />
            <button
              type="button"
              className="btn btn--danger btn--sm news-form__preview-remove"
              onClick={resetImage}
            >
              Убрать фото
            </button>
          </div>
        )}
      </div>

      {error && <div className="form__error">{error}</div>}

      <button type="submit" className="btn btn--primary" disabled={isSubmitDisabled}>
        {submitting
          ? (isEdit ? 'Сохранение...' : 'Публикация...')
          : (isEdit ? 'Сохранить' : 'Опубликовать')}
      </button>
    </form>
  );
}
